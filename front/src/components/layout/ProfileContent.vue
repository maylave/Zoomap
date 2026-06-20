<script setup lang="ts">
import { computed, type Component, defineAsyncComponent } from 'vue'

// Ленивая загрузка секций
const sections: Record<string, Component> = {
  // Пользовательские секции
  profile: defineAsyncComponent(() => import('./sections/ProfileSection.vue')),
  notifications: defineAsyncComponent(() => import('./sections/NotificationsSection.vue')),
  appearance: defineAsyncComponent(() => import('./sections/AppearanceSection.vue')),
  history: defineAsyncComponent(() => import('./sections/HistorySection.vue')),
  promocodes: defineAsyncComponent(() => import('./sections/PromocodesSection.vue')),
  
  // Админ-секции
  admin: defineAsyncComponent(() => import('./sections/AdminSection.vue')),
  adminUsers: defineAsyncComponent(() => import('./sections/AdminUsersSection.vue')),
  adminAnimals: defineAsyncComponent(() => import('./sections/AdminAnimalsSection.vue')),
  adminZones: defineAsyncComponent(() => import('./sections/AdminZonesSection.vue')),
  adminEvents: defineAsyncComponent(() => import('./sections/AdminEventsSection.vue')),
  adminTickets: defineAsyncComponent(() => import('./sections/AdminTicketsSection.vue')),
  adminBookings: defineAsyncComponent(() => import('./sections/AdminBookingsSection.vue')),
  adminGallery: defineAsyncComponent(() => import('./sections/AdminGallerySection.vue')),
  adminPromocodes: defineAsyncComponent(() => import('./sections/AdminPromocodesSection.vue')),
  adminTicker: defineAsyncComponent(() => import('./sections/AdminTickerSection.vue')),
}

const props = defineProps<{
  activeMenu: string
  profile: any
  isEditingProfile: boolean
  notifications: any
  appearance: any
  promocodes?: any[]
  users?: any[]
  animals?: any[]
  zones?: any[]
  events?: any[]
  tickets?: any[]
  bookings?: any[]
  gallery?: any[]
  ticker?: any[]
}>()

const emit = defineEmits<{
  (e: 'toggleEdit'): void
}>()

// Какой компонент рендерить
const currentComponent = computed(() => 
  sections[props.activeMenu] ?? sections.profile
)

// Какие пропсы передать
const currentProps = computed(() => {
  switch (props.activeMenu) {
    case 'profile':
      return { profile: props.profile, isEditing: props.isEditingProfile }
    case 'notifications':
      return { notifications: props.notifications }
    case 'appearance':
      return { appearance: props.appearance }
    case 'history':
      return {}
    case 'promocodes':
      return { promocodes: props.promocodes || [] }
    case 'admin':
      return {}
    case 'adminUsers':
      return { users: props.users || [] }
    case 'adminAnimals':
      return { animals: props.animals || [] }
    case 'adminZones':
      return { zones: props.zones || [] }
    case 'adminEvents':
      return { events: props.events || [] }
    case 'adminTickets':
      return { tickets: props.tickets || [] }
    case 'adminBookings':
      return { bookings: props.bookings || [] }
    case 'adminGallery':
      return { gallery: props.gallery || [] }
    case 'adminPromocodes':
      return { promocodes: props.promocodes || [] }
    case 'adminTicker':
      return { ticker: props.ticker || [] }
    default:
      return {}
  }
})
</script>

<template>
  <Transition name="fade" mode="out-in">
    <component
      :is="currentComponent"
      v-bind="currentProps"
      :key="activeMenu"
      @toggle-edit="emit('toggleEdit')"
    />
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>