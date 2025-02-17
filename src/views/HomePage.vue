<!-- <template>
  <div class="home">
    <div class="welcome-container">
      <h2>Welcome, {{ user?.name }}</h2>
      <p>Your Coins: <strong>{{ user?.coinBalance }}</strong></p>
    </div>

    <div class="ad-container">
      <h3>Watch Ads to Earn Coins</h3>
      <button @click="watchAd" class="watch-ad-button">Watch Ad</button>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, onMounted } from 'vue';
import { updateAdsWatched } from '../models/userModel';

export default {
  setup() {
    const user = ref(null);
    const userId = auth.currentUser?.uid;

    const fetchUserData = async () => {
      if (!userId) return;
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        user.value = userDoc.data();
      }
    };

    const watchAd = async () => {
      if (!userId) return alert('You need to login first!');
      await updateAdsWatched(userId);
      await fetchUserData();
      alert('Ad watched! You earned 5 coins.');
    };

    onMounted(fetchUserData);

    return { user, watchAd };
  }
};
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.welcome-container {
  margin-bottom: 30px;
}

h2 {
  font-size: 24px;
  color: #333;
}

p {
  font-size: 18px;
  color: #666;
}

strong {
  color: #007bff;
}

.ad-container {
  margin-top: 30px;
}

h3 {
  font-size: 20px;
  color: #333;
}

.watch-ad-button {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.watch-ad-button:hover {
  background-color: #0056b3;
}

.watch-ad-button:focus {
  outline: none;
}
</style> -->







<template>
  <div class="mining-container">
    <h2>Mining</h2>
    <p v-if="miningActive">Mining in progress... ⛏️</p>
    <p v-else>Start mining to earn AIC coins.</p>

    <div v-if="miningActive">
      <p>Mining started: {{ miningStartTime }}</p>
      <p>Time elapsed: {{ timeElapsed }} / {{ miningDuration }} hours</p>
      <p>Estimated earnings: {{ currentEarnings }} AIC</p>

      <button v-if="canClaimPartial" @click="claimPartialReward">Claim Partial Reward</button>
      <button v-if="canClaimFull" @click="claimFullReward">Collect Full Reward</button>
    </div>

    <button v-else @click="startMining">Start Mining</button>

    <h2>Upgrades</h2>
    <div class="upgrades">
      <button @click="upgradeTimeReduction">Reduce Mining Time</button>
      <button @click="activateBoost">Boost Mining</button>
      <button @click="increaseCoinLimit">Increase Coin Limit</button>
    </div>
  </div>
</template>

<script>
import { db, auth } from "@/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

export default {
  data() {
    return {
      miningStartTime: null,
      miningDuration: 11, // Default 17 hours
      claimedPartial: false,
      miningUpgrades: { timeReduction: 0, boostActive: false, coinLimit: 1000 },
    };
  },
  async created() {
    await this.fetchMiningData();
  },
  computed: {
    miningActive() {
      return this.miningStartTime !== null;
    },
    timeElapsed() {
      if (!this.miningActive) return 0;
      return ((Date.now() - this.miningStartTime) / (1000 * 60 * 60)).toFixed(2);
    },
    canClaimPartial() {
      return this.timeElapsed >= this.miningDuration / 2 && !this.claimedPartial;
    },
    canClaimFull() {
      return this.timeElapsed >= this.miningDuration;
    },
    currentEarnings() {
      if (!this.miningActive) return 0;
      const ratePerHour = 70 / this.miningDuration;
      return Math.floor(ratePerHour * this.timeElapsed);
    },
  },
  methods: {
    async fetchMiningData() {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          this.miningStartTime = data.miningStart || null;
          this.claimedPartial = data.claimedPartial || false;
          this.miningUpgrades = data.miningUpgrades || this.miningUpgrades;

          // Apply upgrades
          this.miningDuration -= this.miningUpgrades.timeReduction;
        }
      }
    },
    async startMining() {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const startTime = Date.now();

        await updateDoc(userRef, {
          miningStart: startTime,
          claimedPartial: false,
        });

        this.miningStartTime = startTime;
      }
    },
    async claimPartialReward() {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const partialReward = Math.floor(70 / 2);

        await updateDoc(userRef, {
          coinBalance: increment(partialReward),
          claimedPartial: true,
        });

        this.claimedPartial = true;
        alert(`You have claimed ${partialReward} AIC.`);
      }
    },
    async claimFullReward() {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
          coinBalance: increment(70),
          miningStart: null,
        });

        this.miningStartTime = null;
        alert("You have collected 70 AIC.");
      }
    },
    async upgradeTimeReduction() {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
          "miningUpgrades.timeReduction": increment(1),
        });

        this.miningDuration -= 1;
        alert("Mining time reduced!");
      }
    },
    async activateBoost() {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
          "miningUpgrades.boostActive": true,
        });

        this.miningUpgrades.boostActive = true;
        alert("Mining boost activated for 5 minutes!");
      }
    },
    async increaseCoinLimit() {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
          "miningUpgrades.coinLimit": increment(500),
        });

        this.miningUpgrades.coinLimit += 500;
        alert("Coin limit increased!");
      }
    },
  },
};
</script>

<style scoped>
.mining-container {
  max-width: 600px;
  margin: auto;
}
button {
  margin: 5px;
  padding: 8px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
button:hover {
  background-color: #218838;
}
</style>
