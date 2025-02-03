<template>
  <div class="referral">
    <h2>Your Referral Code</h2>
    <p>{{ user?.referralCode }}</p>

    <h3>Invite Friends</h3>
    <p>Share this link: <strong>{{ referralLink }}</strong></p>

    <h3>People who joined using your code:</h3>
    <ul>
      <li v-for="refUser in referredUsers" :key="refUser.uid">
        <strong>Name:</strong> {{ refUser.name }} <br />
        <strong>Country:</strong> {{ refUser.country }} <br />
        <strong>Email:</strong> {{ refUser.email }} <br />
        <strong>Coins:</strong> {{ refUser.coinBalance }} 🪙
      </li>
    </ul>
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
  max-width: 500px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #f3f3f3;
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
}
</style>
