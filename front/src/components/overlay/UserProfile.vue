<template>
  <Transition name="modal-backdrop">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6"
      @click="$emit('close')"
    >
      <div
        @click.stop
        class="relative flex flex-col bg-forest-100/10 border border-white/15 drop-shadow-2xl overflow-hidden
               transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        :class="[
          isFullscreen 
            ? 'w-full h-full md:w-[90vw] md:h-[90vh] rounded-none md:rounded-3xl' 
            : 'w-full max-w-4xl h-auto max-h-[85vh] rounded-2xl'
        ]"
      >
        <!-- ШАПКА С КНОПКАМИ УПРАВЛЕНИЯ -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h3 class="text-sm font-semibold text-white/70 tracking-wide">
            Настройки профиля
          </h3>
          
          <div class="flex items-center gap-2">
            <button 
              @click="toggleFullscreen"
              class="group flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all duration-200"
              :title="isFullscreen ? 'Свернуть' : 'На весь экран'"
            >
              <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            </button>

            <button 
              @click="$emit('close')"
              class="group flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- ТЕЛО: SIDEBAR + КОНТЕНТ -->
        <div class="flex flex-1 overflow-hidden flex-col md:flex-row">
          
          <!-- ЛЕВАЯ ПАНЕЛЬ (SIDEBAR) -->
          <SidebarMenu 
            v-model="activeMenu"
            :menu-groups="menuGroups"
            :show-search="true"
            @select="handleMenuSelect"
          />

          <!-- ПРАВЫЙ КОНТЕНТ -->
          <main class="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
            <div class="p-6 md:p-8">
              <!-- Заголовок текущего раздела -->
              <div class="mb-6">
                <h2 class="text-2xl font-bold text-white mb-1">
                  {{ currentMenuItem?.label }}
                </h2>
                <p class="text-sm text-white/50">
                  {{ currentMenuItem?.description }}
                </p>
              </div>

              <!-- Слот для контента — сюда можно передать любой контент из родителя -->
              <slot :activeMenu="activeMenu">
                <!-- Дефолтный контент, если слот не передан -->
                <div class="space-y-4">
                  <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 class="text-white font-medium mb-2">Пример поля</h3>
                    <p class="text-sm text-white/60">
                      Это содержимое раздела «{{ currentMenuItem?.label }}». 
                      Вы можете передать сюда любой контент через слот по умолчанию.
                    </p>
                  </div>
                  
                  <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 class="text-white font-medium mb-2">Ещё один блок</h3>
                    <p class="text-sm text-white/60">
                      Контент автоматически скроллится, если не помещается. 
                      Попробуйте развернуть окно на весь экран для лучшего эффекта.
                    </p>
                  </div>
                </div>
              </slot>
            </div>
          </main>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { ref, computed, h, watch, onBeforeUnmount, type Component } from 'vue'
import SidebarMenu from '@/components/ui/leftbar.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'menuSelect', itemId: string): void
}>()

const isFullscreen = ref(false)
const activeMenu = ref('profile')

// Сохраняем предыдущее значение overflow для корректного восстановления
let previousOverflow = ''

// Блокировка скролла при открытии модального окна
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    // Сохраняем текущее значение overflow
    previousOverflow = document.body.style.overflow
    // Блокируем скролл
    document.body.style.overflow = 'hidden'
  } else {
    // Восстанавливаем предыдущее значение
    document.body.style.overflow = previousOverflow
  }
}, { immediate: true })

// Обработка клавиши Escape для закрытия
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    emit('close')
  }
}

// Добавляем слушатель клавиатуры при монтировании
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleEscape)
}

// Очистка при размонтировании компонента
onBeforeUnmount(() => {
  // Восстанавливаем скролл, если компонент уничтожается пока модалка открыта
  document.body.style.overflow = previousOverflow
  
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape)
  }
})

// Простые SVG-иконки как функциональные компоненты
const IconUser = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })]) }
const IconBell = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' })]) }
const IconPalette = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' })]) }
const IconKey = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' })]) }
const IconShield = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })]) }
const IconDevice = { render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })]) }

interface MenuItem {
  id: string
  label: string
  description: string
  icon: Component
  badge?: string | number
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

// Данные меню в формате групп
const menuGroups: MenuGroup[] = [
  {
    title: 'Аккаунт',
    items: [
      { id: 'profile', label: 'Профиль', description: 'Управление личной информацией и аватаром', icon: IconUser },
      { id: 'notifications', label: 'Уведомления', description: 'Настройка оповещений и звуков', icon: IconBell, badge: 3 },
      { id: 'appearance', label: 'Внешний вид', description: 'Тема оформления, язык и шрифты', icon: IconPalette },
    ]
  },
  {
    title: 'Конфиденциальность',
    items: [
      { id: 'security', label: 'Безопасность', description: 'Пароль, двухфакторная аутентификация', icon: IconKey },
      { id: 'privacy', label: 'Конфиденциальность', description: 'Кто может видеть ваш профиль', icon: IconShield },
      { id: 'devices', label: 'Устройства', description: 'Активные сеансы и история входов', icon: IconDevice },
    ]
  }
]

// Плоский список всех пунктов для быстрого поиска
const allMenuItems = computed(() => {
  return menuGroups.flatMap(group => group.items)
})

const currentMenuItem = computed(() => {
  return allMenuItems.value.find(item => item.id === activeMenu.value)
})

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleMenuSelect = (itemId: string) => {
  console.log('Выбран пункт меню:', itemId)
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

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>