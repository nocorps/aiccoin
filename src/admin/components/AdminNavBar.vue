<template>
  <header class="admin-header">
    <div class="header-left">
      <h1>Admin Dashboard</h1>
      <nav class="admin-nav">
        <router-link 
          to="/admin/dashboard" 
          class="nav-item"
          active-class="active"
          exact
        >
          📊 Overview
        </router-link>
        <router-link 
          to="/admin/dashboard/tasks" 
          class="nav-item"
          active-class="active"
        >
          📝 Tasks
        </router-link>
        <router-link 
          to="/admin/dashboard/users" 
          class="nav-item"
          active-class="active"
        >
          👥 Users
        </router-link>
        <router-link 
          to="/admin/dashboard/email" 
          class="nav-item"
          active-class="active"
        >
          📧 Email Campaign
        </router-link>
      </nav>
    </div>
    <div class="header-right">
      <div class="admin-info">
        <span class="admin-name">{{ adminName }}</span>
        <span class="admin-role">Admin</span>
      </div>
      <button @click="handleLogout" class="logout-btn">
        <span class="logout-icon">🚪</span>
        Logout
      </button>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { ref, onMounted } from 'vue';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export default {
  name: 'AdminNavBar',
  
  setup() {
    const router = useRouter();
    const adminName = ref('');

    // Fetch admin name
    onMounted(async () => {
      if (auth.currentUser) {
        const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
        if (adminDoc.exists()) {
          adminName.value = adminDoc.data().name || auth.currentUser.email?.split('@')[0] || 'Admin';
        }
      }
    });

    const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push('/admin');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    return {
      handleLogout,
      adminName
    };
  }
};
</script>

<style scoped>
.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(45deg, #0066ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.admin-nav {
  display: flex;
  gap: 1rem;
}

.nav-item {
  padding: 0.5rem 1rem;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-item:hover {
  background: rgba(0, 102, 255, 0.1);
  transform: translateY(-2px);
}

.nav-item.active {
  background: rgba(0, 102, 255, 0.2);
  border: 1px solid rgba(0, 102, 255, 0.3);
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn:hover {
  background: rgba(255, 59, 48, 0.2);
  transform: translateY(-2px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.admin-name {
  color: #fff;
  font-weight: 500;
}

.admin-role {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .header-left {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .admin-nav {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .logout-btn {
    width: 100%;
    justify-content: center;
  }

  .header-right {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }

  .admin-info {
    align-items: center;
  }
}
</style>