import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import form from '@/views/form.vue'
import AnimalsCatalog from '@/views/AnimalsCatalog.vue'
import ZonesAnimals from '@/views/ZonesAnimals.vue'
import ApiDocs from '@/views/ApiDocs.vue'
import NotFound from '@/views/Not.vue' // ✅ Исправлено

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'form',
      component: form,
    },
    {
      path: '/doc',
      name: 'doc',
      component: ApiDocs,
    },
    {
      path: '/api', // 👈 Добавил маршрут для API
      name: 'ApiDocs',
      component: ApiDocs
    },
    {
      path: '/zones',
      name: 'ZoneDetail',
      component: ZonesAnimals
    },
    {
      path: '/animals',
      name: 'AnimalsCatalog',
      component: AnimalsCatalog
    },
    {
      path: '/404',
      name: 'NotFound',
      component: NotFound,
    },
    {
      path: '/:pathMatch(.*)*', // 👈 Все несуществующие маршруты → 404
      redirect: '/404'
    }
  ],
})

export default router