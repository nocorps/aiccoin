<template>
  <div class="container">
    <div class="balance-card">
      <div class="balance-header">
        <img :src="coinImage" alt="Coin Icon" class="coin-image animate-spin" />
        <h1>Ancient Ice Crystal</h1>
      </div>
      <div class="balance-amount">
        <span class="coin">{{ coinBalance }}</span>
        <span class="currency">AIC</span>
      </div>

      <!-- Collection Timeline -->
      <div class="collection-timeline">
        <h3>7-Hour Collection Schedule</h3>
        <div class="timeline-container">
          <div v-for="(slot, index) in collectionSlots" :key="index" class="collection-slot" :class="{
            'claimed': slot.claimed,
            'active': slot.isNext,
            'upcoming': !slot.claimed && !slot.isNext
          }">
            <div class="slot-time">{{ formatSlotTime(slot.time) }}</div>
            <div class="slot-indicator">
              <i :class="getSlotIcon(slot)"></i>
              <div class="coin-amount">{{ CLAIM_AMOUNT }} AIC</div>
            </div>
            <div class="slot-status">
              <template v-if="slot.claimed">Collected</template>
              <template v-else-if="slot.isNext">Next Collection</template>
              <template v-else>{{ slot.passed ? 'Missed' : 'Upcoming' }}</template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reward Card -->
    <div class="reward-card">
      <div class="reward-header">
        <h2>Collect Rewards</h2>
        <div class="reward-amount">{{ CLAIM_AMOUNT }} AIC</div>
      </div>

      <div class="reward-content">
        <div class="reward-timer" :class="{ 'can-claim': canClaim }">
          {{ canClaim ? 'Ready to Collect!' : `Next collection in: ${timeUntilClaim}` }}
        </div>
        <button @click="claimReward" :disabled="!canClaim" class="claim-button" :class="{ 'ready': canClaim }">
          {{ canClaim ? '🎁 Collect Now' : '⏳ Wait' }}
        </button>
      </div>
    </div>

    <!-- Ticket Collection Section -->
    <!-- <div class="ticket-section">
      <div class="ticket-info">
        <div class="ticket-count">
          <i class="fas fa-ticket-alt"></i>
          <span>{{ tickets }} Tickets</span>
        </div>
        <div class="streak-info">
          Day {{ consecutiveDays }}/7
          <div class="streak-progress">
            <div class="streak-bar" :style="{ width: `${(consecutiveDays / 7) * 100}%` }"></div>
          </div>
        </div>
      </div>
      
      <button 
        @click="claimDailyTicket" 
        :disabled="!canClaimTicket"
        class="claim-ticket-btn"
        :class="{ 'ready': canClaimTicket }"
      >
        <template v-if="canClaimTicket">
          Claim Daily Ticket
          <span v-if="consecutiveDays === 6" class="bonus-tag">+10 Bonus!</span>
        </template>
        <template v-else>
          Next Claim: {{ formatNextClaimTime }}
        </template>
      </button>
    </div> -->

    <!-- Game Card -->
    <div class="game-card" @click="navigateToGame">
      <div class="game-header">
        <h2>Play Games</h2>
        <div class="game-info">Win More AIC</div>
      </div>

      <div class="game-content">
        <div class="game-description">
          Play games to earn more Ancient Ice Crystals!
        </div>
        <button class="play-button">
          Start Playing <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Div for connect wallet -->

    <div class="wallet-card">
  <div class="wallet-header">
    <h2>Connect Wallet</h2>
    <div class="coming-soon-badge">Coming Soon</div>
  </div>

  <div class="wallet-content">
    <div class="wallet-description">
      Connect your Web3 wallet to access additional features and rewards.
    </div>
    <button class="connect-button" disabled>
      <i class="fas fa-wallet"></i>
      Connect Wallet
    </button>
  </div>
