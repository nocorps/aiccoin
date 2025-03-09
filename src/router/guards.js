import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const setupAuthGuards = (router) => {
  router.beforeEach(async (to) => {
    try {
      // Wait for auth to initialize
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        });
      });

      const isAuthenticated = auth.currentUser !== null;

      // Handle admin routes
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (!isAuthenticated) {
          return '/admin';
        }

        const userDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
        if (!userDoc.exists()) {
          return '/admin';
        }
      }

      // Handle auth required routes
      if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
        return '/login';
      }

      // Handle unauth routes (login/register/admin-login)
      if (to.matched.some(record => record.meta.requiresUnauth) && isAuthenticated) {
        if (to.path === '/admin') {
          const userDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
          if (userDoc.exists()) {
            return '/admin/dashboard';
          }
        }
        return '/';
      }
    } catch (error) {
      console.error('Navigation guard error:', error);
      return '/login';
    }
  });
};