<template>
  <div class="ranking-container">
    <h2>🌎 Global Rankings</h2>
    <div class="filters">
      <button @click="fetchGlobalRanking('coinBalance')">By Coin Balance</button>
      <button @click="fetchGlobalRanking('taskCount')">By Tasks Completed</button>
    </div>
    <p v-if="currentUserGlobalRank" class="user-rank">
      Your rank: <span>#{{ currentUserGlobalRank.rank }}</span> | 🪙 {{ currentUserGlobalRank.coinBalance }}
       {{ currentUserGlobalRank.taskCount }}
    </p>
    <br/>
    <ul>
      <li v-for="(user, index) in globalRankings" :key="user.uid">
        <span class="rank">{{ index + 1 }}</span>
        <strong>{{ user.name }}</strong> - 🪙 {{ user.coinBalance }} 
        | 📋 {{ user.taskCount }}
      </li>
    </ul>
    <br/><br/>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getGlobalRanking } from '../models/rankingModel';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default {
  setup() {
    const globalRankings = ref([]);
    const currentUserGlobalRank = ref(null);
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    const fetchGlobalRanking = async (sortBy) => {
      globalRankings.value = await getGlobalRanking(sortBy);
      updateUserRank(globalRankings.value, sortBy);
    };

    const updateUserRank = (rankings, sortBy) => {
      const userRank = rankings.findIndex(user => user.uid === userId);
      if (userRank !== -1) {
        currentUserGlobalRank.value = { rank: userRank + 1, ...rankings[userRank] };
      }
    };

    onMounted(() => {
      fetchGlobalRanking('coinBalance');
    });

    return {
      globalRankings,
      fetchGlobalRanking,
      currentUserGlobalRank
    };
  }
};
</script>

<style scoped>
.ranking-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  padding-bottom: 100px;
}

.filters {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.filters button {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  color: rgba(0, 255, 255, 0.7);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filters button:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

h2 {
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

ul {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 1.5rem;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  list-style: none;
}

/* Update text colors and styles */
li {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.9); /* Added text color */
  gap: 1rem; /* Added gap between elements */
}

li strong {
  color: rgba(0, 255, 255, 0.9); /* Cyan color for names */
  font-weight: 500;
}

li span {
  color: rgba(255, 255, 255, 0.8); /* Light color for other text */
}

.rank {
  background: linear-gradient(45deg, #0ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 2.5rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.user-rank {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: rgba(255, 255, 255, 0.9); /* Updated text color */
}

.user-rank span {
  color: rgba(0, 255, 255, 0.9); /* Cyan color for rank number */
  font-weight: bold;
}

@media (max-width: 768px) {
  .ranking-container {
    padding: 1rem;
  }

  .filters {
    padding: 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .filters button {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  li {
    padding: 0.75rem;
    font-size: 0.9rem;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: space-between; /* Better spacing on mobile */
  }

  li strong {
    min-width: 120px; /* Ensure names have enough space */
  }

  .rank {
    font-size: 1rem;
    min-width: 2rem;
  }

  .user-rank {
    padding: 1rem;
    font-size: 0.9rem;
    margin-top: 1rem;
  }
}
</style>
