<template>
  <div class="banned-container">
    <div class="banned-content">
      <i class="fas fa-ban ban-icon"></i>
      <h1>Account Suspended</h1>
      <p>Your account has been suspended due to violation of our terms of service.</p>
      <p class="contact-info">
        If you believe this is a mistake, please contact support:
        <a href="mailto:support@aiccoin.site">support@aiccoin.site</a>
      </p>
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>
  </div>
</template>

<script>
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'BannedPage',
  setup() {
    const router = useRouter();

    const logout = async () => {
      try {
        await signOut(auth);
        router.push('/login');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

    return { logout };
  }
};
</script>

<style scoped>
.banned-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #1a1a1a, #000);
  padding: 1rem;
}

.banned-content {
  background: rgba(255, 0, 0, 0.1);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  max-width: 500px;
  border: 1px solid rgba(255, 0, 0, 0.2);
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.1);
}

.ban-icon {
  font-size: 4rem;
  color: #ff4444;
  margin-bottom: 1rem;
}

h1 {
  color: #ff4444;
  margin-bottom: 1rem;
}

p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.contact-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 10px;
  margin: 1.5rem 0;
}

.contact-info a {
  color: #0ff;
  text-decoration: none;
}

.logout-btn {
  background: rgba(255, 77, 77, 0.1);
  color: rgba(255, 77, 77, 0.9);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 77, 77, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 77, 77, 0.2);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .banned-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>