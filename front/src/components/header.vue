<template>
  <header class="fixed inset-x-0 top-0 z-50 transition-all duration-300">
    <!-- Индикатор админ-режима -->
    <div
      v-if="isAdmin"
      class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse-slow"
    ></div>

    <nav
      class="flex items-center justify-between px-6 lg:px-16"
      :class="{
        'h-16 border-b border-white/5 bg-neutral-900/80 backdrop-blur-xl': isScrolled,
        'h-20 bg-transparent': !isScrolled,
      }"
    >
      <!-- Logo (теперь кликабельный с переходом на главную) -->
      <router-link
        to="/"
        class="text-cream-100 group text-2xl font-black tracking-tight whitespace-nowrap"
        @click="handleLogoClick"
      >
        Zoo<span class="text-lime group-hover:text-lime/80 transition-colors">Verse</span>
        <!-- Admin Badge -->
        <span
          v-if="isAdmin"
          class="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/20 border border-accent/40 px-2 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider align-middle"
        >
          <i class="fa-solid fa-shield-halved text-[8px]"></i>
          Admin
        </span>
      </router-link>

      <!-- Desktop Menu -->
      <ul class="hidden items-center gap-8 md:flex lg:gap-10">
        <template v-for="(block, index) in blocks" :key="index">
          <template v-if="block.links">
            <li v-for="link in block.links" :key="link.path">
              <a
                :href="link.path"
                class="text-cream-100/70 hover:text-lime relative py-2 text-sm font-medium transition-colors"
                @click.prevent="handleNavLinkClick(link.path)"
              >
                {{ link.name }}
                <!-- Активная линия -->
                <span
                  class="bg-lime absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
                  :class="{ 'w-full': isActiveLink(link.path) }"
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
            class="btn btn-lime text-forest-900 hover:bg-lime/80 rounded-full border border-transparent px-6 py-2.5 text-sm font-bold shadow-[0_0_15px_rgba(168,201,107,0.3)] transition-all hover:scale-105"
            @click.prevent="handleNavLinkClick('#visit')"
          >
            Купить билет
          </a>
        </li>

        <!-- Admin Toggle -->
        <li v-if="isAdmin" class="flex items-center gap-2">
          <button
            @click="emit('toggleAdmin')"
            class="group/admin-toggle relative flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 transition-all hover:border-accent/60 hover:bg-accent/20"
            title="Выйти из режима админа"
          >
            <i class="fa-solid fa-shield-halved text-accent text-xs"></i>
            <span class="text-xs font-semibold text-accent">Admin</span>
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
          </button>
        </li>

        <!-- USER DROPDOWN -->
        <li class="group/user relative">
          <button
            class="flex items-center gap-2 rounded-full border border-white/5 px-4 py-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-lime-400/50 hover:bg-white/10"
            :class="{ 'border-accent/30 bg-accent/5': isAdmin }"
            aria-label="User profile"
          >
            <div class="relative">
              <div
                class="text-forest-900 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-amber-400 text-sm font-bold shadow-inner transition-transform duration-300 group-hover/user:scale-110"
                :class="{ 'ring-2 ring-accent/50': isAdmin }"
              >
                {{ isAdmin ? 'A' : 'U' }}
              </div>
              <span
                class="border-forest-900 ring-forest-900/50 absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 ring-2"
                :class="isAdmin ? 'bg-accent' : 'bg-lime-400'"
              ></span>
            </div>

            <BaseIcon
              name="arrowDown"
              size="sm"
              color="text-white/80 group-hover/user:text-lime-400 group-hover/user:rotate-180"
              class="transition-all duration-1200"
            />
          </button>

          <!-- Dropdown -->
          <div
            class="bg-forest-200/60 invisible absolute top-full right-0 z-50 mt-2 w-52 translate-y-2 rounded-2xl border border-white/10 py-2 opacity-0 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-200 ease-out group-hover/user:visible group-hover/user:translate-y-0 group-hover/user:opacity-100"
          >
            <div v-if="isAdmin" class="px-4 py-2 border-b border-white/10 mb-1">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-shield-halved text-accent text-xs"></i>
                <span class="text-xs font-bold text-accent uppercase tracking-wider">Режим администратора</span>
              </div>
              <p class="text-[10px] text-white/40 mt-1">Доступно редактирование всех секций</p>
            </div>

            <button
              class="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-white/80 transition-colors hover:text-lime-400"
              @click="emit('openProfile')"
            >
              <i class="fa-solid fa-user text-xs w-4"></i>
              <span>Профиль</span>
            </button>

            <button
              v-if="!isAdmin"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-white/80 transition-colors hover:text-accent"
              @click="emit('toggleAdmin')"
            >
              <i class="fa-solid fa-shield-halved text-xs w-4"></i>
              <span>Войти как админ</span>
            </button>

            <button
              v-else
              class="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-white/80 transition-colors hover:text-accent"
              @click="emit('toggleAdmin')"
            >
              <i class="fa-solid fa-shield text-xs w-4"></i>
              <span>Выйти из режима админа</span>
            </button>

            <div class="my-1 h-px w-full bg-white/10"></div>

            <button
              class="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-white/80 transition-colors hover:text-red-400"
            >
              <i class="fa-solid fa-right-from-bracket text-xs w-4"></i>
              <span>Выйти</span>
            </button>
          </div>
        </li>
      </ul>

      <!-- Mobile Burger -->
      <button class="text-cream-100 p-2 md:hidden" @click="toggleMenu" aria-label="Меню">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
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
        class="absolute top-full right-0 left-0 flex flex-col gap-2 border-b border-white/10 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-xl md:hidden"
      >
        <div
          v-if="isAdmin"
          class="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 mb-2"
        >
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-shield-halved text-accent"></i>
            <span class="text-sm font-bold text-accent">Режим админа</span>
          </div>
          <button
            @click="emit('toggleAdmin')"
            class="text-xs text-accent/60 hover:text-accent transition-colors"
          >
            Выйти
          </button>
        </div>

        <template v-for="(block, index) in blocks" :key="index">
          <template v-if="block.links">
            <a
              v-for="link in block.links"
              :key="link.path"
              :href="link.path"
              @click.prevent="handleNavLinkClick(link.path); closeMenu()"
              class="text-cream-100/80 hover:text-lime border-b border-white/5 py-3 text-lg font-medium transition-all last:border-0 hover:pl-2"
            >
              {{ link.name }}
            </a>
          </template>
        </template>

        <a
          href="#visit"
          @click.prevent="handleNavLinkClick('#visit'); closeMenu()"
          class="btn btn-lime text-forest-900 mt-4 w-full border border-amber-50 py-3 text-center font-bold"
        >
          Купить билет
        </a>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseIcon from '@/components/ui/BaseIcon.vue'

