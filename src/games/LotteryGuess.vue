<template>
    <div class="lottery-guess-container">
        <div class="balance-display">
            <i class="mdi mdi-wallet"></i>
            <span>Balance: {{ userBalance }} AIC</span>
        </div>

        <div class="lottery-display">
            <div class="prize-tiers">
                <div class="tier" v-for="tier in prizeTiers" :key="tier.range">
                    <span class="tier-range">±{{ tier.range }}</span>
                    <span class="tier-prize">{{ tier.multiplier }}x</span>
                </div>
            </div>
            <div class="target-number" :class="{ 'revealed': isRevealed }">
                {{ isRevealed ? targetNumber : '?' }}
            </div>
            <div class="jackpot-display">
                <span>Current Jackpot: {{ currentJackpot }} AIC</span>
            </div>
        </div>

        <div class="betting-controls">
            <div class="bet-amount">
                <button @click="decreaseBet" :disabled="isGuessing || cooldownActive">-</button>
                <input type="number" v-model="betAmount" :disabled="isGuessing || cooldownActive">
                <button @click="increaseBet" :disabled="isGuessing || cooldownActive">+</button>
            </div>

            <div class="guess-input">
                <div class="input-with-info">
                    <input 
                        type="number" 
                        v-model="userGuess" 
                        placeholder="Enter lottery number"
                        min="1"
                        max="100"
                        :disabled="isGuessing || cooldownActive">
                    <div class="info-icon" @mouseenter="showTooltip" @mouseleave="hideTooltip">
                        <i class="mdi mdi-information"></i>
                        <div class="tooltip" v-show="tooltipVisible">
                            Enter a number between 1-100. The closer you get, the bigger the prize!
                        </div>
                    </div>
                </div>
            </div>

            <button 
                class="play-button" 
                @click="playLottery" 
                :disabled="!canPlay || isGuessing || cooldownActive">
                {{ cooldownActive ? `Next draw in ${formatTime(cooldownTime)}` : 'Play Lottery' }}
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
import { ref, computed, onMounted } from 'vue';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { updateCoinBalance } from '../models/userModel';

export default {
    name: 'LotteryGuess',
    setup() {
        const userBalance = ref(0);
        const betAmount = ref(10);
        const userGuess = ref('');
        const targetNumber = ref(0);
        const isGuessing = ref(false);
        const isRevealed = ref(false);
        const result = ref('');
        const hasWon = ref(false);
        const tooltipVisible = ref(false);
        const currentJackpot = ref(1000);

        // Cooldown system
        const cooldownActive = ref(false);
        const cooldownTime = ref(0);
        const COOLDOWN_DURATION = 300; // 5 minutes cooldown

        const prizeTiers = [
            { range: 1, multiplier: 50, label: 'Jackpot' },
            { range: 3, multiplier: 20, label: '1st Prize' },
            { range: 5, multiplier: 10, label: '2nd Prize' },
            { range: 10, multiplier: 5, label: '3rd Prize' },
            { range: 15, multiplier: 2, label: '4th Prize' }
        ];

        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}m ${remainingSeconds}s`;
        };

        const canPlay = computed(() => {
            return userGuess.value && 
                   betAmount.value > 0 && 
                   betAmount.value <= userBalance.value &&
                   userGuess.value >= 1 &&
                   userGuess.value <= 100 &&
                   !cooldownActive.value;
        });

        // ... existing balance and stats functions ...

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

        const playLottery = async () => {
            if (!canPlay.value) return;

            const userId = auth.currentUser?.uid;
            if (!userId) return;

            try {
                await updateCoinBalance(userId, -betAmount.value, 'Lottery ticket purchase');
                await loadUserBalance();

                isGuessing.value = true;
                targetNumber.value = Math.floor(Math.random() * 100) + 1;
                const difference = Math.abs(targetNumber.value - userGuess.value);
                
                setTimeout(async () => {
                    isRevealed.value = true;
                    let winAmount = 0;
                    let wonTier = null;

                    for (const tier of prizeTiers) {
                        if (difference <= tier.range) {
                            wonTier = tier;
                            break;
                        }
                    }

                    if (wonTier) {
                        winAmount = betAmount.value * wonTier.multiplier;
                        if (wonTier.range === 1) {
                            winAmount += currentJackpot.value;
                            currentJackpot.value = 1000; // Reset jackpot
                        }
                        await updateCoinBalance(
                            userId,
                            winAmount,
                            `Won lottery ${wonTier.label}`
                        );
                        result.value = `Congratulations! You won ${wonTier.label}: ${winAmount} AIC!`;
                        hasWon.value = true;
                    } else {
                        result.value = 'No prize this time. Try again!';
                        hasWon.value = false;
                        currentJackpot.value += Math.floor(betAmount.value * 0.5);
                    }

                    await updateGameStats(hasWon.value, betAmount.value);
                    await loadUserBalance();
                    
                    isGuessing.value = false;
                    userGuess.value = '';
                    startCooldown();
                }, 2000);

            } catch (error) {
                console.error('Error playing lottery:', error);
                result.value = 'An error occurred. Please try again.';
                isGuessing.value = false;
            }
        };

        const showTooltip = () => {
            tooltipVisible.value = true;
        };

        const hideTooltip = () => {
            tooltipVisible.value = false;
        };

        onMounted(() => {
            loadUserBalance();
        });

        return {
            userBalance,
            betAmount,
            userGuess,
            targetNumber,
            isGuessing,
            isRevealed,
            result,
            hasWon,
            prizeTiers,
            currentJackpot,
            tooltipVisible,
            cooldownActive,
            cooldownTime,
            canPlay,
            formatTime,
            playLottery,
            showTooltip,
            hideTooltip
        };
    }
}
</script>

<style scoped>
.lottery-guess-container {
    padding: 20px;
    text-align: center;
}

.lottery-display {
    margin: 30px auto;
    max-width: 600px;
}

.prize-tiers {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.tier {
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid #0ff;
    padding: 10px 20px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
}

.tier-range {
    font-size: 1.2rem;
    color: #fff;
}

.tier-prize {
    font-size: 1.5rem;
    color: #0ff;
    font-weight: bold;
}

.target-number {
    font-size: 6rem;
    font-weight: bold;
    color: #0ff;
    text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    margin: 40px 0;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.5s ease;
}

.target-number.revealed {
    opacity: 1;
    transform: scale(1);
}

.jackpot-display {
    font-size: 1.8rem;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    margin: 20px 0;
}

/* ... existing styles for betting controls, tooltips, etc ... */

.play-button {
    background: linear-gradient(45deg, #ffd700, #ff8c00);
    color: #000;
    font-weight: bold;
    padding: 15px 30px;
    min-width: 200px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.play-button:disabled {
    background: linear-gradient(45deg, #666, #444);
    opacity: 0.7;
}

@media (max-width: 768px) {
    .prize-tiers {
        gap: 10px;
    }
    
    .tier {
        padding: 8px 15px;
    }

    .target-number {
        font-size: 4rem;
    }
}
</style>