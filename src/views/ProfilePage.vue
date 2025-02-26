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
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
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
import { signOut } from 'firebase/auth';

export default {
  setup() {
    const user = ref(null);
    const router = useRouter();

    const logout = async () => {
      try {
        await signOut(auth);
        router.push('/login');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

    onMounted(async () => {
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          user.value = userDoc.data();
        } else {
          console.log('No such document!');
        }
      } else {
        router.push('/login');
      }
    });

    return { user, logout };
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  padding-bottom: 100px;
}

.profile-wrapper {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 2rem;
  margin: 2rem auto;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 500px;
  transition: all 0.3s ease;
}

h2 {
  color: #fff;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #0ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.profile-details p {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem 1.5rem;
  border-radius: 15px;
  margin: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

.profile-details p:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

.profile-details strong {
  color: rgba(0, 255, 255, 0.9);
  margin-right: 0.5rem;
  font-weight: 500;
}

.logout-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 2rem;
  background: rgba(255, 77, 77, 0.1);
  color: rgba(255, 77, 77, 0.9);
  font-size: 1.1rem;
  border: 1px solid rgba(255, 77, 77, 0.2);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 77, 77, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 77, 77, 0.1);
}

@media (max-width: 768px) {
  .profile-container {
    padding: 0.75rem;
  }

  .profile-wrapper {
    padding: 1.5rem;
    margin: 1rem auto;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .profile-details {
    gap: 0.8rem;
  }

  .profile-details p {
    padding: 0.8rem 1rem;
    font-size: 1rem;
  }

  .logout-btn {
    padding: 0.8rem;
    font-size: 1rem;
    margin-top: 1.5rem;
  }
}
</style>
