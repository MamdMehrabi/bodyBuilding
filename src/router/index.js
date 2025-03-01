import { createRouter, createWebHistory } from 'vue-router'
import { getSupabaseClient } from '../services/supabase'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue')
    },
    {
      path: '/clubs',
      name: 'clubs',
      component: () => import('../views/clubs/ClubsListView.vue')
    },
    {
      path: '/clubs/:id',
      name: 'club-details',
      component: () => import('../views/clubs/ClubDetailsView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/user/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/club-owner',
      name: 'club-owner-dashboard',
      component: () => import('../views/club-owner/DashboardView.vue'),
      meta: { requiresAuth: true, requiresRole: 'club_owner' }
    },
    {
      path: '/club-owner/add-club',
      name: 'add-club',
      component: () => import('../views/club-owner/AddClubView.vue'),
      meta: { requiresAuth: true, requiresRole: 'club_owner' }
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/admin/DashboardView.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    },
    {
      path: '/admin/club-approvals',
      name: 'club-approvals',
      component: () => import('../views/admin/ClubApprovalsView.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresRole = to.meta.requiresRole

  if (requiresAuth && !data.session) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (requiresRole && data.session) {
    // Check user role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.session.user.id)
      .single()

    if (!profileData || profileData.role !== requiresRole) {
      next({ name: 'home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router