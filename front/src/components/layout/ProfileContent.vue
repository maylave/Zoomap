<script setup lang="ts">
import { computed, type Component, defineAsyncComponent } from 'vue'

// Ленивая загрузка секций
const sections: Record<string, Component> = {
  profile: defineAsyncComponent(() => import('./sections/ProfileSection.vue')),
  notifications: defineAsyncComponent(() => import('./sections/NotificationsSection.vue')),
  appearance: defineAsyncComponent(() => import('./sections/AppearanceSection.vue')),
  history: defineAsyncComponent(() => import('./sections/HistorySection.vue')),
  admin: defineAsyncComponent(() => import('./sections/AdminSection.vue')),
}

const props = defineProps<{
  activeMenu: string
  profile: any
  isEditingProfile: boolean
  notifications: any
  appearance: any
  users: any  // ✅ Добавлено для админки
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
      return {}  // История не требует пропсов (данные внутри компонента)
    case 'admin':
      return { users: props.users }
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