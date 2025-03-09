import { auth } from '../firebase'

export const adminRoutes = {
  path: '/admin',
  component: () => import('../admin/layouts/AdminLayout.vue'),
  children: [
    {
      path: '',
      name: 'AdminLogin',
      component: () => import('../admin/views/AdminLogin.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: 'dashboard',
      component: () => import('../admin/layouts/DashboardLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'AdminOverview',
          component: () => import('../admin/views/Overview.vue')
        },
        {
          path: 'tasks',
          name: 'AdminTasks', 
          component: () => import('../admin/views/AddTask.vue')
        },
        {
          path: 'users',
          name: 'ManageUsers',
          component: () => import('../admin/views/ManageUsers.vue')
        },
        {
          path: 'email',
          name: 'EmailToUsers',
          component: () => import('../admin/views/EmailToUsers.vue')
        }
      ]
    }
  ]
}

// Admin Navigation Guard
export const adminGuard = async (to, from, next) => {
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  const user = auth.currentUser
  
  if (requiresAdmin) {
    if (!user) {
      next('/admin')
      return
    }
    // Verify admin status
    try {
      const userDoc = await getDoc(doc(db, 'admins', user.uid))
      if (!userDoc.exists()) {
        next('/admin')
        return  
      }
    } catch (err) {
      next('/admin')
      return
    }
  }

  if (requiresGuest && user) {
    next('/admin/dashboard')
    return
  }

  next()
}