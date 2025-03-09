<template>
  <div class="dashboard-layout">
    <AdminNavBar />
    <main class="dashboard-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
import AdminNavBar from '../components/AdminNavBar.vue';

export default {
  components: {
    AdminNavBar
  }
};
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
}

.dashboard-content {
  padding-top: 80px;
  padding-bottom: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>