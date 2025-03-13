<template>
  <div class="guess-match-container">
    <!-- Update balance display to match other games -->
    <div class="balance-display">
      <i class="mdi mdi-wallet"></i>
      <span>Balance: {{ userBalance }} AIC</span>
    </div>

    <!-- Add game info section -->
    <div class="game-info">
      <div class="timer" :class="{ 'warning': gameTimer <= 5 }">
        <i class="mdi mdi-timer"></i>
        Time: {{ gameTimer }}s
      </div>
      <div class="pairs-info">
        Pairs: {{ matchedPairs }}/{{ totalPairs }}
      </div>
      <div v-if="cooldownActive" class="cooldown">
        <i class="mdi mdi-clock-outline"></i>
        Next game: {{ formatTime(cooldownTime) }}
      </div>
    </div>

    <!-- Update game board styles -->
    <div class="game-board" :class="{ 'disabled': !isPlaying }">
      <div v-for="(card, index) in cards" 
           :key="index"
           class="card"
           :class="{ 
             'flipped': card.isFlipped,
             'matched': card.isMatched 
           }"
           @click="flipCard(index)">
        <div class="card-inner">
          <div class="card-front">
            <i class="mdi mdi-card"></i>
          </div>
          <div class="card-back">{{ card.emoji }}</div>
        </div>
      </div>
    </div>

    <!-- Update controls section -->
    <div class="game-controls">
      <button 
        @click="startGame" 
        :disabled="cooldownActive || isPlaying"
        class="play-button">
        <i class="mdi mdi-play"></i>
        {{ cooldownActive ? 'Wait for Cooldown' : 'Start Game' }}
      </button>
    </div>

    <!-- Update result display -->
    <div v-if="gameResult" 
         class="result-display"
         :class="{ 'win': matchedPairs === totalPairs }">
      <i :class="matchedPairs === totalPairs ? 'mdi mdi-trophy' : 'mdi mdi-information'"></i>
      {{ gameResult }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp, Timestamp, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { updateCoinBalance } from '../models/userModel';

export default {
  name: 'GuessMatch',
  setup() {
    const userBalance = ref(0);
    const cards = ref([]);
    const flippedCards = ref([]);
    const matchedPairs = ref(0);
    const isPlaying = ref(false);
    const gameResult = ref('');
    const cooldownActive = ref(false);
    const cooldownTime = ref(0);
    const COOLDOWN_DURATION = 12 * 60 * 60; // 12 hours in seconds
    const REWARD_PER_PAIR = 100;
    const totalPairs = 8; // 16 cards, 8 pairs

    const emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯'];
    const timerInterval = ref(null);
    const unsubscribeCooldown = ref(null);
    const gameTimer = ref(20); // 20 seconds timer
    const gameTimerInterval = ref(null);

    const initializeCards = () => {
      const duplicatedEmojis = [...emojis, ...emojis];
      cards.value = duplicatedEmojis
        .sort(() => Math.random() - 0.5)
        .map(emoji => ({
          emoji,
          isFlipped: false,
          isMatched: false
        }));
      flippedCards.value = [];
      matchedPairs.value = 0;
      gameResult.value = '';
    };

    const flipCard = async (index) => {
      if (!isPlaying.value) return;
      if (flippedCards.value.length >= 2) return;
      if (cards.value[index].isFlipped || cards.value[index].isMatched) return;

      cards.value[index].isFlipped = true;
      flippedCards.value.push(index);

      if (flippedCards.value.length === 2) {
        const [firstIndex, secondIndex] = flippedCards.value;
        const firstCard = cards.value[firstIndex];
        const secondCard = cards.value[secondIndex];

        if (firstCard.emoji === secondCard.emoji) {
          // Match found
          await handleMatch(firstIndex, secondIndex);
        } else {
          // No match
          setTimeout(() => {
            firstCard.isFlipped = false;
            secondCard.isFlipped = false;
            flippedCards.value = [];
          }, 1000);
        }
      }
    };

    const handleMatch = async (firstIndex, secondIndex) => {
      cards.value[firstIndex].isMatched = true;
      cards.value[secondIndex].isMatched = true;
      flippedCards.value = [];
      matchedPairs.value++;

      if (matchedPairs.value === totalPairs) {
        await gameWon();
      }
    };

    const gameWon = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      clearInterval(gameTimerInterval.value);
      
      // Calculate reward based on completion
      let reward;
      if (gameTimer.value > 0 && matchedPairs.value === totalPairs) {
        // Full completion bonus
        reward = 2000;
        gameResult.value = `Amazing! Full completion bonus: ${reward} AIC!`;
      } else {
        // Partial completion reward
        reward = REWARD_PER_PAIR * matchedPairs.value;
        gameResult.value = `Time's up! You matched ${matchedPairs.value} pairs: ${reward} AIC`;
      }

      await updateCoinBalance(userId, reward, 'Guess Match reward');
      await startCooldown();
      isPlaying.value = false;
      await loadUserBalance();
    };

    // ... Add all the cooldown related functions from ScratchCard.vue ...
    const startCooldown = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
        const cooldownRef = doc(db, 'cooldowns', `guessMatch_${userId}`);
        const endTime = Timestamp.fromDate(new Date(Date.now() + COOLDOWN_DURATION * 1000));
        
        await setDoc(cooldownRef, {
          userId,
          gameType: 'guessMatch',
          startTime: serverTimestamp(),
          endTime: endTime
        });

        cooldownActive.value = true;
        startLocalTimer(endTime.toMillis());
      } catch (error) {
        console.error('Error starting cooldown:', error);
      }
    };

    // ... Copy other utility functions from ScratchCard.vue ...

    const formatTime = (seconds) => {
      if (!seconds) return '0h 0m 0s';
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${hours}h ${minutes}m ${secs}s`;
    };

    const loadUserBalance = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userDoc = await getDoc(doc(db, 'users', userId));
        userBalance.value = userDoc.data()?.coinBalance || 0;
      } catch (error) {
        console.error('Error loading balance:', error);
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
        const cooldownRef = doc(db, 'cooldowns', `guessMatch_${userId}`);
        
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

    const startGame = () => {
      if (cooldownActive.value) return;
      
      initializeCards();
      isPlaying.value = true;
      gameTimer.value = 20;
      
      // Clear any existing timer
      if (gameTimerInterval.value) {
        clearInterval(gameTimerInterval.value);
      }
      
      // Start game timer
      gameTimerInterval.value = setInterval(() => {
        if (gameTimer.value > 0) {
          gameTimer.value--;
        } else {
          // Time's up
          clearInterval(gameTimerInterval.value);
          if (isPlaying.value) {
            gameWon(); // This will handle partial completion rewards
          }
        }
      }, 1000);
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
      if (gameTimerInterval.value) {
        clearInterval(gameTimerInterval.value);
      }
    });

    return {
      userBalance,
      cards,
      isPlaying,
      gameResult,
      cooldownActive,
      cooldownTime,
      matchedPairs,
      totalPairs,
      flipCard,
      startGame,
      formatTime,
      gameTimer,
    };
  }
};
</script>

<style scoped>
.guess-match-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  border-radius: 20px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.balance-display {
  font-size: 1.5rem;
  color: #0ff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.timer, .pairs-info, .cooldown {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  border-radius: 8px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
  color: #0ff;
}

.timer.warning {
  background: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.2);
  color: #ff4444;
  animation: pulse 1s infinite;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.card {
  aspect-ratio: 1;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s ease-out;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: linear-gradient(145deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.05));
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(145deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1));
}

.card.matched .card-inner {
  background: linear-gradient(145deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 0, 0.1));
  border-color: rgba(0, 255, 0, 0.3);
  animation: matched 0.5s ease-out;
}

.play-button {
  background: linear-gradient(45deg, #0ff, #00b3b3);
  color: #000;
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 200px;
  margin: 0 auto;
}

.play-button:disabled {
  background: linear-gradient(45deg, #666, #444);
  opacity: 0.7;
  cursor: not-allowed;
}

.result-display {
  margin-top: 20px;
  padding: 15px;
  border-radius: 12px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.result-display.win {
  background: rgba(0, 255, 0, 0.1);
  border-color: rgba(0, 255, 0, 0.2);
  color: #0f0;
}

@keyframes matched {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@media (max-width: 768px) {
  .game-info {
    flex-direction: column;
    gap: 10px;
  }

  .game-board {
    gap: 5px;
    padding: 10px;
  }

  .card-front,
  .card-back {
    font-size: 1.5rem;
  }
}
</style>