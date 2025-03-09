<template>
  <div class="admin-login">
    <form @submit.prevent="handleSubmit" class="login-form">
      <h2>Admin Login</h2>
      
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <div class="input-group">
        <input 
          v-model="email" 
          type="email" 
          placeholder="Admin Email"
          required
          class="admin-input"
        />
      </div>

      <div class="input-group">
        <input 
          v-model="password" 
          type="password" 
          placeholder="Password"
          required
          class="admin-input"
        />
      </div>

      <div class="input-group">
        <input 
          v-model="adminKey" 
          type="password" 
          placeholder="Admin Secret Key"
          required
          class="admin-input"
        />
      </div>

      <button 
        type="submit" 
        class="admin-button"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default {
  setup() {
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const adminKey = ref('');
    const error = ref('');
    const isLoading = ref(false);

    const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY;

    const handleSubmit = async () => {
      error.value = '';
      isLoading.value = true;
      
      try {
        if (adminKey.value !== ADMIN_SECRET_KEY) {
          throw new Error('Invalid admin key');
        }

        const userCredential = await signInWithEmailAndPassword(
          auth, 
          email.value, 
          password.value
        );
        
        const userDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
        if (!userDoc.exists()) {
          throw new Error('Not authorized as admin');
        }
        
        await router.replace('/admin/dashboard');
      } catch (err) {
        error.value = err.message;
        console.error('Login error:', err);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      email,
      password,
      adminKey,
      error,
      isLoading,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-form {
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

h2 {
  color: #fff;
  text-align: center;
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1rem;
}

.admin-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
}

.admin-input:focus {
  outline: none;
  border-color: #0066ff;
}

.admin-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #0066ff, #2e7bff);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.admin-button:hover {
  transform: translateY(-2px);
}

.admin-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}
</style>