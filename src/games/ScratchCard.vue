<template>
    <div class="scratch-card-container">
        <div class="balance-display">
            <i class="mdi mdi-wallet"></i>
            <span>Balance: {{ userBalance }} AIC</span>
        </div>

        <div class="scratch-area" ref="scratchArea" 
            :style="{ opacity: isScratching ? 1 : 0.7 }"
            @mousedown="startScratching"
            @mousemove="scratch"
            @mouseup="stopScratching"
            @touchstart="startScratching"
            @touchmove="scratch"
            @touchend="stopScratching">
            <canvas ref="canvas" :width="300" :height="300"></canvas>
            <div class="prize" :class="{ 'revealed': isRevealed }">
                {{ prizeAmount }} AIC
            </div>
        </div>

        <div class="betting-controls">
            <div class="bet-amount">
                <button @click="decreaseBet" :disabled="isScratching || cooldownActive">-</button>
                <input type="number" v-model="betAmount" :disabled="isScratching || cooldownActive">
                <button @click="increaseBet" :disabled="isScratching || cooldownActive">+</button>
            </div>

            <button class="scratch-button" 
                @click="startGame" 
                :disabled="!canPlay || isScratching || cooldownActive">
                {{ cooldownActive ? `Next card available in ${formatTime(cooldownTime)}` : 'Buy Scratch Card' }}
            </button>
        </div>

        <div class="result" v-if="result">
            <p :class="{ 'win': hasWon, 'lose': !hasWon }">
                {{ result }}
            </p>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp, Timestamp, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { updateCoinBalance } from '../models/userModel';

export default {
    name: 'ScratchCard',
    setup() {
        const userBalance = ref(0);
        const betAmount = ref(10);
        const isScratching = ref(false);
        const isRevealed = ref(false);
        const result = ref('');
        const hasWon = ref(false);
        const prizeAmount = ref(0);
        const canvas = ref(null);
        const scratchArea = ref(null);
        const ctx = ref(null);
        const lastPos = ref({ x: 0, y: 0 });

        // Cooldown related refs
        const cooldownActive = ref(false);
        const cooldownTime = ref(0);
        const COOLDOWN_DURATION = 2 * 60 * 60; // 2 hours in seconds

        const timerInterval = ref(null);

        // Add new refs for Firestore cooldown
        const cooldownDoc = ref(null);
        const unsubscribeCooldown = ref(null);

        const multipliers = [
            { value: 0, chance: 40 },
            { value: 1.5, chance: 30 },
            { value: 2, chance: 20 },
            { value: 5, chance: 8 },
            { value: 10, chance: 2 }
        ];

        const canPlay = computed(() => {
            return betAmount.value > 0 && 
                   betAmount.value <= userBalance.value &&
                   !cooldownActive.value;
        });

        const formatTime = (seconds) => {
            if (!seconds) return '0h 0m 0s';
            
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            
            return `${hours}h ${minutes}m ${secs}s`;
        };

        const loadUserBalance = async () => {
            const userId = auth.currentUser?.uid;
            if (userId) {
                const userDoc = await getDoc(doc(db, 'users', userId));
                userBalance.value = userDoc.data()?.coinBalance || 0;
            }
        };

        const updateGameStats = async (won, amount) => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;
            
            const userDoc = doc(db, 'users', userId);
            await updateDoc(userDoc, {
                'gameStats.scratchCard.wins': increment(won ? 1 : 0),
                'gameStats.scratchCard.losses': increment(won ? 0 : 1),
                'gameStats.scratchCard.earnings': increment(won ? amount * 2 : -amount)
            });
        };

        const startCooldown = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            try {
                const cooldownRef = doc(db, 'cooldowns', `scratchCard_${userId}`);
                const endTime = Timestamp.fromDate(new Date(Date.now() + COOLDOWN_DURATION * 1000));
                
                await setDoc(cooldownRef, {
                    userId,
                    gameType: 'scratchCard',
                    startTime: serverTimestamp(),
                    endTime: endTime
                });

                cooldownActive.value = true;
                startLocalTimer(endTime.toMillis());
            } catch (error) {
                console.error('Error starting cooldown:', error);
            }
        };

        const startLocalTimer = (endTimeMillis) => {
            if (timerInterval.value) {
                clearInterval(timerInterval.value);
            }

            const updateTimer = () => {
                const now = Date.now();
                const remaining = Math.max(0, endTimeMillis - now);
                
                if (remaining <= 0) {
                    cooldownActive.value = false;
                    cooldownTime.value = 0;
                    clearInterval(timerInterval.value);
                    return;
                }
                
                cooldownTime.value = Math.floor(remaining / 1000);
            };

            updateTimer(); // Update immediately
            timerInterval.value = setInterval(updateTimer, 1000);
        };

        const checkStoredCooldown = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            try {
                const cooldownRef = doc(db, 'cooldowns', `scratchCard_${userId}`);
                
                // Set up real-time listener
                unsubscribeCooldown.value = onSnapshot(cooldownRef, (snapshot) => {
                    if (!snapshot.exists()) {
                        cooldownActive.value = false;
                        cooldownTime.value = 0;
                        return;
                    }

                    const data = snapshot.data();
                    const endTime = data.endTime.toMillis();
                    const now = Date.now();
                    const remaining = endTime - now;

                    if (remaining <= 0) {
                        cooldownActive.value = false;
                        cooldownTime.value = 0;
                        // Clean up expired cooldown
                        deleteDoc(cooldownRef).catch(console.error);
                    } else {
                        cooldownActive.value = true;
                        startLocalTimer(endTime);
                    }
                });
            } catch (error) {
                console.error('Error checking cooldown:', error);
            }
        };

        const initCanvas = () => {
            if (!canvas.value) return;
            ctx.value = canvas.value.getContext('2d');
            ctx.value.fillStyle = '#808080';
            ctx.value.fillRect(0, 0, 300, 300);
        };

        const startScratching = (e) => {
            isScratching.value = true;
            const pos = getPosition(e);
            lastPos.value = pos;
        };

        const scratch = (e) => {
            if (!isScratching.value) return;
            e.preventDefault();

            const pos = getPosition(e);
            ctx.value.globalCompositeOperation = 'destination-out';
            ctx.value.lineWidth = 40;
            ctx.value.lineCap = 'round';
            ctx.value.beginPath();
            ctx.value.moveTo(lastPos.value.x, lastPos.value.y);
            ctx.value.lineTo(pos.x, pos.y);
            ctx.value.stroke();
            lastPos.value = pos;

            // Check if enough area is scratched
            const imageData = ctx.value.getImageData(0, 0, 300, 300);
            const pixels = imageData.data;
            let transparent = 0;
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) transparent++;
            }
            
            if (transparent / (pixels.length / 4) > 0.5) {
                revealPrize();
            }
        };

        const getPosition = (e) => {
            const rect = canvas.value.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            return { x, y };
        };

        const stopScratching = () => {
            isScratching.value = false;
        };

        const startGame = async () => {
            if (!canPlay.value) return;

            const userId = auth.currentUser?.uid;
            if (!userId) return;

            try {
                await updateCoinBalance(userId, -betAmount.value, 'Scratch card purchase');
                await loadUserBalance();

                // Determine prize
                const rand = Math.random() * 100;
                let accumulatedChance = 0;
                let selectedMultiplier;

                for (const multiplier of multipliers) {
                    accumulatedChance += multiplier.chance;
                    if (rand <= accumulatedChance) {
                        selectedMultiplier = multiplier;
                        break;
                    }
                }

                prizeAmount.value = betAmount.value * selectedMultiplier.value;
                initCanvas();
                isRevealed.value = false;
                result.value = '';

            } catch (error) {
                console.error('Error starting game:', error);
                result.value = 'An error occurred. Please try again.';
            }
        };

        const revealPrize = async () => {
            if (isRevealed.value) return;
            isRevealed.value = true;

            const won = prizeAmount.value > 0;
            const userId = auth.currentUser?.uid;
            
            if (won) {
                await updateCoinBalance(
                    userId,
                    prizeAmount.value,
                    `Won scratch card (${prizeAmount.value} AIC)`
                );
                result.value = `You won ${prizeAmount.value} AIC!`;
                hasWon.value = true;
            } else {
                result.value = 'Better luck next time!';
                hasWon.value = false;
            }

            await updateGameStats(won, betAmount.value);
            await loadUserBalance();
            startCooldown();
        };

        const increaseBet = () => {
            if (betAmount.value + 10 <= userBalance.value) {
                betAmount.value += 10;
            }
        };

        const decreaseBet = () => {
            if (betAmount.value >= 20) {
                betAmount.value -= 10;
            }
        };

        onMounted(() => {
            loadUserBalance();
            checkStoredCooldown();
        });

        onUnmounted(() => {
            if (timerInterval.value) {
                clearInterval(timerInterval.value);
            }
            if (unsubscribeCooldown.value) {
                unsubscribeCooldown.value();
            }
        });

        return {
            userBalance,
            betAmount,
            isScratching,
            isRevealed,
            result,
            hasWon,
            prizeAmount,
            canvas,
            scratchArea,
            canPlay,
            cooldownActive,
            cooldownTime,
            formatTime,
            increaseBet,
            decreaseBet,
            startGame,
            startScratching,
            scratch,
            stopScratching,
            checkStoredCooldown,
            startCooldown
        };
    }
}
</script>

