<template>
  <div class="app-container">
    <!-- Only show NavBar for non-admin routes -->
    <NavBar v-if="!isAdminRoute" />
    <main :class="{ 'content': !isAdminRoute, 'admin-content': isAdminRoute }">
      <router-view />
    </main>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  components: { NavBar },
  setup() {
    const route = useRoute();
    
    const isAdminRoute = computed(() => {
      return route.path.startsWith('/admin');
    });

    return {
      isAdminRoute
    };
  }
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  width: 100%;
  padding: 0;
  margin: 0;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
}

.content {
  padding-bottom: 100px; /* Add padding for the bottom nav */
}

.admin-content {
  padding: 0;
  min-height: 100vh;
  background: #1a1a1a;
}

@media (max-width: 768px) {
  .content {
    padding-bottom: 120px; /* Increase padding for mobile screens */
  }
  
  .admin-content {
    padding: 0;
  }
}
</style>
