<template>
  <div class="container">
    <img :src="coinImage" alt="Coin Icon" class="coin-image" />
    <p>Your Coin Balance: <span class="coin">{{ coinBalance }}</span></p>

    <!-- Clickable Community Div -->
    <div class="clickable" @click="redirectToCommunity">
      <h3>Community</h3>
      <p>Join our community to get the latest updates and news.</p>
    </div>

    <div>
      <h3>History</h3>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import coinImage from "@/assets/coin.png";

export default {
  setup() {
    const coinBalance = ref(0);
    const auth = getAuth();
    let unsubscribe = null;

    const fetchCoinBalance = async (userId) => {
      if (!userId) return;
      try {
        const userDocRef = doc(db, "users", userId);
        unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            coinBalance.value = docSnap.data().coinBalance || 0;
          } else {
            console.log("User data not found.");
          }
        });
      } catch (error) {
        console.error("Error fetching coin balance:", error);
      }
    };

    const redirectToCommunity = () => {
      window.open("https://nocorps.netlify.app/", "_blank"); // ✅ Correct external link
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchCoinBalance(user.uid);
        }
      });
    });

    return { coinBalance, coinImage, redirectToCommunity };
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

/* Clickable div styling */
.clickable {
  cursor: pointer;
  padding: 15px;
  background: #444;
  border-radius: 10px;
  transition: background 0.3s, transform 0.2s;
}

.clickable:hover {
  background: #555;
  transform: scale(1.05);
}
</style>
