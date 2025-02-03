<template>
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
</style>
