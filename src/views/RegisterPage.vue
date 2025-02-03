<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="register" class="register-form">
      <div class="input-group">
        <input v-model="name" type="text" placeholder="Your Name" required class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="email" type="email" placeholder="Your Email" required class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="password" type="password" placeholder="Password" required class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required class="input-field" />
      </div>

      <div class="input-group">
        <select v-model="country" required class="input-field">
          <option value="" disabled>Select Your Country</option>
          <option value="India">India</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="Canada">Canada</option>
          <option value="Germany">Germany</option>
          <option value="Australia">Australia</option>
        </select>
      </div>

      <div class="input-group">
        <input v-model="referralCode" type="text" placeholder="Referral Code (Optional)" class="input-field" />
      </div>

      <div class="button-container">
        <button type="submit" class="submit-button">Register</button>
      </div>
    </form>
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserDocument, updateReferralSystem } from '../models/userModel';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const referralCode = ref('');
    const country = ref('');
    const router = useRouter();

    // Generate Unique Referral Code
    const generateReferralCode = () => 'REF' + Math.random().toString(36).substring(2, 12).toUpperCase();

    // Auto-fill referral code from URL
    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search);
      referralCode.value = urlParams.get('ref') || '';
    });

    const register = async () => {
      if (password.value !== confirmPassword.value) {
        alert('Passwords do not match!');
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const userId = userCredential.user.uid;
        const newReferralCode = generateReferralCode();

        // Store user data in Firebase
        await createUserDocument(userId, {
          name: name.value,
          email: email.value,
          country: country.value, // Add Country to Firebase
          referralCode: newReferralCode,
          referralUsed: referralCode.value || '',
          referredUsers: [],
          coins: 0
        });

        // Handle Referral System
        if (referralCode.value) {
          await updateReferralSystem(referralCode.value, userId);
        }

        // Redirect after successful registration
        router.push('/');
      } catch (error) {
        alert(error.message);
      }
    };

    return { name, email, password, confirmPassword, country, referralCode, register };
  }
};
</script>

<style scoped>
.register-container {
  width: 100%;
  max-width: 400px;
  margin: 20px auto; /* Add margin to top */
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.register-form {
  display: flex;
  flex-direction: column;
}

.input-group {
  margin-bottom: 15px;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #007BFF;
  outline: none;
}

select.input-field {
  height: 40px;
}

.button-container {
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #0056b3;
}
</style>
