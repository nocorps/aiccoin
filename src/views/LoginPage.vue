<template>
  <div class="container">
    <h2>Login</h2>
    <form @submit.prevent="login" class="form">
      <input v-model="email" type="email" placeholder="Email" required class="input" />
      <input v-model="password" type="password" placeholder="Password" required class="input" />
      <button type="submit" class="button">Login</button>
    </form>

    <!-- Display Error Message -->
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- Forgot Password Section -->
    <button @click="toggleForgotPassword" class="forgot-password">
      Forgot Password?
    </button>
    <div v-if="showForgotPassword" class="forgot-password-section">
      <input v-model="resetEmail" type="email" placeholder="Enter your email" class="input" />
      <button @click="resetPassword" class="button">Send Reset Link</button>
    </div>

    <router-link to="/register" class="link">Don't have an account? Register</router-link>
  </div>
</template>

<script>
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const resetEmail = ref('');
    const errorMessage = ref('');
    const showForgotPassword = ref(false);
    const router = useRouter();

    const login = async () => {
      errorMessage.value = ''; // Clear previous errors
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push('/');
      } catch (error) {
        handleLoginError(error.code);
      }
    };

    const handleLoginError = (errorCode) => {
      switch (errorCode) {
        case 'auth/invalid-email':
          errorMessage.value = 'Invalid email format. Please check and try again.';
          break;
        case 'auth/user-disabled':
          errorMessage.value = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/user-not-found':
          errorMessage.value = 'No account found with this email. Please register first.';
          break;
        case 'auth/wrong-password':
          errorMessage.value = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage.value = 'Too many login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage.value = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/internal-error':
          errorMessage.value = 'An internal error occurred. Please try again later.';
          break;
        default:
          errorMessage.value = 'An unexpected error occurred. Please try again.';
      }
    };

    const toggleForgotPassword = () => {
      showForgotPassword.value = !showForgotPassword.value;
    };

    const resetPassword = async () => {
      if (!resetEmail.value) {
        alert('Please enter your email to reset the password.');
        return;
      }
      try {
        await sendPasswordResetEmail(auth, resetEmail.value);
        alert('Password reset email sent! Check your inbox.');
        resetEmail.value = '';
        showForgotPassword.value = false;
      } catch (error) {
        alert('Error sending reset email: ' + error.message);
      }
    };

    return { email, password, login, errorMessage, resetEmail, resetPassword, showForgotPassword, toggleForgotPassword };
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #1d1d1d, #363636);
  font-family: 'Roboto', sans-serif;
}

h2 {
  margin-bottom: 20px;
  color: #fff;
}

.form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
}

.input {
  margin-bottom: 15px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #2e2e2e;
  color: #fff;
}

.input:focus {
  border-color: #42b983;
  outline: none;
}

.button {
  padding: 10px;
  font-size: 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #369870;
}

.error-message {
  color: red;
  margin-top: 10px;
  text-align: center;
}

.forgot-password {
  margin-top: 10px;
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.forgot-password:hover {
  color: #369870;
}

.forgot-password-section {
  margin-top: 15px;
  width: 100%;
  max-width: 400px;
}

.link {
  margin-top: 15px;
  color: #42b983;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .input, .button {
    font-size: 14px;
    padding: 8px;
  }
}
</style>
