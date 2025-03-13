<!-- 
 Update  
-->




<template>
    <div class="coin-flip-container">
        <div class="balance-display">
            <i class="mdi mdi-wallet"></i>
            <span>Balance: {{ userBalance }} AIC</span>
        </div>

        <div class="coin" :class="{ 'flipping': isFlipping }">
            <div class="coin-inner">
                <div class="side heads">
                    <i class="mdi mdi-bitcoin"></i>
                </div>
                <div class="side tails">
                    <i class="mdi mdi-currency-eth"></i>
                </div>
            </div>
        </div>

        <div class="betting-controls">
            <div class="bet-amount">
                <button @click="decreaseBet" :disabled="isFlipping">-</button>
                <input type="number" v-model="betAmount" :disabled="isFlipping">
                <button @click="increaseBet" :disabled="isFlipping">+</button>
            </div>

            <div class="multiplier-choice">
                <button 
                    v-for="multiplier in multipliers" 
                    :key="multiplier.value"
                    @click="selectMultiplier(multiplier)"
                    :class="{ active: selectedMultiplier.value === multiplier.value }"
                    :disabled="isFlipping">
                    {{ multiplier.label }}
                    <small>({{ multiplier.chance }}% chance)</small>
                </button>
            </div>

            <div class="bet-choice">
                <button 
                    @click="placeBet('heads')" 
                    :class="{ active: selectedSide === 'heads' }"
                    :disabled="isFlipping">
                    Heads
                </button>
                <button 
                    @click="placeBet('tails')" 
                    :class="{ active: selectedSide === 'tails' }"
                    :disabled="isFlipping">
                    Tails
                </button>
            </div>

            <button 
                class="flip-button" 
                @click="flipCoin" 
                :disabled="!canFlip || isFlipping || cooldownActive">
                {{ cooldownActive ? `Wait ${cooldownTime}s` : `Flip Coin (${selectedMultiplier.label})` }}
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
import { doc, getDoc } from 'firebase/firestore';
import { updateCoinBalance } from '../models/userModel';
import { updateDoc, increment } from 'firebase/firestore';

