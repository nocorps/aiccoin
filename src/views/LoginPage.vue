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
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
}

h2 {
  color: #fff;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #0ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.form {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input {
  width: 100%;
  padding: 12px;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.button {
  width: 100%;
  padding: 12px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  color: rgba(0, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.button:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

.error-message {
  color: rgba(255, 77, 77, 0.9);
  background: rgba(255, 77, 77, 0.1);
  padding: 12px;
  border-radius: 15px;
  margin-top: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 77, 77, 0.2);
}

.forgot-password {
  background: none;
  border: none;
  color: rgba(0, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  color: rgba(0, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.forgot-password-section {
  margin-top: 1rem;
  width: 100%;
  max-width: 400px;
}

.link {
  color: rgba(0, 255, 255, 0.7);
  text-decoration: none;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.link:hover {
  color: rgba(0, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form {
    padding: 1.5rem;
  }

  .input, 
  .button {
    padding: 10px;
    font-size: 0.9rem;
  }

  .forgot-password,
  .link {
    font-size: 0.8rem;
  }
}
</style>