interface NavLink {
  name: string
  path: string
  active?: boolean
}

interface NavBlock {
  links?: NavLink[]
  socials?: { url: string; icon: string }[]
}

const props = withDefaults(
  defineProps<{
    blocks?: NavBlock[]
    isAdmin?: boolean
  }>(),
  {
    isAdmin: false,
    blocks: () => [
      {
        links: [
          { name: 'События', path: '#events' },
          { name: 'Галерея', path: '#gallery' },
          { name: 'Визит', path: '#visit' },
        ],
      },
      {
        socials: [
          { url: 'https://t.me', icon: 'telegram' },
          { url: 'https://vk.com', icon: 'vk' },
        ],
      },
    ],
  }
)

const emit = defineEmits<{
  (e: 'openProfile'): void
  (e: 'toggleAdmin'): void
}>()

const router = useRouter()
const route = useRoute()

const isScrolled = ref(false)
const isMenuOpen = ref(false)
const isOpenUser = ref(false)

// 🔑 Умная навигация: если мы не на главной — сначала переходим на главную, потом скроллим
const handleNavLinkClick = (path: string) => {
  if (route.path !== '/') {
    // Сначала переходим на главную, потом скроллим к секции
    router.push('/').then(() => {
      // Небольшая задержка, чтобы страница успела отрендериться
      setTimeout(() => {
        scrollToSection(path)
      }, 100)
    })
  } else {
    // Уже на главной — просто скроллим
    scrollToSection(path)
  }
}

// 🔑 Клик по логотипу
const handleLogoClick = () => {
  if (route.path === '/') {
    // Если уже на главной — скроллим наверх
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  // Если не на главной — router-link сам сделает переход
}

// 🔑 Проверка активной ссылки
const isActiveLink = (path: string) => {
  return route.hash === path
}

// 🔑 Плавный скролл к секции
const scrollToSection = (hash: string) => {
  if (!hash || hash === '#') return
  const element = document.querySelector(hash)
  if (element) {
    const offset = 80 // Высота хедера
    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    })
  }
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
  
  // 🔑 Если пришли по ссылке с hash (например, /#events) — скроллим к секции
  if (route.hash) {
    setTimeout(() => {
      scrollToSection(route.hash)
    }, 300)
  }
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

.group\/user:hover .arrow-down-icon {
  transform: rotate(180deg);
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}
</style>