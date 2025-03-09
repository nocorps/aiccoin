import { createRouter, createWebHistory } from 'vue-router';
import { mainRoutes } from './main.routes';
import { adminRoutes } from './admin.routes';
import { setupAuthGuards } from './guards';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...mainRoutes,
    adminRoutes
  ]
});

// Setup auth guards
setupAuthGuards(router);

export default router;
