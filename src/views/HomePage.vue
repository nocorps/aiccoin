<template>
  <div class="container">
    <div class="balance-card">
      <div class="balance-header">
        <img :src="coinImage" alt="Coin Icon" class="coin-image animate-spin" />
        <h1>AIC Coin Balance</h1>
      </div>
      <div class="balance-amount">
        <span class="coin">{{ coinBalance }}</span>
        <span class="currency">AIC</span>
      </div>
    </div>

    <div class="transactions-card" v-if="transactions.length">
      <h2>Transaction History</h2>
      <div class="transactions-list">
        <div v-for="tx in transactions" :key="tx.id" class="transaction-item">
          <div class="tx-icon" :class="tx.type">
            <i :class="tx.type === 'credit' ? 'fas fa-arrow-down' : 'fas fa-arrow-up'"></i>
          </div>
          <div class="tx-details">
            <div class="tx-info">
              <span class="tx-amount" :class="tx.type">
                {{ tx.type === 'credit' ? '+' : '-' }}{{ tx.amount }}
              </span>
              <span class="tx-reason">{{ tx.reason || 'No reason provided' }}</span>
            </div>
            <span class="tx-date">{{ formatTimestamp(tx.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import coinImage from "@/assets/coin.png";

export default {
  setup() {
    const coinBalance = ref(0);
    const transactions = ref([]);
    const auth = getAuth();
    let unsubscribeBalance = null;
    let unsubscribeTransactions = null;

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
        const transactionsRef = collection(db, "coinHistory");
        const q = query(transactionsRef, where("userId", "==", userId), orderBy("timestamp", "desc"));

        unsubscribeTransactions = onSnapshot(q, (querySnapshot) => {
          transactions.value = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        });
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      }
    };

    const formatTimestamp = (timestamp) => {
      if (!timestamp || !timestamp.seconds) return "Unknown";
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchCoinBalance(user.uid);
          fetchTransactionHistory(user.uid);
        }
      });
    });

    return { coinBalance, transactions, formatTimestamp, coinImage };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
}

.balance-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
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
  filter: drop-shadow(0 0 15px #ffd700);
}

.animate-spin {
  transition: transform 0.3s ease;
}

.animate-spin:hover {
  transform: rotate(360deg);
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.coin {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ffd700, #ff9d00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.currency {
  color: #888;
  font-size: 1.2rem;
}

.transactions-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
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
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.transaction-item:hover {
  transform: translateX(5px);
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
}

.tx-amount {
  font-weight: 600;
  font-size: 1.1rem;
}

.tx-amount.credit {
  color: #00ff00;
}

.tx-amount.debit {
  color: #ff0000;
}

.tx-reason {
  color: #888;
  font-size: 0.9rem;
}

.tx-date {
  color: #888;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
  
  .balance-card {
    padding: 1.5rem;
  }
  
  .coin {
    font-size: 2.5rem;
  }
}
</style>
