<template>
  <div class="profile-container">
    <div class="profile-wrapper">
      <h2>Your Profile</h2>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchUserData" class="retry-btn">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>

      <!-- Profile Content -->
      <div v-else-if="user" class="profile-details">
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Country:</strong> {{ user.country }}</p>
        <!-- <p><strong>Coins:</strong> {{ user.coinBalance }} 🪙</p> -->
        <p><strong>Coins:</strong> {{ user.coinBalance }} </p>
        <p><strong>Referral Code:</strong> {{ user.referralCode }}</p>
        <p class="whitepaper-section">
          <strong>Whitepaper:</strong>
          <button class="whitepaper-btn" @click="openWhitepaper">
            <i class="fas fa-file-pdf"></i> 
            View Whitepaper
          </button>
        </p>
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>

    <!-- PDF Modal -->
    <div v-if="showPdfModal && whitePaper" class="pdf-modal" @click="closeWhitepaper">
      <div class="pdf-content" @click.stop>
        <button class="close-btn" @click="closeWhitepaper">
          <i class="fas fa-times"></i>
        </button>
        <iframe :src="whitePaper" type="application/pdf" width="100%" height="100%"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import whitePaper from '../assets/aic_coin_white_paper.pdf';

export default {
  setup() {
    const user = ref(null);
    const router = useRouter();
    const showPdfModal = ref(false);
    const loading = ref(true);
    const error = ref(null);

    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push('/login');
          return;
        }

        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          user.value = {
            ...userDoc.data(),
            id: currentUser.uid
          };
        } else {
          error.value = 'User data not found';
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        error.value = 'Failed to load profile';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchUserData();
    });

    const logout = async () => {
      try {
        loading.value = true;
        await signOut(auth);
        router.push('/login');
      } catch (error) {
        console.error('Error logging out:', error);
      } finally {
        loading.value = false;
      }
    };

    const openWhitepaper = () => {
      window.open(whitePaper, '_blank');
    };

    const closeWhitepaper = () => {
      showPdfModal.value = false;
      document.body.style.overflow = 'auto';
    };

    onUnmounted(() => {
      document.body.style.overflow = 'auto';
    });

    return {
      user,
      loading,
      error,
      logout,
      openWhitepaper,
      closeWhitepaper,
      showPdfModal,
      whitePaper,
      fetchUserData
    };
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

.wallet-section {
  display: flex;
  align-items: center;
  justify-content: space-between !important;
}

.connect-wallet-btn {
  background: rgba(0, 255, 255, 0.1);
  color: rgba(0, 255, 255, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  font-size: 0.9rem;
  cursor: not-allowed;
  position: relative;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.connect-wallet-btn i {
  margin-right: 0.5rem;
}

.coming-soon {
  position: absolute;
  top: -20px;
  right: -10px;
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.whitepaper-section {
  display: flex;
  align-items: center;
  justify-content: space-between !important;
}

.whitepaper-btn {
  background: rgba(0, 255, 255, 0.1);
  color: rgba(0, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.whitepaper-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

.whitepaper-btn i {
  margin-right: 0.5rem;
}

.pdf-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.pdf-content {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  border-radius: 20px;
  width: 100%;
  max-width: 1000px;
  height: 90vh;
  position: relative;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15);
}

.close-btn {
  position: absolute;
  top: -15px;
  right: -15px;
  background: rgba(255, 77, 77, 0.2);
  border: 1px solid rgba(255, 77, 77, 0.3);
  color: rgba(255, 77, 77, 0.9);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255, 77, 77, 0.3);
  transform: scale(1.1);
}

iframe {
  border: none;
  border-radius: 15px;
  background: white;
}

/* Update media queries */
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

  .wallet-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .connect-wallet-btn {
    width: 100%;
    margin-top: 0.5rem;
  }

  .coming-soon {
    top: -15px;
    right: 5px;
  }

  .whitepaper-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .whitepaper-btn {
    width: 100%;
    margin-top: 0.5rem;
  }

  .pdf-content {
    height: 85vh;
    padding: 15px;
  }
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(0, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: rgba(0, 255, 255, 0.8);
  animation: spin 1s linear infinite;
}

.retry-btn {
  background: rgba(0, 255, 255, 0.1);
  color: rgba(0, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
