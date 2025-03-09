import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import RankingPage from '../views/RankingPage.vue'
import CommunityPage from '../views/CommunityPage.vue'
import TasksPage from '../views/TasksPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import ReferralPage from '../views/ReferralPage.vue'
import GamesPage from '../views/GamesPage.vue'
import CoinFlip from '../games/CoinFlip.vue'
import ScratchCard from '../games/ScratchCard.vue'
import NumberGuess from '../games/NumberGuess.vue'

export const mainRoutes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresUnauth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresUnauth: true }
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: RankingPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/support-page',
    name: 'Support',
    component: CommunityPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TasksPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/referral',
    name: 'Referral',
    component: ReferralPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/games',
    name: 'Games',
    component: GamesPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/games/coin-flip',
    name: 'CoinFlip',
    component: CoinFlip,
    meta: { requiresAuth: true }
  },
  {
    path: '/games/scratch-card',
    name: 'ScratchCard',
    component: ScratchCard,
    meta: { requiresAuth: true }
  },
  {
    path: '/games/number-guess',
    name: 'NumberGuess',
    component: NumberGuess,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]