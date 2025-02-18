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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #121212;
  color: #e0e0e0;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
