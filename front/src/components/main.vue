<template>
  <div class="min-h-screen bg-forest-400">
    <Header 
      @open-profile="isProfileOpen = true"
      @toggle-admin="toggleAdminMode"
    />
    
    <!-- Hero Section -->
    <EditableSection
      @edit="editHero"
      :actions="getHeroActions()"
      :is-admin-mode="isAdminMode"
    >
      <Hero ref="heroRef" />
    </EditableSection>

    <Marquee />

    <!-- Events Section -->
    <EditableSection
      @edit="editEvents"
      :actions="getEventsActions()"
      :is-admin-mode="isAdminMode"
    >
      <Events ref="eventsRef" />
    </EditableSection>

    <!-- Gallery Section -->
    <EditableSection
      @edit="editGallery"
      :actions="getGalleryActions()"
      :is-admin-mode="isAdminMode"
    >
      <Gallery ref="galleryRef" />
    </EditableSection>

    <!-- Visit Section -->
    <EditableSection
      @edit="editVisit"
      :actions="getVisitActions()"
      :is-admin-mode="isAdminMode"
    >
      <Visit ref="visitRef" />
    </EditableSection>

    <Form />

    <!-- Profile Modal -->
    <UserProfile 
      :visible="isProfileOpen" 
      @close="isProfileOpen = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import EditableSection from './layout/EditableSection.vue'
import Header from '@/components/header.vue'
import UserProfile from './overlay/UserProfile.vue'
import Hero from '@/components/hero.vue'
import Events from './home/events.vue'
import Form from './home/form.vue'
import Gallery from './home/gallery.vue'
import Marquee from './home/marquee.vue'
import Visit from './home/visit.vue'

const authStore = useAuthStore()

// Refs
const heroRef = ref<InstanceType<typeof Hero> | null>(null)
const eventsRef = ref<InstanceType<typeof Events> | null>(null)
const galleryRef = ref<InstanceType<typeof Gallery> | null>(null)
const visitRef = ref<InstanceType<typeof Visit> | null>(null)

// State
const isProfileOpen = ref(false)
const isAdminMode = ref(false)

// ==================== LIFECYCLE ====================

onMounted(async () => {
  // Инициализация авторизации
  await authStore.init()
  
  // ✅ Если админ - включаем режим редактирования
  if (authStore.isAdmin) {
    isAdminMode.value = true
  }
})

// ==================== ADMIN MODE ====================

const toggleAdminMode = () => {
  if (!authStore.isAdmin) {
    ElMessage.warning('Только администраторы могут переключать режим')
    return
  }
  
  isAdminMode.value = !isAdminMode.value
  ElMessage.success(isAdminMode.value ? 'Режим редактирования включён' : 'Режим редактирования выключен')
}

// ==================== ACTIONS GENERATORS ====================
// ✅ Возвращаем действия ТОЛЬКО если админ И в режиме редактирования

const getHeroActions = () => {
  // ✅ Проверяем: админ И в режиме редактирования
  if (!authStore.isAdmin || !isAdminMode.value) return []
  
  return [
    { 
      label: 'Режим редактирования', 
      icon: 'fa-solid fa-pen-to-square',
      onClick: toggleHeroEditMode 
    },
    { 
      label: 'Изменить фон', 
      icon: 'fa-solid fa-image',
      onClick: editHeroBackground 
    },
  ]
}

const getEventsActions = () => {
  if (!authStore.isAdmin || !isAdminMode.value) return []
  
  return [
    { 
      label: 'Изменить заголовок', 
      icon: 'fa-solid fa-heading',
      onClick: editTitle 
    },
    { 
      label: 'Изменить фон', 
      icon: 'fa-solid fa-image',
      onClick: editBackground 
    },
    { 
      label: 'Удалить события', 
      icon: 'fa-solid fa-trash',
      variant: 'danger' as const,
      onClick: enableEventsDeleteMode 
    },
  ]
}

const getGalleryActions = () => {
  if (!authStore.isAdmin || !isAdminMode.value) return []
  
  return [
    { 
      label: 'Изменить заголовок', 
      icon: 'fa-solid fa-heading',
      onClick: editGalleryTitle 
    },
    { 
      label: 'Изменить описание', 
      icon: 'fa-solid fa-align-left',
      onClick: editGalleryDescription 
    },
    { 
      label: 'Удалить фото', 
      icon: 'fa-solid fa-trash',
      variant: 'danger' as const,
      onClick: enableGalleryDeleteMode 
    },
  ]
}

const getVisitActions = () => {
  if (!authStore.isAdmin || !isAdminMode.value) return []
  
  return [
    { 
      label: 'Изменить заголовок', 
      icon: 'fa-solid fa-heading',
      onClick: editVisitTitle 
    },
    { 
      label: 'Изменить описание', 
      icon: 'fa-solid fa-align-left',
      onClick: editVisitDescription 
    },
    { 
      label: 'Удалить билеты', 
      icon: 'fa-solid fa-trash',
      variant: 'danger' as const,
      onClick: enableVisitDeleteMode 
    },
  ]
}

// ==================== HERO HANDLERS ====================

const editHero = () => {
  console.log('Редактировать Hero')
}

const toggleHeroEditMode = () => {
  heroRef.value?.toggleEditMode()
}

const editHeroBackground = () => {
  console.log('Изменить фон Hero')
}

// ==================== EVENTS HANDLERS ====================

const editEvents = () => {
  console.log('Редактировать Events')
}

const editTitle = () => {
  console.log('Изменить заголовок Events')
}

const editBackground = () => {
  console.log('Изменить фон Events')
}

const enableEventsDeleteMode = () => {
  eventsRef.value?.enableDeleteMode()
}

// ==================== GALLERY HANDLERS ====================

const editGallery = () => {
  console.log('Редактировать Gallery')
}

const editGalleryTitle = () => {
  console.log('Изменить заголовок Gallery')
}

const editGalleryDescription = () => {
  console.log('Изменить описание Gallery')
}

const enableGalleryDeleteMode = () => {
  galleryRef.value?.enableDeleteMode()
}

// ==================== VISIT HANDLERS ====================

const editVisit = () => {
  console.log('Редактировать Visit')
}

const editVisitTitle = () => {
  console.log('Изменить заголовок Visit')
}

const editVisitDescription = () => {
  console.log('Изменить описание Visit')
}

const enableVisitDeleteMode = () => {
  visitRef.value?.enableDeleteMode()
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>