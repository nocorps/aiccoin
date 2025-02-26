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
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  padding-bottom: 100px; /* Space for bottom nav */
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
  overflow: hidden; /* Add this to contain overflow */
  max-width: 100%; /* Ensure it doesn't exceed parent width */
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
  max-width: 200px; /* Limit width on desktop */
}

.tx-date {
  color: #888;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .balance-card, .transactions-card {
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
    width: 100%; /* Ensure full width */
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
    flex-wrap: wrap; /* Allow items to wrap on small screens */
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .tx-icon {
    width: 35px;
    height: 35px;
    min-width: 35px;  /* Prevent icon from shrinking */
    font-size: 0.9rem;
  }

  .tx-amount {
    font-size: 1rem;
  }

  .tx-reason {
    font-size: 0.85rem;
    max-width: 100%; /* Full width on mobile */
    white-space: normal; /* Allow text to wrap */
    word-break: break-word; /* Break long words if needed */
    line-height: 1.2; /* Adjust line height for readability */
  }
}
</style>
