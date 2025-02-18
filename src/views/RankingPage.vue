<template>
  <div class="ranking-container">
    <!-- Tabs for Global and Country-wise Rankings -->
    <div class="tabs">
      <button @click="activeTab = 'global'" :class="{ active: activeTab === 'global' }">Global Ranking</button>
      <button @click="activeTab = 'country'" :class="{ active: activeTab === 'country' }">Country Ranking</button>
    </div>

    <!-- Global Ranking Tab -->
    <div v-if="activeTab === 'global'" class="ranking-section">
      <h2>🌎 Global Rankings</h2>
      <div class="filters">
        <button @click="fetchGlobalRanking('coinBalance')">By Coin Balance</button>
        <button @click="fetchGlobalRanking('tasksCompleted')">By Tasks Completed</button>
      </div>
      <ul>
        <li v-for="(user, index) in globalRankings" :key="user.uid">
          <span class="rank">{{ index + 1 }}</span>
          <strong>{{ user.name }}</strong> - 💰 {{ user.coinBalance }} | 📋 {{ user.tasksCompleted }}
        </li>
      </ul>
      <p v-if="currentUserGlobalRank" class="user-rank">
        Your rank: <span>#{{ currentUserGlobalRank.rank }}</span> | 💰 {{ currentUserGlobalRank.coinBalance }} | 📋 {{ currentUserGlobalRank.tasksCompleted }}
      </p>
    </div>

    <!-- Country Ranking Tab -->
    <div v-if="activeTab === 'country'" class="ranking-section">
      <h3>🏳️ Country Rankings ({{ selectedCountry }})</h3>
      <div class="filters">
        <button @click="fetchCountryRanking('coinBalance')">By Coin Balance</button>
        <button @click="fetchCountryRanking('tasksCompleted')">By Tasks Completed</button>
      </div>
      <ul>
        <li v-for="(user, index) in countryRankings" :key="user.uid">
          <span class="rank">{{ index + 1 }}</span>
          <strong>{{ user.name }}</strong> - 💰 {{ user.coinBalance }} | 📋 {{ user.tasksCompleted }}
        </li>
      </ul>
      <p v-if="currentUserCountryRank" class="user-rank">
        Your rank: <span>#{{ currentUserCountryRank.rank }}</span> | 💰 {{ currentUserCountryRank.coinBalance }} | 📋 {{ currentUserCountryRank.tasksCompleted }}
      </p>
    </div>

    <!-- Country Select dropdown (only for country tab) -->
    <div v-if="activeTab === 'country'" class="country-select">
      <label for="country">🌍 Select Country:</label>
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
/* Dark UI Theme */
.ranking-container {
  background-color: #121212;
  color: #e0e0e0;
  padding: 20px;
  border-radius: 10px;
  font-family: 'Arial', sans-serif;
}

/* Tab Styling */
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.tabs button {
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  background: #1f1f1f;
  color: #e0e0e0;
  transition: 0.3s;
  border-radius: 5px;
  margin: 0 5px;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
}

/* Ranking Section */
.ranking-section {
  padding: 15px;
  background: #1e1e1e;
  border-radius: 8px;
  margin-top: 10px;
}

.ranking-section h2, 
.ranking-section h3 {
  color: #ffd700;
  text-align: center;
}

/* Filters */
.filters {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.filters button {
  background: #282828;
  border: none;
  padding: 8px 15px;
  margin: 0 5px;
  cursor: pointer;
  color: #e0e0e0;
  border-radius: 5px;
  transition: 0.3s;
}

.filters button:hover {
  background: #007bff;
}

/* Ranking List */
ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #2b2b2b;
  padding: 10px;
  border-radius: 6px;
  margin: 6px 0;
  display: flex;
  align-items: center;
}

.rank {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  margin-right: 10px;
}

/* User Rank */
.user-rank {
  text-align: center;
  margin-top: 10px;
  font-size: 16px;
  color: #00ff7f;
}

/* Country Selection */
.country-select {
  margin-top: 15px;
  text-align: center;
}

select {
  background: #282828;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 5px;
}
</style>