export default {
    name: 'CoinFlip',
    setup() {
        const userBalance = ref(0);
        const betAmount = ref(10);
        const selectedSide = ref('');
        const isFlipping = ref(false);
        const result = ref('');
        const hasWon = ref(false);
        const selectedMultiplier = ref({
            value: 1.5,
            label: 'x1.5',
            chance: 50
        });
        const multipliers = [
            { value: 1.5, label: 'x1.5', chance: 50 },
            { value: 2, label: 'x2', chance: 30 },
            { value: 5, label: 'x5', chance: 15 },
            { value: 20, label: 'x20', chance: 0.5 }
        ];

        // Add new refs for cooldown
        const cooldownActive = ref(false);
        const cooldownTime = ref(0);
        const COOLDOWN_DURATION = 20; // 20 seconds cooldown

        // Modify canFlip computed
        const canFlip = computed(() => {
            return selectedSide.value && 
                   betAmount.value > 0 && 
                   betAmount.value <= userBalance.value &&
                   selectedMultiplier.value &&
                   !cooldownActive.value;
        });

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
                'gameStats.coinFlip.wins': increment(won ? 1 : 0),
                'gameStats.coinFlip.losses': increment(won ? 0 : 1),
                'gameStats.coinFlip.earnings': increment(won ? amount * 2 : -amount)
            });
        };

        const handleGameOutcome = async (won, amount) => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            if (won) {
                const winAmount = amount * selectedMultiplier.value.value;
                await updateCoinBalance(
                    userId, 
                    winAmount, 
                    `Won coin flip game (${selectedMultiplier.value.label})`
                );
                result.value = `You won ${winAmount} AIC!`;
                hasWon.value = true;
            } else {
                result.value = 'Better luck next time!';
                hasWon.value = false;
            }
            
            await updateGameStats(won, amount);
            await loadUserBalance();
        };

        // Add cooldown timer function
        const startCooldown = () => {
            cooldownActive.value = true;
            cooldownTime.value = COOLDOWN_DURATION;
            
            const timer = setInterval(() => {
                cooldownTime.value--;
                if (cooldownTime.value <= 0) {
                    cooldownActive.value = false;
                    clearInterval(timer);
                }
            }, 1000);
        };

        // Modify flipCoin function
        const flipCoin = async () => {
            if (!canFlip.value || cooldownActive.value) return;

            const userId = auth.currentUser?.uid;
            if (!userId) return;

            isFlipping.value = true;
            result.value = '';
            
            try {
                await updateCoinBalance(
                    userId, 
                    -betAmount.value, 
                    'Coin flip game bet'
                );
                await loadUserBalance();

                // Calculate outcome based on selected multiplier
                const winChance = Math.random() * 100;
                const willWin = winChance <= selectedMultiplier.value.chance;

                // Determine the outcome based on win chance
                const outcome = willWin ? selectedSide.value : (selectedSide.value === 'heads' ? 'tails' : 'heads');
                
                // Add dynamic rotation based on outcome
                const coin = document.querySelector('.coin');
                const rotations = 5; // Number of full rotations
                const finalRotation = outcome === 'heads' ? 0 : 180;
                const totalDegrees = (rotations * 360) + finalRotation;
                
                coin.style.transition = 'transform 2s ease-out';
                coin.style.transform = `rotateY(${totalDegrees}deg)`;

                // Handle game outcome after animation
                setTimeout(async () => {
                    await handleGameOutcome(willWin, betAmount.value);
                    isFlipping.value = false;
                    selectedSide.value = '';
                    startCooldown(); // Start cooldown here
                    
                    // Reset coin rotation after animation
                    setTimeout(() => {
                        coin.style.transition = 'none';
                        coin.style.transform = 'rotateY(0deg)';
                    }, 100);
                }, 2000);
            } catch (error) {
                console.error('Error during coin flip:', error);
                result.value = 'An error occurred. Please try again.';
                isFlipping.value = false;
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

        const placeBet = (side) => {
            selectedSide.value = side;
        };

        const selectMultiplier = (multiplier) => {
            selectedMultiplier.value = multiplier;
        };

        // Load initial balance
        loadUserBalance();

        return {
            userBalance,
            betAmount,
            selectedSide,
            isFlipping,
            result,
            hasWon,
            canFlip,
            increaseBet,
            decreaseBet,
            placeBet,
            flipCoin,
            selectedMultiplier,
            multipliers,
            selectMultiplier,
            cooldownActive,
            cooldownTime
        };
    }
}
</script>

<style scoped>
.coin-flip-container {
    padding: 20px;
    text-align: center;
}

.balance-display {
    font-size: 1.5rem;
    color: #0ff;
    margin-bottom: 20px;
}

.coin {
    width: 200px;
    height: 200px;
    margin: 50px auto;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 2s ease-out;
}

.coin-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
}

.side {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
}

.heads {
    background: linear-gradient(45deg, #0ff, #00b3b3);
    color: #000;
}

.tails {
    background: linear-gradient(45deg, #00b3b3, #008080);
    color: #000;
    transform: rotateY(180deg);
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

.bet-choice {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
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

button.active {
    background: #0ff;
    color: #000;
}

.flip-button {
    background: linear-gradient(45deg, #0ff, #00b3b3);
    color: #000;
    font-weight: bold;
    padding: 15px 30px;
    min-width: 200px;
    transition: all 0.3s ease;
}

.flip-button:disabled {
    background: linear-gradient(45deg, #666, #444);
    opacity: 0.7;
    cursor: not-allowed;
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

@keyframes flip {
    0% { transform: rotateY(0); }
    100% { transform: rotateY(720deg); }
}

@media (max-width: 768px) {
    .coin {
        width: 150px;
        height: 150px;
    }
}

.multiplier-choice {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
    padding: 0 20px;
}

.multiplier-choice button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
}

.multiplier-choice button small {
    font-size: 0.8em;
    opacity: 0.7;
    margin-top: 5px;
}

.multiplier-choice button.active {
    background: #0ff;
    color: #000;
}
</style>