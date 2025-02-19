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
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
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
router.beforeEach((to, from, next) => {
  const user = auth.currentUser;
  if (to.matched.some(record => record.meta.requiresAuth) && !user) {
    next('/login');
  } else {
    next();
  }
});

export default router;
