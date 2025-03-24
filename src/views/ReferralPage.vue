<template>
  <div class="referral">
    <Toast :toasts="toasts" />
    <h2>Your Referral Code</h2>
    <p class="referral-code">{{ user?.referralCode }}</p>

    <h3>Invite Friends</h3>
    <p>
      Share this link: 
      <strong class="referral-link">{{ referralLink }}</strong>
      <button @click="copyReferralLink" class="copy-btn">Copy</button>
      <button @click="shareReferralLink" class="share-btn">Share</button>
    </p>

    <h3>People who joined using your code:</h3>
    <ul v-if="referredUsers.length">
      <li v-for="(refUser, index) in referredUsers" :key="refUser.uid">
        <div class="user-info">
          <strong>#{{ index + 1 }}</strong>
          <p><strong>Name:</strong> {{ refUser.name }}</p>
          <p><strong>Country:</strong> {{ refUser.country }}</p>
          <!-- <p><strong>Email:</strong> {{ refUser.email }}</p> -->
          <p class="coins"><strong>Coins:</strong> {{ refUser.coinBalance }}</p>
        </div>
      </li>
    </ul>
    <p v-else>No referrals yet. Start inviting friends! 🚀</p>
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, onMounted, computed } from 'vue';
import Toast from '../components/TostAlert.vue';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';

export default {
  components: {
    Toast
  },

  setup() {
    const user = ref(null);
    const referredUsers = ref([]);
    const toasts = ref([]);
    const toastCounter = ref(0);
    const userId = auth.currentUser?.uid;

    const showToast = (message, type = 'success') => {
      const id = toastCounter.value++;
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        toasts.value = toasts.value.filter(toast => toast.id !== id);
      }, 3000);
    };

    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          user.value = userDoc.data();
          fetchReferredUsers(user.value.referralCode);
        } else {
          console.log("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    const fetchReferredUsers = async (referralCode) => {
      if (!referralCode) return;
      try {
        const q = query(collection(db, 'users'), where('referralUsed', '==', referralCode));
        const querySnapshot = await getDocs(q);
        referredUsers.value = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error fetching referred users: ", error);
      }
    };

    onMounted(fetchUserData);

    const referralLink = computed(() => {
      if (!user.value) return '';
      
      // Always use production URL
      const baseUrl = 'https://aiccoin.netlify.app';
      const refCode = user.value.referralCode;
      
      return `${baseUrl}/register?ref=${refCode}`;
    });

    const copyReferralLink = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(referralLink.value)
          .then(() => {
            showToast('Referral link copied to clipboard! 📋', 'success');
          })
          .catch((error) => {
            console.error("Error copying link:", error);
            showToast('Failed to copy link ❌', 'error');
          });
      }
    };

    const shareReferralLink = async () => {
      const isCapacitor = window.Capacitor?.isNative;
      // Always use production URL
      const baseUrl = 'https://aiccoin.nocorps.org';
      const shareData = {
        title: 'Join me on AIC Coin!',
        text: `Join AIC Coin using my referral code: ${user.value?.referralCode}\n\nDownload the app and start earning today!`,
        url: `${baseUrl}/register?ref=${user.value?.referralCode}`,
        dialogTitle: 'Share AIC Coin Referral'
      };

      try {
        if (isCapacitor) {
          await Share.share(shareData);
        } else if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
          showToast('Link copied to clipboard! 📋', 'success');
          return;
        }
        showToast('Link shared successfully! 🚀', 'success');
      } catch (error) {
        console.error('Error sharing:', error);
        showToast('Failed to share link ❌', 'error');
      }
    };

    return {
      user,
      referralLink,
      referredUsers,
      copyReferralLink,
      shareReferralLink,
      toasts
    };
  }
};
</script>

<style scoped>
.referral {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  padding-bottom: 100px;
}

h2, h3 {
  color: #fff;
  font-size: 1.5rem;
  margin: 1.5rem 0;
  text-align: center;
  background: linear-gradient(45deg, #0ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

h3 {
  font-size: 1.2rem;
}

.referral-code {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 1.5rem;
  margin: 1.5rem auto;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(0, 255, 255, 0.9);
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  max-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 2px;
}

.referral-link {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem;
  border-radius: 15px;
  color: rgba(255, 255, 255, 0.9);
  word-break: break-all;
  margin: 1rem 0;
  display: inline-block;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 1.5rem 0;
}

li {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

li:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

.user-info p {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.user-info strong {
  color: rgba(0, 255, 255, 0.9);
}

.coins {
  color: rgba(0, 255, 255, 0.9) !important;
  font-size: 1.1rem;
}

button {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  color: rgba(0, 255, 255, 0.7);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  margin: 0.5rem;
}

button:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

.referral p {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin: 1rem 0;
  font-size: 1.1rem;
}

.share-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 1.5rem;
  margin: 1.5rem auto;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 600px;
}

.share-btn {
  background: linear-gradient(145deg, #00ccff, #0ff);
  color: #1a1a1a;
  font-weight: 600;
  border: none;
  padding: 0.75rem 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.share-btn:hover {
  background: linear-gradient(145deg, #0ff, #00ccff);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .referral {
    padding: 0.75rem;
  }

  h2 {
    font-size: 1.25rem;
    margin: 1rem 0;
  }

  h3 {
    font-size: 1.1rem;
  }

  .referral-code {
    font-size: 1.2rem;
    padding: 1rem;
    margin: 1rem auto;
    letter-spacing: 1px;
  }

  .referral-link {
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  li {
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .user-info p {
    font-size: 0.9rem;
  }

  button {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    margin: 0.3rem;
  }

  .share-btn {
    width: 100%;
    justify-content: center;
    margin: 0.5rem 0;
  }
}
</style>