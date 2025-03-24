<template>
  <div class="app-container safe-area">
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

/* Add safe area padding */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.content {
  padding-bottom: calc(100px + env(safe-area-inset-bottom)); /* Add safe area to bottom padding */
}

.admin-content {
  padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
  min-height: 100vh;
  background: #1a1a1a;
}

@media (max-width: 768px) {
  .content {
    padding-bottom: calc(120px + env(safe-area-inset-bottom)); /* Add safe area to mobile padding */
  }
  
  .admin-content {
    padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
  }
}
</style>
