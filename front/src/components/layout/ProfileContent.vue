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
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <i class="fa-solid fa-user-gear text-white/70"></i>
            </div>
            <div>
              <h3 class="text-sm font-semibold tracking-wide text-white/90">Настройки профиля</h3>
              <p class="text-xs text-white/50">{{ currentContext.description }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Индикатор загрузки бейджей -->
            <div
              v-if="isLoadingBadges"
              class="mr-2 flex items-center gap-2 text-xs text-white/50"
            >
              <i class="fa-solid fa-circle-notch fa-spin"></i>
              <span>Обновление...</span>
            </div>

            <!-- Кнопка обновления данных -->
            <button
              @click="refreshBadges"
              :disabled="isLoadingBadges"
              class="group flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all duration-200 hover:bg-white/15 hover:text-white disabled:opacity-50"
              title="Обновить данные"
            >
              <i class="fa-solid fa-arrows-rotate text-xs transition-transform group-hover:rotate-180"></i>
            </button>

            <button
              @click="toggleFullscreen"
              class="group flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all duration-200 hover:bg-white/15 hover:text-white"
              :title="isFullscreen ? 'Свернуть' : 'На весь экран'"
            >
              <i
                :class="isFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'"
                class="text-xs transition-transform group-hover:scale-110"
              ></i>
            </button>

            <button
              @click="$emit('close')"
              class="group flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all duration-200 hover:bg-red-500/20 hover:text-red-400"
              title="Закрыть"
            >
              <i class="fa-solid fa-xmark text-xs transition-transform duration-300 group-hover:rotate-90"></i>
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
            <ProfileContent
              :active-menu="activeMenu"
              :profile="profile"
              :is-editing-profile="isEditingProfile"
              :notifications="notifications"
              :appearance="appearance"
              @toggle-edit="isEditingProfile = !isEditingProfile"
              @refresh-badges="refreshBadges"
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
import ProfileContent from '@/components/layout/ProfileContent.vue'

// Конфигурация меню
import { createMenuGroups, updateMenuBadges, menuContexts } from '@/static/profileMenu'

// Composable для реальных бейджей
import { useMenuBadges } from '@/composables/useMenuBadges'

// Props & Emits
const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'menuSelect', itemId: string): void
}>()

// ==================== СОСТОЯНИЕ ====================

const isFullscreen = ref(false)
const activeMenu = ref('profile')
const isEditingProfile = ref(false)

// ✅ Динамическое меню с бейджами
const menuGroups = createMenuGroups()

// ✅ Реальные бейджи из БД
const { badges, isLoading: isLoadingBadges, fetchBadges } = useMenuBadges()

// ==================== ДАННЫЕ ПРОФИЛЯ ====================

const profile = ref({
  firstName: 'Мария',
  lastName: 'Иванова',
  email: 'maria@example.com',
  phone: '+7 (999) 123-45-67',
})

const notifications = ref({ email: true, push: true, sound: false })
const appearance = ref({ theme: 'Тёмная', language: 'ru' })

// ==================== COMPUTED ====================

// Контекст для MainContent
const currentContext = computed(() => menuContexts[activeMenu.value] ?? menuContexts.profile)

// ==================== WATCHERS ====================

// Обновляем бейджи в меню при изменении данных
watch(
  badges,
  (newBadges) => {
    updateMenuBadges(menuGroups, newBadges)
  },
  { deep: true, immediate: true }
)

// Блокировка скролла body
let previousOverflow = ''
watch(
  () => props.visible,
  async (isVisible) => {
    if (isVisible) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      
      // Загружаем бейджи при открытии модалки
      await refreshBadges()
    } else {
      document.body.style.overflow = previousOverflow
    }
  },
  { immediate: true }
)

// ==================== METHODS ====================

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleMenuSelect = (itemId: string) => {
  activeMenu.value = itemId
  emit('menuSelect', itemId)
}

const refreshBadges = async () => {
  try {
    await fetchBadges()
  } catch (error) {
    console.error('Error refreshing badges:', error)
  }
}

// ==================== KEYBOARD ====================

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) emit('close')
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleEscape)
}

// ==================== LIFECYCLE ====================

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape)
  }
})
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

.modal-backdrop-enter-active > div,
.modal-backdrop-leave-active > div {
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.modal-backdrop-enter-from > div {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

.modal-backdrop-leave-to > div {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}
</style>