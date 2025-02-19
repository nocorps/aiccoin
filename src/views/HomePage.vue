<template>
  <div class="container">
    <img :src="coinImage" alt="Coin Icon" class="coin-image" />
    <p>Your Coin Balance: <span class="coin">{{ coinBalance }}</span></p>

    <!-- <div>
      <h3>History</h3>
      <ul v-if="transactions.length">
        <li v-for="transaction in transactions" :key="transaction.id">
          {{ transaction.reason }} - <span class="coin">{{ transaction.amount }}</span> coins ({{ formatTimestamp(transaction.timestamp) }})
        </li>
      </ul>
      <p v-else>No transactions yet.</p>
    </div> -->
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1d1d1d, #363636);
  color: #fff;
  font-family: "Roboto", sans-serif;
}

.coin-image {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px #ffd700);
}

p {
  font-size: 20px;
  font-weight: bold;
}

.coin {
  color: #ffd700;
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 0 10px #ffd700;
}

h3 {
  margin-top: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #444;
  padding: 10px;
  margin: 5px 0;
  border-radius: 8px;
}
</style>
