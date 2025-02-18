<template>
  <div class="mining-container">
    <h2>Mining</h2>
    <p v-if="miningActive">Mining in progress... ⛏️</p>
    <p v-else>Mining started automatically upon registration.</p>

    <div v-if="miningActive">
      <p>Mining started: {{ miningStartTime }}</p>
      <p>Time elapsed: {{ timeElapsed }} / {{ miningDuration }} hours</p>
      <p>Estimated earnings: {{ currentEarnings }} AIC</p>

      <button v-if="canClaimPartial" @click="claimPartialReward">Claim Partial Reward</button>
      <button v-if="canClaimFull" @click="claimFullReward">Collect Full Reward</button>
    </div>

    <h2>Upgrades</h2>
    <div class="upgrades">
      <button @click="upgradeTimeReduction">Reduce Mining Time ({{ upgradeCost }} AIC)</button>
      <button @click="activateBoost">Boost Mining ({{ boostCost }} AIC)</button>
      <button @click="increaseCoinLimit">Increase Coin Limit ({{ limitCost }} AIC)</button>
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
      miningDuration: 11,
      claimedPartial: false,
      miningUpgrades: { timeReduction: 0, boostActive: false, coinLimit: 1000, level: 1 },
      upgradeCosts: [100, 200, 300, 500, 800, 1200, 1800],
    };
  },
  async created() {
    await this.fetchMiningData();
    if (!this.miningActive) {
      this.startMining();
    }
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
    upgradeCost() {
      return this.miningUpgrades.level * 100;
    },
    boostCost() {
      return this.miningUpgrades.level * 150;
    },
    limitCost() {
      return this.miningUpgrades.level * 200;
    }
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

          if (this.miningUpgrades.level >= 75) {
            this.miningDuration = 3;
          } else {
            this.miningDuration -= this.miningUpgrades.timeReduction;
          }
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
      await this.upgrade("timeReduction", this.upgradeCost);
    },
    async activateBoost() {
      await this.upgrade("boostActive", this.boostCost);
    },
    async increaseCoinLimit() {
      await this.upgrade("coinLimit", this.limitCost);
    },
    async upgrade(type, cost) {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.coinBalance >= cost) {
            await updateDoc(userRef, {
              [`miningUpgrades.${type}`]: increment(1),
              coinBalance: increment(-cost),
              "miningUpgrades.level": increment(1),
            });
            this.miningUpgrades[type]++;
            this.miningUpgrades.level++;
            alert(`Upgrade successful! Your new level is ${this.miningUpgrades.level}.`);
          } else {
            alert("Not enough AIC coins for this upgrade!");
          }
        }
      }
    }
  }
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
