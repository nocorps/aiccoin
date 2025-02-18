<template>
  <div class="referral">
    <h2>Your Referral Code</h2>
    <p class="referral-code">{{ user?.referralCode }}</p>

    <h3>Invite Friends</h3>
    <p>
      Share this link: <strong class="referral-link">{{ referralLink }}</strong>
    </p>

    <h3>People who joined using your code:</h3>
    <ul v-if="referredUsers.length">
      <li v-for="(refUser, index) in referredUsers" :key="refUser.uid">
        <div class="user-info">
          <strong>#{{ index + 1 }}</strong>
          <p><strong>Name:</strong> {{ refUser.name }}</p>
          <p><strong>Country:</strong> {{ refUser.country }}</p>
          <p><strong>Email:</strong> {{ refUser.email }}</p>
          <p class="coins"><strong>Coins:</strong> {{ refUser.coinBalance }} 🪙</p>
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

export default {
  setup() {
    const user = ref(null);
    const referredUsers = ref([]);
    const userId = auth.currentUser?.uid;

    // Fetch current user data
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

    // Fetch referred users based on referral code
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

    // Generate referral link
    const referralLink = computed(() => {
      return user.value ? `${window.location.origin}/register?ref=${user.value.referralCode}` : '';
    });

    return { user, referralLink, referredUsers };
  }
};
</script>

<style scoped>
.referral {
  /*max-width: 600px;*/
  margin: auto;
  padding: 20px;
  background: #1e1e1e;
  color: #e0e0e0;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

h2, h3 {
  color: #ffcc00;
}

.referral-code {
  font-size: 1.5rem;
  font-weight: bold;
  background: #2a2a2a;
  padding: 10px;
  border-radius: 5px;
  display: inline-block;
}

.referral-link {
  background: #292929;
  padding: 8px;
  border-radius: 5px;
  display: inline-block;
  word-break: break-all;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #2a2a2a;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  text-align: left;
}

.user-info p {
  margin: 5px 0;
}

.coins {
  color: #ffd700;
  font-weight: bold;
}
</style>