</div>

    <!-- Transaction History -->
    <!-- <div class="transactions-card" v-if="transactions.length">
      <div class="transactions-header">
        <h2>Recent Collections</h2>
      </div>

      <div class="transactions-list">
        <div v-if="transactions.length === 0" class="no-transactions">
          No collections today
        </div>
        <div v-else>
          <div v-for="tx in filteredTransactions" :key="tx.id" 
               class="transaction-item">
            <div class="tx-icon" :class="tx.type">
              <i class="fas fa-gift"></i>
            </div>
            <div class="tx-details">
              <div class="tx-info">
                <span class="tx-amount credit">+{{ tx.amount }}</span>
                <span class="tx-category">🎁 Reward Collected</span>
              </div>
              <div class="tx-meta">
                <span class="tx-time">{{ formatTimeAgo(tx.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
// Remove unused imports
import { ref, onMounted, computed, onUnmounted } from "vue";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc, serverTimestamp, increment, writeBatch } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import coinImage from "@/assets/coin1.png";
import { useRouter } from 'vue-router';

export default {
  setup() {
    const coinBalance = ref(0);
    const transactions = ref([]);
    const auth = getAuth();
    let unsubscribeBalance = null;
    let unsubscribeTransactions = null;

    const canClaim = ref(false);
    const timeUntilClaim = ref('');
    const CLAIM_COOLDOWN = 7 * 60 * 60; // 7 hours in seconds
    const CLAIM_AMOUNT = 1500; // Reward amount in coins
    const timerInterval = ref(null);
    const updateTimer = ref(null);

    const filterType = ref('all');
    const selectedTx = ref(null);
    const pageSize = ref(10);
    const loading = ref(false);

    const groupedTransactions = computed(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return transactions.value
        .filter(tx => {
          const txDate = new Date(tx.timestamp.seconds * 1000);
          return txDate >= today;
        })
        .reduce((groups, tx) => {
          const hour = new Date(tx.timestamp.seconds * 1000).getHours();
          if (!groups[hour]) {
            groups[hour] = [];
          }
          groups[hour].push(tx);
          return groups;
        }, {});
    });

    const getTransactionIcon = (tx) => {
      const icons = {
        credit: {
          reward: 'fas fa-gift',
          task: 'fas fa-tasks',
          default: 'fas fa-arrow-down'
        },
        debit: {
          game: 'fas fa-gamepad',
          default: 'fas fa-arrow-up'
        }
      };
      return icons[tx.type]?.[tx.category] || icons[tx.type].default;
    };

    const getCategoryLabel = (tx) => {
      const categories = {
        reward: '🎁 Reward',
        task: '📝 Task',
        game: '🎮 Game',
        default: '💰 Transaction'
      };
      return categories[tx.category] || categories.default;
    };

    const formatDateHeader = (date) => {
      const txDate = new Date(date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date === today.toLocaleDateString()) return 'Today';
      if (date === yesterday.toLocaleDateString()) return 'Yesterday';
      return date;
    };

    const formatTime = (timestamp) => {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatFullDate = (timestamp) => {
      return new Date(timestamp.seconds * 1000).toLocaleString([], {
        dateStyle: 'full',
        timeStyle: 'long'
      });
    };

    const toggleTxDetails = (txId) => {
      selectedTx.value = selectedTx.value === txId ? null : txId;
    };

    const loadMoreTransactions = async () => {
      if (loading.value) return;
      loading.value = true;
      // Implement pagination logic here
      loading.value = false;
    };

    const fetchCoinBalance = async (userId) => {
      if (!userId) return;
      try {
        const userDocRef = collection(db, "users");
        unsubscribeBalance = onSnapshot(userDocRef, (querySnapshot) => {
          const userDoc = querySnapshot.docs.find(doc => doc.id === userId);
          if (userDoc && userDoc.exists()) {
            coinBalance.value = userDoc.data().coinBalance || 0;
          }
        });
      } catch (error) {
        console.error("Error fetching coin balance:", error);
      }
    };

    const fetchTransactionHistory = async (userId) => {
      if (!userId) return;
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const transactionsRef = collection(db, "coinHistory");
        const q = query(
          transactionsRef,
          where("userId", "==", userId),
          where("timestamp", ">=", today),
          orderBy("timestamp", "desc")
        );

        unsubscribeTransactions = onSnapshot(q, (querySnapshot) => {
          transactions.value = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              type: ['credit', 'debit'].includes(doc.data().type) ? doc.data().type : 'credit'
            }))
            .filter(tx => tx.amount != null);
        });

        // Schedule cleanup for old transactions
        cleanupOldTransactions();
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    const cleanupOldTransactions = async () => {
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const oldTransactionsRef = collection(db, "coinHistory");
        const q = query(
          oldTransactionsRef,
          where("timestamp", "<=", yesterday)
        );

        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
      } catch (error) {
        console.error("Error cleaning up old transactions:", error);
      }
    };

    const formatTimestamp = (timestamp) => {
      if (!timestamp || !timestamp.seconds) return "Unknown";
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    };

    const checkClaimStatus = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        const userData = userDoc.data();
        const lastClaim = userData?.lastClaimTime?.toDate();

        if (!lastClaim) {
          canClaim.value = true;
          clearTimers();
          return;
        }

        const now = new Date();
        const timeDiff = now - lastClaim;

        if (timeDiff >= CLAIM_COOLDOWN * 1000) {
          canClaim.value = true;
          clearTimers();
        } else {
          canClaim.value = false;
          updateTimeUntilClaim(timeDiff);
          startTimer();
        }
      } catch (error) {
        console.error("Error checking claim status:", error);
        showError("Failed to check claim status");
      }
    };

    const updateTimeUntilClaim = (timeDiff) => {
      const remainingTime = CLAIM_COOLDOWN * 1000 - timeDiff;
      const hours = Math.floor(remainingTime / (60 * 60 * 1000));
      const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
      timeUntilClaim.value = `${hours}h ${minutes}m ${seconds}s`;
    };

    const clearTimers = () => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
      }
      if (updateTimer.value) {
        clearInterval(updateTimer.value);
        updateTimer.value = null;
      }
    };

    const startTimer = () => {
      clearTimers();
      updateTimer.value = setInterval(() => {
        checkClaimStatus();
      }, 1000);
    };

    const claimReward = async () => {
      if (!canClaim.value || !auth.currentUser) return;

      try {
        const batch = writeBatch(db);
        const userRef = doc(db, "users", auth.currentUser.uid);
        const historyRef = doc(collection(db, "coinHistory"));

        batch.update(userRef, {
          lastClaimTime: serverTimestamp(),
          nextClaimTime: new Date(Date.now() + CLAIM_COOLDOWN * 1000),
          coinBalance: increment(CLAIM_AMOUNT)
        });

        batch.set(historyRef, {
          userId: auth.currentUser.uid,
          amount: CLAIM_AMOUNT,
          type: 'credit',
          reason: '7-Hour Reward Claimed',
          timestamp: serverTimestamp()
        });

        await batch.commit();
        canClaim.value = false;
        startTimer();
      } catch (error) {
        console.error('Error claiming reward:', error);
        showError("Failed to claim reward");
      }
    };

    const showError = (message) => {
      // Implement error notification
      console.error(message);
    };

    const nextClaimTime = computed(() => {
      if (canClaim.value) return 'Ready to Claim!';
      return timeUntilClaim.value;
    });

    const formatTimeAgo = (timestamp) => {
      const minutes = Math.floor((Date.now() - timestamp.seconds * 1000) / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    };

    // Filter only reward transactions
    const filteredTransactions = computed(() => {
      return transactions.value.filter(tx =>
        tx.type === 'credit' && tx.reason === '7-Hour Reward Claimed'
      );
    });

    // Calculate collection slots for the day
    const collectionSlots = computed(() => {
      const slots = [];
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      for (let i = 0; i < 24; i += 7) {
        const slotTime = new Date(todayStart);
        slotTime.setHours(i);

        const isClaimed = transactions.value.some(tx =>
          tx.type === 'credit' &&
          tx.reason === '7-Hour Reward Claimed' &&
          Math.abs(new Date(tx.timestamp.seconds * 1000) - slotTime) < CLAIM_COOLDOWN * 1000 / 2
        );

        const isNext = !isClaimed && slotTime > now &&
          (!slots.length || slots.every(s => s.claimed || s.time < slotTime));

        slots.push({
          time: slotTime,
          claimed: isClaimed,
          isNext,
          passed: slotTime < now && !isClaimed
        });
      }

      return slots;
    });

    const formatSlotTime = (time) => {
      return time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getSlotIcon = (slot) => {
      if (slot.claimed) return 'fas fa-check-circle';
      if (slot.isNext) return 'fas fa-clock';
      if (slot.passed) return 'fas fa-times-circle';
      return 'fas fa-circle';
    };

    const getSlotStatus = (slot) => {
      if (slot.claimed) return 'Collected';
      if (slot.isNext) {
        const timeLeft = Math.max(0, slot.time - new Date());
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        return `In ${hoursLeft}h ${minutesLeft}m`;
      }
      if (slot.passed) return 'Missed';
      return 'Upcoming';
    };

    const router = useRouter();

    const navigateToGame = () => {
      router.push('/games');
    };

    onMounted(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Set up real-time listener for claim status
          const userRef = doc(db, "users", user.uid);
          const unsubscribeUser = onSnapshot(userRef, (doc) => {
            const userData = doc.data();
            if (userData?.lastClaimTime) {
              checkClaimStatus();
            } else {
              canClaim.value = true;
            }
          });

          fetchCoinBalance(user.uid);
          fetchTransactionHistory(user.uid);

          return () => {
            unsubscribeUser();
            clearTimers();
          };
        }
      });

      return () => {
        unsubscribe();
        clearTimers();
      };
    });

    onUnmounted(() => {
      clearTimers();
    });

    return {
      coinBalance,
      collectionSlots,
      canClaim,
      timeUntilClaim,
      claimReward,
      CLAIM_AMOUNT,
      formatSlotTime,
      getSlotIcon,
      coinImage,
      navigateToGame
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  padding-bottom: 100px;
  /* Space for bottom nav */
}

