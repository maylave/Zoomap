import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import form from '@/views/form.vue'
import AnimalsCatalog from '@/views/AnimalsCatalog.vue'
import ZonesAnimals from '@/views/ZonesAnimals.vue'
import ApiDocs from '@/views/ApiDocs.vue'
import NotFound from '@/views/Not.vue'

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
      path: '/zones',
      name: 'ZoneDetail',
      component: ZonesAnimals,
    },
    {
      path: '/animals',
      name: 'AnimalsCatalog',
      component: AnimalsCatalog,
    },
    {
      path: '/404',
      name: 'NotFound',
      component: NotFound,
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

export default router
