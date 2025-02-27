import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import HomePage from '../views/HomePage.vue';
import RankingPage from '../views/RankingPage.vue';
import CommunityPage from '../views/CommunityPage.vue';
import TasksPage from '../views/TasksPage.vue';
import ProfilePage from '../views/ProfilePage.vue';
import ReferralPage from '../views/ReferralPage.vue';
import { auth } from '../firebase';

// Define routes
const routes = [
  { path: '/', name: 'Home', component: HomePage, meta: { requiresAuth: true }},
  { path: '/login', name: 'Login', component: LoginPage, meta: { requiresUnauth: true }},
  { path: '/register', name: 'Register', component: RegisterPage, meta: { requiresUnauth: true }},
  { path: '/ranking', name: 'Ranking', component: RankingPage, meta: { requiresAuth: true }},
  { path: '/support-page', name: 'Support', component: CommunityPage, meta: { requiresAuth: true }},
  { path: '/tasks', name: 'Tasks', component: TasksPage, meta: { requiresAuth: true }},
  { path: '/profile', name: 'Profile', component: ProfilePage, meta: { requiresAuth: true }},
  { path: '/referral', name: 'Referral', component: ReferralPage, meta: { requiresAuth: true }},
];

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards to protect routes
router.beforeEach(async (to, from, next) => {
  try {
    // Wait for auth to initialize
    await new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      });
    });

    const isAuthenticated = auth.currentUser !== null;

    // Handle auth required routes
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      next('/login');
      return;
    }

    // Handle auth-only routes (login/register) when user is already logged in
    if (to.matched.some(record => record.meta.requiresUnauth) && isAuthenticated) {
      next('/');
      return;
    }

    next();
  } catch (error) {
    console.error('Navigation guard error:', error);
    next('/login');
  }
});

export default router;
