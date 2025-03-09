<template>
    <div class="spin-wheel-container">
        <div class="balance-display">
            <i class="mdi mdi-wallet"></i>
            <span>Balance: {{ userBalance }} AIC</span>
        </div>

        <div class="wheel-container">
            <div class="wheel" :style="wheelStyle">
                <div v-for="(segment, index) in segments" 
                    :key="index" 
                    class="wheel-segment"
                    :style="getSegmentStyle(index)">
                    {{ segment.value }}x
                </div>
            </div>
            <div class="pointer"></div>
        </div>

        <div class="betting-controls">
            <div class="bet-amount">
                <button @click="decreaseBet" :disabled="isSpinning">-</button>
                <input type="number" v-model="betAmount" :disabled="isSpinning">
                <button @click="increaseBet" :disabled="isSpinning">+</button>
            </div>

            <button 
                class="spin-button" 
                @click="spinWheel" 
                :disabled="!canSpin || isSpinning">
                Spin Wheel
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
import { ref, computed } from 'vue';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { updateCoinBalance } from '../models/userModel';

export default {
    name: 'SpinWheel',
    setup() {
        const userBalance = ref(0);
        const betAmount = ref(10);
        const isSpinning = ref(false);
        const result = ref('');
        const hasWon = ref(false);
        const wheelRotation = ref(0);

        const segments = [
            { value: 0, chance: 30 },
            { value: 1.5, chance: 25 },
            { value: 2, chance: 20 },
            { value: 3, chance: 15 },
            { value: 5, chance: 8 },
            { value: 10, chance: 2 }
        ];

        const wheelStyle = computed(() => ({
            transform: `rotate(${wheelRotation.value}deg)`
        }));

        const canSpin = computed(() => {
            return betAmount.value > 0 && 
                   betAmount.value <= userBalance.value &&
                   !isSpinning.value;
        });

        const getSegmentStyle = (index) => {
            const rotate = (360 / segments.length) * index;
            return {
                transform: `rotate(${rotate}deg)`,
                'background-image': `linear-gradient(${rotate}deg, #0ff, #008080)`
            };
        };

        const loadUserBalance = async () => {
            const userId = auth.currentUser?.uid;
            if (userId) {
                const userDoc = await getDoc(doc(db, 'users', userId));
                userBalance.value = userDoc.data()?.coinBalance || 0;
            }
        };

        const updateGameStats = async (won, amount, multiplier) => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;
            
            const userDoc = doc(db, 'users', userId);
            await updateDoc(userDoc, {
                'gameStats.spinWheel.wins': increment(won ? 1 : 0),
                'gameStats.spinWheel.losses': increment(won ? 0 : 1),
                'gameStats.spinWheel.earnings': increment(won ? amount * multiplier : -amount)
            });
        };

        const handleSpinResult = async (multiplier) => {
            const won = multiplier > 0;
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            if (won) {
                const winAmount = betAmount.value * multiplier;
                await updateCoinBalance(
                    userId, 
                    winAmount, 
                    `Won spin wheel (${multiplier}x)`
                );
                result.value = `You won ${winAmount} AIC!`;
                hasWon.value = true;
            } else {
                result.value = 'Better luck next time!';
                hasWon.value = false;
            }
            
            await updateGameStats(won, betAmount.value, multiplier);
            await loadUserBalance();
        };

        const spinWheel = async () => {
            if (!canSpin.value) return;

            const userId = auth.currentUser?.uid;
            if (!userId) return;

            isSpinning.value = true;
            result.value = '';
            
            try {
                await updateCoinBalance(
                    userId, 
                    -betAmount.value, 
                    'Spin wheel bet'
                );
                await loadUserBalance();

                // Determine outcome based on segment chances
                const rand = Math.random() * 100;
                let accumulatedChance = 0;
                let selectedSegment;

                for (const segment of segments) {
                    accumulatedChance += segment.chance;
                    if (rand <= accumulatedChance) {
                        selectedSegment = segment;
                        break;
                    }
                }

                // Calculate rotation to land on selected segment
                const segmentIndex = segments.indexOf(selectedSegment);
                const baseRotation = 1440; // 4 full spins
                const segmentRotation = (360 / segments.length) * segmentIndex;
                const finalRotation = baseRotation + segmentRotation;

                // Animate wheel
                wheelRotation.value = finalRotation;

                setTimeout(async () => {
                    await handleSpinResult(selectedSegment.value);
                    isSpinning.value = false;
                }, 4000);
            } catch (error) {
                console.error('Error during wheel spin:', error);
                result.value = 'An error occurred. Please try again.';
                isSpinning.value = false;
            }
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

        // Load initial balance
        loadUserBalance();

        return {
            userBalance,
            betAmount,
            isSpinning,
            result,
            hasWon,
            wheelRotation,
            segments,
            wheelStyle,
            canSpin,
            increaseBet,
            decreaseBet,
            spinWheel,
            getSegmentStyle
        };
    }
}
</script>

<style scoped>
.spin-wheel-container {
    padding: 20px;
    text-align: center;
    padding-bottom: 100px;
}

.balance-display {
    font-size: 1.5rem;
    color: #0ff;
    margin-bottom: 20px;
}

.wheel-container {
    position: relative;
    width: 300px;
    height: 300px;
    margin: 50px auto;
}

.wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
    transform-origin: center;
}

.wheel-segment {
    position: absolute;
    width: 50%;
    height: 50%;
    transform-origin: 100% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #fff;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.pointer {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-top: 40px solid rgb(255, 0, 0);
    z-index: 1;
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

.spin-button {
    background: linear-gradient(45deg, #0ff, #00b3b3);
    color: #000;
    font-weight: bold;
    padding: 15px 30px;
    font-size: 1.2rem;
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
    .wheel-container {
        width: 250px;
        height: 250px;
    }

    .wheel-segment {
        font-size: 1.2rem;
    }
}
</style>