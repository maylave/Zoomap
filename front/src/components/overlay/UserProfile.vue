<template>
  <Transition name="modal-backdrop">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md sm:p-6"
      @click="$emit('close')"
    >
      <div
        @click.stop
        class="bg-forest-100/10 relative flex flex-col overflow-hidden border border-white/15 drop-shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        :class="[
          isFullscreen
            ? 'h-full w-full rounded-none md:h-[90vh] md:w-[90vw] md:rounded-3xl'
            : 'h-auto max-h-[85vh] w-full max-w-4xl rounded-2xl',
        ]"
      >
        <!-- ШАПКА -->
        <div class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 class="text-sm font-semibold tracking-wide text-white/70">Настройки профиля</h3>

          <div class="flex items-center gap-2">
            <button
              @click="toggleFullscreen"
              class="group flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all duration-200 hover:bg-white/15 hover:text-white"
              :title="isFullscreen ? 'Свернуть' : 'На весь экран'"
            >
              <BaseIcon
                :name="isFullscreen ? 'minimize' : 'maximize'"
                size="sm"
                class="transition-transform group-hover:scale-110"
              />
            </button>

            <button
              @click="$emit('close')"
              class="group flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all duration-200 hover:bg-red-500/20 hover:text-red-400"
            >
              <BaseIcon
                name="close"
                size="sm"
                class="transition-transform duration-300 group-hover:rotate-90"
              />
            </button>
          </div>
        </div>

        <!-- ТЕЛО: SIDEBAR + КОНТЕНТ -->
        <div class="flex flex-1 flex-col overflow-hidden md:flex-row">
          <!-- ЛЕВАЯ ПАНЕЛЬ -->
          <SidebarMenu
            v-model="activeMenu"
            :menu-groups="menuGroups"
            :show-search="true"
            @select="handleMenuSelect"
          />

          <!-- ПРАВЫЙ КОНТЕНТ -->
          <MainContent :context="currentContext" :active-menu="activeMenu">
    <!-- ✅ Один компонент вместо кучи v-if -->
    <ProfileContent
      :active-menu="activeMenu"
      :profile="profile"
      :is-editing-profile="isEditingProfile"
      :notifications="notifications"
      :appearance="appearance"
      
      @toggle-edit="isEditingProfile = !isEditingProfile"
    />
  </MainContent>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import SidebarMenu from '@/components/ui/leftbar.vue'
import MainContent from '@/components/layout/MainContent.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
 import ProfileContent from '@/components/layout/ProfileContent.vue'

// Импортируем конфигурацию из отдельного файла
import { menuGroups, menuContexts } from '@/static/profileMenu'

// Props & Emits
const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'menuSelect', itemId: string): void
}>()

// Состояние
const isFullscreen = ref(false)
const activeMenu = ref('profile')
const isEditingProfile = ref(false)

// Данные профиля
const profile = ref({
  firstName: 'Мария',
  lastName: 'Иванова',
  email: 'maria@example.com',
  phone: '+7 (999) 123-45-67',
})

const notifications = ref({ email: true, push: true, sound: false })
const appearance = ref({ theme: 'Тёмная', language: 'ru' })
const security = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const privacy = ref({ publicProfile: true, showEmail: false, showPhone: false })
const devices = ref([
  { id: 1, name: 'Chrome на Windows', lastActive: 'Сейчас' },
  { id: 2, name: 'Safari на iPhone', lastActive: '2 часа назад' },
  { id: 3, name: 'Firefox на macOS', lastActive: 'Вчера' },
])

// Данные админки
const users = ref([
  { id: 1, firstName: 'Мария', lastName: 'Иванова', email: 'maria@example.com', role: 'admin' as const, status: 'active' as const, registeredAt: '2024-01-15', lastLogin: '2 часа назад' },
  { id: 2, firstName: 'Алексей', lastName: 'Петров', email: 'alexey@example.com', role: 'moderator' as const, status: 'active' as const, registeredAt: '2024-02-20', lastLogin: 'Вчера' },
  { id: 3, firstName: 'Елена', lastName: 'Сидорова', email: 'elena@example.com', role: 'user' as const, status: 'active' as const, registeredAt: '2024-03-10', lastLogin: '3 дня назад' },
])

// Контекст для MainContent
const currentContext = computed(() => menuContexts[activeMenu.value] ?? menuContexts.profile)

// Блокировка скролла body
let previousOverflow = ''
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = previousOverflow
    }
  },
  { immediate: true }
)

// Escape для закрытия
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) emit('close')
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleEscape)
}

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape)
  }
})

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleMenuSelect = (itemId: string) => {
  activeMenu.value = itemId
  emit('menuSelect', itemId)
}
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
</style>