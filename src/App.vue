<template>
  <div class="app-container">
    <NavBar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
  components: { NavBar }
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
}

.content {
  padding-bottom: 100px; /* Add padding for the bottom nav */
}

@media (max-width: 768px) {
  .content {
    padding-bottom: 120px; /* Increase padding for mobile screens */
  }
}
</style>
