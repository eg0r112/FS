import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: {
      title: 'Поиск туров'
    }
  },
  {
    path: '/results',
    name: 'Results',
    component: () => import('@/views/ResultsPage.vue'),
    meta: {
      title: 'Результаты поиска'
    }
  },
  {
    path: '/tour/:hotelId',
    name: 'TourDetails',
    component: () => import('@/views/TourDetailsPage.vue'),
    meta: {
      title: 'Выбор номера'
    }
  },
  {
    path: '/auth/:tourKey',
    name: 'Auth',
    component: () => import('@/views/AuthPage.vue'),
    meta: {
      title: 'Авторизация'
    }
  },
  {
    path: '/payment/:tourKey',
    name: 'Payment',
    component: () => import('@/views/PaymentPage.vue'),
    meta: {
      title: 'Оплата'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    window.scrollTo(0, 0)
    return { top: 0, left: 0 }
  }
})

router.afterEach(() => {
  window.scrollTo(0, 0)
})

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'FUN&SUN Travel'

  next()
})

export default router