<style scoped>
.scratch-card-container {
    padding: 20px;
    text-align: center;
}

.balance-display {
    font-size: 1.5rem;
    color: #0ff;
    margin-bottom: 20px;
}

.scratch-area {
    position: relative;
    width: 300px;
    height: 300px;
    margin: 50px auto;
    background: #1a1a1a;
    cursor: crosshair;
}

.scratch-area canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
}

.prize {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    color: #0ff;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    opacity: 0;
    transition: opacity 0.5s ease;
}

.prize.revealed {
    opacity: 1;
}

.betting-controls {
    margin-top: 20px;
}

.bet-amount {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.bet-amount input {
    width: 100px;
    text-align: center;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid #0ff;
    color: #fff;
    padding: 5px;
}

button {
    background: rgba(0, 255, 255, 0.2);
    border: 1px solid #0ff;
    color: #0ff;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover:not(:disabled) {
    background: rgba(0, 255, 255, 0.3);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.scratch-button {
    background: linear-gradient(45deg, #0ff, #00b3b3);
    color: #000;
    font-weight: bold;
    padding: 15px 30px;
    min-width: 200px;
}

.scratch-button:disabled {
    background: linear-gradient(45deg, #666, #444);
    opacity: 0.7;
}

.result {
    margin-top: 20px;
    font-size: 1.5rem;
}

.win {
    color: #0f0;
}

.lose {
    color: #f00;
}

@media (max-width: 768px) {
    .scratch-area {
        width: 250px;
        height: 250px;
    }
    
    .scratch-area canvas {
        width: 250px;
        height: 250px;
    }
}
</style>