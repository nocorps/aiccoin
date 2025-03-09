<template>
    <div class="number-guess-container">
        <div class="balance-display">
            <i class="mdi mdi-wallet"></i>
            <span>Balance: {{ userBalance }} AIC</span>
        </div>

        <div class="guess-display">
            <div class="number-range">
                <span>Range: 1-100</span>
            </div>
            <div class="target-number" :class="{ 'revealed': isRevealed }">
                {{ isRevealed ? targetNumber : '?' }}
            </div>
        </div>

        <div class="betting-controls">
            <div class="bet-amount">
                <button @click="decreaseBet" :disabled="isGuessing || cooldownActive">-</button>
                <input type="number" v-model="betAmount" :disabled="isGuessing || cooldownActive">
                <button @click="increaseBet" :disabled="isGuessing || cooldownActive">+</button>
            </div>

            <div class="multiplier-choice">
                <button 
                    v-for="range in ranges" 
                    :key="range.value"
                    @click="selectRange(range)"
                    :class="{ active: selectedRange.value === range.value }"
                    :disabled="isGuessing || cooldownActive">
                    {{ range.label }}
                    <small>({{ range.multiplier }}x)</small>
                </button>
            </div>

            <div class="guess-input">
                <div class="input-with-info">
                    <input 
                        type="number" 
                        v-model="userGuess" 
                        placeholder="Enter your guess"
                        min="1"
                        max="100"
                        :disabled="isGuessing || cooldownActive">
                    <div class="info-icon" @mouseenter="showTooltip" @mouseleave="hideTooltip">
                        <i class="mdi mdi-information"></i>
                        <div class="tooltip" v-show="tooltipVisible">
                            Enter a number between 1-100 to make your guess
                        </div>
                    </div>
                </div>
            </div>

            <button 
                class="guess-button" 
                @click="makeGuess" 
                :disabled="!canGuess || isGuessing || cooldownActive">
                {{ cooldownActive ? `Wait ${cooldownTime}s` : 'Make Guess' }}
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
    name: 'NumberGuess',
    setup() {
        const userBalance = ref(0);
        const betAmount = ref(10);
        const userGuess = ref('');
        const targetNumber = ref(0);
        const isGuessing = ref(false);
        const isRevealed = ref(false);
        const result = ref('');
        const hasWon = ref(false);

        // Cooldown system
        const cooldownActive = ref(false);
        const cooldownTime = ref(0);
        const COOLDOWN_DURATION = 20; // 20 seconds cooldown

        const ranges = [
            { value: 10, label: '±10', multiplier: 1.5, chance: 45 },
            { value: 5, label: '±5', multiplier: 3, chance: 30 },
            { value: 3, label: '±3', multiplier: 5, chance: 15 },
            { value: 1, label: 'Exact', multiplier: 10, chance: 5 }
        ];

        const selectedRange = ref(ranges[0]);

        const canGuess = computed(() => {
            return userGuess.value && 
                   betAmount.value > 0 && 
                   betAmount.value <= userBalance.value &&
                   userGuess.value >= 1 &&
                   userGuess.value <= 100 &&
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
                'gameStats.numberGuess.wins': increment(won ? 1 : 0),
                'gameStats.numberGuess.losses': increment(won ? 0 : 1),
                'gameStats.numberGuess.earnings': increment(won ? amount : -amount)
            });
        };

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

        const makeGuess = async () => {
            if (!canGuess.value || cooldownActive.value) return;

            const userId = auth.currentUser?.uid;
            if (!userId) return;

            isGuessing.value = true;
            result.value = '';
            isRevealed.value = false;
            
            try {
                await updateCoinBalance(userId, -betAmount.value, 'Number guess game bet');
                await loadUserBalance();

                // Generate random number
                targetNumber.value = Math.floor(Math.random() * 100) + 1;
                
                // Calculate if won based on range
                const difference = Math.abs(targetNumber.value - userGuess.value);
                const won = difference <= selectedRange.value.value;
                
                setTimeout(async () => {
                    isRevealed.value = true;
                    
                    if (won) {
                        const winAmount = betAmount.value * selectedRange.value.multiplier;
                        await updateCoinBalance(
                            userId,
                            winAmount,
                            `Won number guess (${selectedRange.value.label})`
                        );
                        result.value = `You won ${winAmount} AIC!`;
                        hasWon.value = true;
                    } else {
                        result.value = 'Better luck next time!';
                        hasWon.value = false;
                    }

                    await updateGameStats(won, betAmount.value);
                    await loadUserBalance();
                    
                    isGuessing.value = false;
                    userGuess.value = '';
                    startCooldown();
                }, 1500);

            } catch (error) {
                console.error('Error during guess:', error);
                result.value = 'An error occurred. Please try again.';
                isGuessing.value = false;
            }
        };

        const selectRange = (range) => {
            selectedRange.value = range;
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

        const tooltipVisible = ref(false);

        const showTooltip = () => {
            tooltipVisible.value = true;
        };

        const hideTooltip = () => {
            tooltipVisible.value = false;
        };

        // Load initial balance
        loadUserBalance();

        return {
            userBalance,
            betAmount,
            userGuess,
            targetNumber,
            isGuessing,
            isRevealed,
            result,
            hasWon,
            ranges,
            selectedRange,
            canGuess,
            cooldownActive,
            cooldownTime,
            makeGuess,
            selectRange,
            increaseBet,
            decreaseBet,
            tooltipVisible,
            showTooltip,
            hideTooltip
        };
    }
}
</script>

<style scoped>
.number-guess-container {
    padding: 20px;
    text-align: center;
}

.balance-display {
    font-size: 1.5rem;
    color: #0ff;
    margin-bottom: 20px;
}

.guess-display {
    margin: 50px auto;
    position: relative;
}

.number-range {
    font-size: 1.2rem;
    color: #0ff;
    margin-bottom: 20px;
}

.target-number {
    font-size: 5rem;
    font-weight: bold;
    color: #0ff;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    transition: all 0.5s ease;
    opacity: 0;
    transform: scale(0.8);
}

.target-number.revealed {
    opacity: 1;
    transform: scale(1);
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

.bet-amount input,
.guess-input input {
    width: 100px;
    text-align: center;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid #0ff;
    color: #fff;
    padding: 5px;
}

.multiplier-choice {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
    padding: 0 20px;
}

.guess-input {
    margin: 20px 0;
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

.guess-button {
    background: linear-gradient(45deg, #0ff, #00b3b3);
    color: #000;
    font-weight: bold;
    padding: 15px 30px;
    min-width: 200px;
}

.guess-button:disabled {
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

.input-with-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.info-icon {
    position: relative;
    color: #0ff;
    cursor: help;
}

.info-icon i {
    font-size: 1.5rem;
}

.tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid #0ff;
    color: #fff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.9rem;
    white-space: nowrap;
    pointer-events: none;
    z-index: 10;
    margin-bottom: 8px;
    backdrop-filter: blur(5px);
}

.tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #0ff transparent transparent transparent;
}

@media (max-width: 768px) {
    .target-number {
        font-size: 4rem;
    }
}
</style>