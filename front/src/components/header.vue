<template>
  <header class="fixed inset-x-0 top-0 z-50 transition-all duration-300">
    <nav
      class="flex items-center justify-between px-6 lg:px-16"
      :class="{
        'h-16 bg-neutral-900/80 backdrop-blur-xl border-b border-white/5': isScrolled,
        'h-20 bg-transparent': !isScrolled
      }"
    >
      <!-- Logo -->
      <a href="#" class="text-2xl font-black tracking-tight text-cream-100 whitespace-nowrap group">
        Zoo<span class="text-lime group-hover:text-lime/80 transition-colors">Verse</span>
      </a>

      <!-- Desktop Menu -->
      <ul class="hidden md:flex items-center gap-8 lg:gap-10">
        <template v-for="(block, index) in blocks" :key="index">
          <template v-if="block.links">
            <li v-for="link in block.links" :key="link.path">
              <a
                :href="link.path"
                class="relative text-sm font-medium text-cream-100/70 transition-colors hover:text-lime py-2"
              >
                {{ link.name }}
                <!-- Активная линия -->
                <span 
                  class="absolute bottom-0 left-0 h-0.5 bg-lime w-0 transition-all duration-300 group-hover:w-full"
                  :class="{ 'w-full': link.active }" 
                />
              </a>
            </li>
          </template>

          <!-- Social Icons -->
          <template v-if="block.socials">
            <li v-for="social in block.socials" :key="social.url" class="ml-2">
              <a
                :href="social.url"
                target="_blank"
                rel="noopener"
                class="text-cream-100/50 hover:text-lime transition-colors"
              >
                <component :is="getIcon(social.icon)" class="size-5" />
              </a>
            </li>
          </template>
        </template>

        <!-- CTA Button -->
        <li>
          <a
            href="#visit"
            class="btn btn-lime border border-transparent rounded-full px-6 py-2.5 text-sm font-bold text-forest-900 hover:bg-lime/80 transition-all hover:scale-105 shadow-[0_0_15px_rgba(168,201,107,0.3)]"
          >
            Купить билет
          </a>
        </li>

        <!-- USER DROPDOWN (Обернуто в group/user для hover) -->
        <li class="relative group/user">
          <button 
            class="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 hover:bg-white/10 hover:border-lime-400/50 hover:-translate-y-0.5 transition-all duration-300"
            aria-label="User profile"
          >
            <!-- Аватар -->
            <div class="relative">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-lime-400 to-amber-400 flex items-center justify-center text-sm font-bold text-forest-900 shadow-inner group-hover/user:scale-110 transition-transform duration-300">
                U
              </div>
              <!-- Индикатор онлайна -->
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lime-400 rounded-full border-2 border-forest-900 ring-2 ring-forest-900/50"></span>
            </div>
           
            <!-- Иконка стрелки -->
            <BaseIcon 
              name="arrowDown" 
              size="sm" 
              color="text-white/80 group-hover/user:text-lime-400 group-hover/user:rotate-180"
              class="transition-all duration-1200"
            />
          </button>

          <!-- Выпадающий список (Появляется при наведении на group/user) -->
          <div 
            class="absolute top-full right-0 mt-2 w-40 py-2 rounded-2xl bg-forest-200/60 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/60 z-50
                   opacity-0 invisible translate-y-2 transition-all duration-200 ease-out
                   group-hover/user:opacity-100 group-hover/user:visible group-hover/user:translate-y-0"
          >
            <!-- Пункт: Профиль -->
            <button class="block w-full text-left text-white/80 px-3 py-1.5 rounded-xl  hover:text-lime-400 transition-colors">
              Профиль
            </button>
            
            <!-- Разделитель -->
            <div class="w-full h-px bg-white/10 my-1"></div>
            
            <!-- Пункт: Выйти -->
            <button class="block w-full text-left text-white/80 px-3 rounded-xl py-1.5  hover:text-red-400 transition-colors">
              Выйти
            </button>
          </div>
        </li>
      </ul>

      <!-- Mobile Burger -->
      <button
        class="md:hidden text-cream-100 p-2"
        @click="toggleMenu"
        aria-label="Меню"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="isMenuOpen"
        class="absolute top-full left-0 right-0 flex flex-col gap-2 border-b border-white/10 bg-neutral-900/95 p-6 backdrop-blur-xl md:hidden shadow-2xl"
      >
        <template v-for="(block, index) in blocks" :key="index">
          <template v-if="block.links">
            <a
              v-for="link in block.links"
              :key="link.path"
              :href="link.path"
              @click="closeMenu"
              class="py-3 text-lg font-medium text-cream-100/80 border-b border-white/5 last:border-0 hover:text-lime hover:pl-2 transition-all"
            >
              {{ link.name }}
            </a>
          </template>
        </template>

        <a
          href="#visit"
          @click="closeMenu"
          class="btn btn-lime border border-amber-50 mt-4 w-full py-3 text-center font-bold text-forest-900"
        >
          Купить билет
        </a>
      </div>
    </Transition>
    

  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'

// Типы для навигации
interface NavLink {
  name: string
  path: string
  active?: boolean
}

interface NavBlock {
  links?: NavLink[]
  socials?: { url: string; icon: string }[]
}

const props = withDefaults(defineProps<{
  blocks?: NavBlock[]
}>(), {
  blocks: () => [
    {
      links: [
        { name: 'События', path: '#events' },
        { name: 'Галерея', path: '#gallery' },
        { name: 'Визит', path: '#visit' },
      ]
    },
    {
      socials: [
        { url: 'https://t.me', icon: 'telegram' },
        { url: 'https://vk.com', icon: 'vk' }
      ]
    }
  ]
})

const isScrolled = ref(false)
const isMenuOpen = ref(false)

// Переменная для isOpenUser больше не нужна для десктопа (работает через CSS), 
// но оставим, если захотите использовать для клика на мобилках.
const isOpenUser = ref(false)

// Исправлена опечатка в имени и логика (!isOpenUser вместо !isMenuOpen)
const handleOpenUser = () => {
  isOpenUser.value = !isOpenUser.value
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

const getIcon = (icon: string) => {
  return 'span' 
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}

.btn-lime {
  background-color: #a8c96b; 
  color: #1a2e1a; 
}
.btn-lime:hover {
  background-color: #96b85a;
}

/* Анимация для стрелки вниз при наведении (если BaseIcon не поддерживает rotate) */
.group\/user:hover .arrow-down-icon {
   transform: rotate(180deg);
}
</style>