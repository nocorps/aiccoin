<template>
  <div>
    <!-- Tabs for Global and Country-wise Rankings -->
    <div class="tabs">
      <button @click="activeTab = 'global'" :class="{ active: activeTab === 'global' }">Global Ranking</button>
      <button @click="activeTab = 'country'" :class="{ active: activeTab === 'country' }">Country Ranking</button>
    </div>

    <!-- Global Ranking Tab -->
    <div v-if="activeTab === 'global'">
      <h2>Global Rankings</h2>
      <div>
        <button @click="fetchGlobalRanking('coinBalance')">By Coin Balance</button>
        <button @click="fetchGlobalRanking('tasksCompleted')">By Tasks Completed</button>
      </div>
      <ul>
        <li v-for="(user, index) in globalRankings" :key="user.uid">
          <strong>{{ index + 1 }}. {{ user.name }}</strong> - Coins: {{ user.coinBalance }} | Tasks: {{ user.tasksCompleted }}
        </li>
      </ul>
      <p v-if="currentUserGlobalRank">
        Your rank: {{ currentUserGlobalRank.rank }} | Coins: {{ currentUserGlobalRank.coinBalance }} | Tasks: {{ currentUserGlobalRank.tasksCompleted }}
      </p>
    </div>

    <!-- Country Ranking Tab -->
    <div v-if="activeTab === 'country'">
      <h3>Country Rankings ({{ selectedCountry }})</h3>
      <div>
        <button @click="fetchCountryRanking('coinBalance')">By Coin Balance</button>
        <button @click="fetchCountryRanking('tasksCompleted')">By Tasks Completed</button>
      </div>
      <ul>
        <li v-for="(user, index) in countryRankings" :key="user.uid">
          <strong>{{ index + 1 }}. {{ user.name }}</strong> - Coins: {{ user.coinBalance }} | Tasks: {{ user.tasksCompleted }}
        </li>
      </ul>
      <p v-if="currentUserCountryRank">
        Your rank: {{ currentUserCountryRank.rank }} | Coins: {{ currentUserCountryRank.coinBalance }} | Tasks: {{ currentUserCountryRank.tasksCompleted }}
      </p>
    </div>

    <!-- Country Select dropdown (only for country tab) -->
    <div v-if="activeTab === 'country'">
      <label for="country">Select Country:</label>
      <select v-model="selectedCountry" @change="fetchCountryRanking('coinBalance')">
        <option v-for="(country, index) in countries" :key="index" :value="country">
          {{ country }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getGlobalRanking, getCountryRanking } from '../models/rankingModel';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default {
  setup() {
    const globalRankings = ref([]);
    const countryRankings = ref([]);
    const selectedCountry = ref('');
    const countries = ref(['India', 'USA', 'Canada', 'UK']); // Example countries
    const activeTab = ref('global'); // Track active tab
    const currentUserGlobalRank = ref(null);
    const currentUserCountryRank = ref(null);
    const userCountry = ref('');

    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    // Fetch global rankings for Coin Balance or Tasks Completed
    const fetchGlobalRanking = async (sortBy) => {
      globalRankings.value = await getGlobalRanking(sortBy);
      updateUserRank(globalRankings.value, sortBy);
    };

    // Fetch country-specific rankings for Coin Balance or Tasks Completed
    const fetchCountryRanking = async (sortBy) => {
      countryRankings.value = await getCountryRanking(selectedCountry.value, sortBy);
      updateUserRank(countryRankings.value, sortBy, true);
    };

    // Detect the user's country automatically
    const fetchUserCountry = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          userCountry.value = userDoc.data().country;
          selectedCountry.value = userCountry.value; // Set default country
        }
      }
    };

    // Update the current user's rank based on their `coinBalance` or `tasksCompleted`
    const updateUserRank = (rankings, sortBy, isCountry = false) => {
      const userRank = rankings.findIndex(user => user.uid === userId);
      if (userRank !== -1) {
        const userData = rankings[userRank];
        if (isCountry) {
          currentUserCountryRank.value = { rank: userRank + 1, ...userData };
        } else {
          currentUserGlobalRank.value = { rank: userRank + 1, ...userData };
        }
      }
    };

    onMounted(() => {
      fetchUserCountry();
      fetchGlobalRanking('coinBalance');
      fetchCountryRanking('coinBalance');
    });

    return {
      globalRankings,
      countryRankings,
      selectedCountry,
      countries,
      activeTab,
      fetchGlobalRanking,
      fetchCountryRanking,
      currentUserGlobalRank,
      currentUserCountryRank
    };
  }
};
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 10px;
}

.tabs button {
  padding: 10px;
  cursor: pointer;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 5px 0;
  background-color: #f3f3f3;
  padding: 10px;
  border-radius: 5px;
}
</style>