.balance-card {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
}

.balance-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.balance-header h1 {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.coin-image {
  width: 60px;
  height: 60px;
  filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.5));
  animation: spin 4s linear infinite;
  /* Added infinite rotation */
}

/* Remove or comment out the hover animation */
/* .animate-spin {
  transition: transform 0.3s ease;
}

.animate-spin:hover {
  transform: rotate(360deg);
} */

/* Add keyframes for continuous rotation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.coin {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(45deg, #0ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.currency {
  color: #888;
  font-size: 1.2rem;
}

.transactions-card {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 1.5rem;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.transactions-card h2 {
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.transaction-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

.tx-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.tx-icon.credit {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
}

.tx-icon.debit {
  background: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

.tx-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tx-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Add this to contain overflow */
  max-width: 100%;
  /* Ensure it doesn't exceed parent width */
}

.tx-amount {
  font-weight: 600;
  font-size: 1.1rem;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.tx-amount.credit {
  color: rgba(0, 255, 255, 0.9);
}

.tx-amount.debit {
  color: rgba(255, 99, 99, 0.9);
}

.tx-reason {
  color: #888;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  /* Limit width on desktop */
}

.tx-date {
  color: #888;
  font-size: 0.9rem;
}

.reward-card {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.reward-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reward-header h2 {
  color: #fff;
  font-size: 1.2rem;
  margin: 0;
}

.reward-amount {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0ff;
}

.reward-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reward-timer {
  text-align: center;
  color: #888;
  font-size: 1.1rem;
}

.reward-timer.can-claim {
  color: #0ff;
  font-weight: 600;
}

.claim-button {
  background: linear-gradient(135deg, #333, #444);
  color: #888;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: not-allowed;
  transition: all 0.3s ease;
}

.claim-button.ready {
  background: linear-gradient(135deg, #0066ff, #00ccff);
  color: white;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.claim-button.ready:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .reward-card {
    padding: 1.25rem;
  }

  .reward-amount {
    font-size: 1.3rem;
  }

  .reward-timer {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .balance-card,
  .transactions-card {
    padding: 1.25rem;
    border-radius: 20px;
  }

  .coin {
    font-size: 2.5rem;
  }

  .tx-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    width: 100%;
    /* Ensure full width */
  }

  .tx-info {
    width: 100%;
  }

  .tx-date {
    width: 100%;
    text-align: left;
    font-size: 0.8rem;
    color: rgba(136, 136, 136, 0.8);
  }

  .transaction-item {
    flex-wrap: wrap;
    /* Allow items to wrap on small screens */
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .tx-icon {
    width: 35px;
    height: 35px;
    min-width: 35px;
    /* Prevent icon from shrinking */
    font-size: 0.9rem;
  }

  .tx-amount {
    font-size: 1rem;
  }

  .tx-reason {
    font-size: 0.85rem;
    max-width: 100%;
    /* Full width on mobile */
    white-space: normal;
    /* Allow text to wrap */
    word-break: break-word;
    /* Break long words if needed */
    line-height: 1.2;
    /* Adjust line height for readability */
  }
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  outline: none;
}

.date-header {
  color: #888;
  font-size: 0.9rem;
  padding: 0.5rem 0;
  margin-top: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-category {
  font-size: 0.8rem;
  color: #0ff;
  background: rgba(0, 255, 255, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  margin: 0.2rem 0;
}

.tx-status {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  background: rgba(0, 255, 0, 0.1);
  color: #0f0;
}

.tx-status.pending {
  background: rgba(255, 165, 0, 0.1);
  color: orange;
}

.tx-expanded-details {
  width: 100%;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tx-detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #888;
  margin: 0.2rem 0;
}

.detail-label {
  color: #666;
}

.load-more {
  text-align: center;
  margin-top: 1rem;
}

.load-more-btn {
  background: rgba(0, 102, 255, 0.2);
  color: #0066ff;
  border: 1px solid rgba(0, 102, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  background: rgba(0, 102, 255, 0.3);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .transactions-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-select {
    width: 100%;
  }

  .tx-expanded-details {
    font-size: 0.8rem;
  }
}

.no-transactions {
  text-align: center;
  color: #888;
  padding: 2rem;
  font-size: 1.1rem;
}

.tx-time {
  font-size: 0.8rem;
  color: #666;
}

.collection-timeline {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.collection-timeline h3 {
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.timeline-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  
  gap: 1rem;
  position: relative;
}

.collection-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.slot-time {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.slot-indicator {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0.5rem 0;
}

.slot-indicator i {
  font-size: 1.5rem;
}

.coin-amount {
  position: absolute;
  bottom: -20px;
  font-size: 0.8rem;
  color: #0ff;
}

.collection-slot.claimed {
  background: rgba(0, 255, 0, 0.05);
}

.collection-slot.claimed .slot-indicator i {
  color: #00ff00;
}

.collection-slot.active {
  background: rgba(0, 255, 255, 0.05);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
}

.collection-slot.active .slot-indicator i {
  color: #0ff;
  animation: pulse 2s infinite;
}

.collection-slot.upcoming .slot-indicator i {
  color: #666;
}

.slot-status {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #888;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .timeline-container {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .collection-slot {
    padding: 0.75rem;
  }

  .slot-indicator {
    width: 40px;
    height: 40px;
  }

  .slot-indicator i {
    font-size: 1.2rem;
  }
}

.game-card {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(0, 255, 255, 0.2);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.game-header h2 {
  color: #fff;
  font-size: 1.2rem;
  margin: 0;
}

.game-info {
  font-size: 1rem;
  color: #0ff;
  font-weight: 600;
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-description {
  color: #888;
  font-size: 0.9rem;
}

.play-button {
  background: linear-gradient(135deg, #0066ff, #00ccff);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: translateX(5px);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.play-button i {
  transition: transform 0.3s ease;
}

.game-card:hover .play-button i {
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .game-card {
    padding: 1.25rem;
  }

  .game-header h2 {
    font-size: 1.1rem;
  }

  .game-info {
    font-size: 0.9rem;
  }

  .play-button {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
  }
}

.wallet-card {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.7;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.wallet-header h2 {
  color: #fff;
  font-size: 1.2rem;
  margin: 0;
}

.coming-soon-badge {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.wallet-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wallet-description {
  color: #888;
  font-size: 0.9rem;
}

.connect-button {
  background: linear-gradient(135deg, #666, #444);
  color: #888;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.connect-button i {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .wallet-card {
    padding: 1.25rem;
  }

  .wallet-header h2 {
    font-size: 1.1rem;
  }

  .connect-button {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>
