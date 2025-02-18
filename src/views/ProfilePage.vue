<template>
  <div class="profile-container">
    <div class="profile-wrapper">
      <h2>Your Profile</h2>
      <div v-if="user" class="profile-details">
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Country:</strong> {{ user.country }}</p>
        <p><strong>Coins:</strong> {{ user.coinBalance }} 🪙</p>
        <p><strong>Referral Code:</strong> {{ user.referralCode }}</p>
        <!-- <p><strong>Joined:</strong> {{ formattedDate }}</p> -->
        <!-- <button @click="logout" class="logout-btn">Logout</button> -->
      </div>
      <div v-else>
        <p>Loading your profile...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const user = ref(null);
    const router = useRouter();

    onMounted(async () => {
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Fetch user details from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          user.value = userDoc.data();
        } else {
          console.log('No such document!');
        }
      } else {
        router.push('/login'); // Redirect to login if no user is authenticated
      }
    });

    return { user };
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #1d1d1d, #363636);
  font-family: "Roboto", sans-serif;
}

.profile-wrapper {
  background: rgba(0, 0, 0, 0.8);
  padding: 30px;
  border-radius: 15px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

h2 {
  text-align: center;
  color: #fff;
  margin-bottom: 20px;
}

.profile-details {
  color: #fff;
  font-size: 18px;
}

.profile-details p {
  margin-bottom: 10px;
}

.profile-details strong {
  color: #42b983;
}

.logout-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  background: #ff4d4d;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s ease;
}

.logout-btn:hover {
  background: #cc0000;
}
</style>
