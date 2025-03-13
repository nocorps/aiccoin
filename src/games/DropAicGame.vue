<template>
  <div class="game-container">
    <div class="game-header">
      <div class="score">Score: {{ score }}</div>
      <div class="balance">Balance: {{ userBalance }} AIC</div>
    </div>

    <div class="game-area" ref="gameArea" @mousemove="moveBasket" @touchmove="handleTouch">
      <div class="basket" :style="{ left: basketPosition + 'px' }">🧺</div>
      
      <div v-for="(item, index) in fallingItems" 
           :key="index" 
           class="falling-item"
           :class="item.type"
           :style="{ 
             left: item.x + 'px', 
             top: item.y + 'px',
             transform: `rotate(${item.rotation}deg)`
           }">
        {{ item.type === 'coin' ? '🪙' : '💣' }}
      </div>
    </div>

    <div class="game-controls">
      <button @click="startGame" :disabled="isPlaying || cooldownActive">
        {{ cooldownActive ? `Wait ${formatTime(cooldownTime)}` : 'Start Game' }}
      </button>
      <div class="lives">Lives: {{ lives }}</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export default {
  name: 'DropAicGame',
  setup() {
    const gameArea = ref(null);
    const basketPosition = ref(0);
    const score = ref(0);
    const lives = ref(3);
    const isPlaying = ref(false);
    const fallingItems = ref([]);
    const userBalance = ref(0);
    const cooldownTime = ref(0);
    const cooldownActive = ref(false);
    
    const GAME_DURATION = 60000; // 60 seconds
    const COOLDOWN_DURATION = 5 * 60; // 5 minutes
    let gameLoop;
    let spawnInterval;

    const moveBasket = (e) => {
      if (!isPlaying.value) return;
      const rect = gameArea.value.getBoundingClientRect();
      const x = e.clientX - rect.left;
      basketPosition.value = Math.max(0, Math.min(x, rect.width - 50));
    };

    const handleTouch = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      moveBasket(touch);
    };

    const spawnItem = () => {
      const isCoin = Math.random() > 0.3; // 70% chance for coin
      fallingItems.value.push({
        type: isCoin ? 'coin' : 'bomb',
        x: Math.random() * (gameArea.value.offsetWidth - 30),
        y: -30,
        rotation: Math.random() * 360,
        speed: 2 + Math.random() * 2
      });
    };

    const updateGame = () => {
      fallingItems.value.forEach((item, index) => {
        item.y += item.speed;
        item.rotation += 2;

        // Check collision with basket
        if (item.y > gameArea.value.offsetHeight - 50) {
          const basketLeft = basketPosition.value;
          const basketRight = basketPosition.value + 50;

          if (item.x > basketLeft && item.x < basketRight) {
            if (item.type === 'coin') {
              score.value += 10;
            } else {
              lives.value--;
              score.value = Math.max(0, score.value - 100); // Reduce score by 100
            }
          }
          fallingItems.value.splice(index, 1);
        }
      });

      if (lives.value <= 0) {
        endGame();
      }
    };

    const startGame = async () => {
      if (cooldownActive.value) return;

      score.value = 0;
      lives.value = 3;
      fallingItems.value = [];
      isPlaying.value = true;

      gameLoop = setInterval(updateGame, 16);
      spawnInterval = setInterval(spawnItem, 1000);

      setTimeout(endGame, GAME_DURATION);
    };

    const endGame = async () => {
      isPlaying.value = false;
      clearInterval(gameLoop);
      clearInterval(spawnInterval);

      if (score.value > 0) {
        try {
          const userId = auth.currentUser?.uid;
          if (!userId) return;

          await updateDoc(doc(db, 'users', userId), {
            coinBalance: increment(score.value)
          });

          startCooldown();
        } catch (error) {
          console.error('Error updating balance:', error);
        }
      }
    };

    // Add loadUserBalance function
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

    // Add formatTime function
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    };

    // Add startCooldown function
    const startCooldown = () => {
      cooldownActive.value = true;
      cooldownTime.value = COOLDOWN_DURATION;

      const cooldownInterval = setInterval(() => {
        cooldownTime.value--;
        if (cooldownTime.value <= 0) {
          cooldownActive.value = false;
          clearInterval(cooldownInterval);
        }
      }, 1000);
    };

    onMounted(() => {
      loadUserBalance();
    });

    onUnmounted(() => {
      clearInterval(gameLoop);
      clearInterval(spawnInterval);
    });

    return {
      gameArea,
      basketPosition,
      score,
      lives,
      isPlaying,
      fallingItems,
      userBalance,
      cooldownTime,
      cooldownActive,
      moveBasket,
      handleTouch,
      startGame,
      formatTime,
      loadUserBalance,
      startCooldown
    };
  }
};
</script>

<style scoped>
.game-container {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  border-radius: 20px;
  padding: 1.5rem;
  color: #fff;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15);
}

.game-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.game-area {
  height: 400px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  cursor: none;
  border: 1px solid rgba(0, 255, 255, 0.1);
  box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.05);
}

.basket {
  position: absolute;
  bottom: 20px;
  width: 50px;
  height: 50px;
  font-size: 2rem;
  text-align: center;
  transition: left 0.1s linear;
}

.falling-item {
  position: absolute;
  width: 30px;
  height: 30px;
  font-size: 1.5rem;
  text-align: center;
}

.falling-item.coin {
  animation: glow 1.5s ease-in-out infinite alternate;
}

.falling-item.bomb {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0ff;
  }
  to {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0ff;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.game-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

button {
  background: rgba(0, 255, 255, 0.1);
  color: rgba(0, 255, 255, 0.9);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

.lives {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 77, 77, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 77, 77, 0.2);
}

.score, .balance {
  background: rgba(0, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .game-container {
    margin: 0;
    border-radius: 0;
  }

  .game-area {
    height: 300px;
  }

  .game-header {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>