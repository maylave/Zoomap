<template>
  <header class="fixed inset-x-0 top-0 z-50 transition-all duration-300">
    <!-- Индикатор админ-режима -->
    <div
      v-if="authStore.isAdmin"
      class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse-slow"
    ></div>

    <nav
      class="flex items-center justify-between px-6 lg:px-16"
      :class="{
        'h-16 border-b border-white/5 bg-neutral-900/80 backdrop-blur-xl': isScrolled,
        'h-20 bg-transparent': !isScrolled,
      }"
    >
      <!-- Logo -->
      <router-link
        to="/"
        class="text-cream-100 group text-2xl font-black tracking-tight whitespace-nowrap flex items-center gap-2"
        @click="handleLogoClick"
      >
        <!-- ✅ Логотип с fallback -->
        <template v-if="!logoError">
          <img
            class="h-35 w-auto object-contain"
            src="@/assets/logo.png"
            alt="ZooVerse"
            @error="logoError = true"
          />
        </template>
        <template v-else>
          <!-- Fallback: текстовый логотип если изображение не загрузилось -->
          <div class="flex items-center gap-2">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-amber-400">
              <i class="fa-solid fa-paw text-forest-900 text-lg"></i>
            </div>
            <span class="bg-gradient-to-r from-lime-400 to-amber-400 bg-clip-text text-transparent text-xl font-bold">
              ZooVerse
            </span>
          </div>
        </template>

        <!-- Admin Badge -->
        
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
        <li v-if="authStore.isAdmin" class="flex items-center gap-2">
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
        <li v-if="authStore.isAuthenticated" class="group/user relative">
          <button
            class="flex items-center gap-2 rounded-full border border-white/5 px-4 py-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-lime-400/50 hover:bg-white/10"
            :class="{ 'border-accent/30 bg-accent/5': authStore.isAdmin }"
            aria-label="User profile"
          >
            <div class="relative">
              <!-- ✅ Аватар пользователя с fallback -->
              <div
                class="text-forest-900 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-amber-400 text-sm font-bold shadow-inner transition-transform duration-300 group-hover/user:scale-110 overflow-hidden"
                :class="{ 'ring-2 ring-accent/50': authStore.isAdmin }"
              >
                <img
                  v-if="authStore.userAvatar && !avatarError"
                  :src="authStore.userAvatar"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                  @error="avatarError = true"
                />
                <span v-else>{{ userInitial }}</span>
              </div>
              <span
                class="border-forest-900 ring-forest-900/50 absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 ring-2"
                :class="authStore.isAdmin ? 'bg-accent' : 'bg-lime-400'"
              ></span>
            </div>

            <span class="hidden lg:block text-sm text-cream-100/80 max-w-[120px] truncate">
              {{ authStore.user?.name }}
            </span>

            <!-- Стрелка-шеврон (Font Awesome) — поворачивается при открытом dropdown -->
            <i
              class="fa-solid fa-chevron-down text-xs text-white/80 transition-transform duration-200 group-hover/user:rotate-180 group-hover/user:text-lime-400"
              aria-hidden="true"
            ></i>
          </button>

          <!-- Dropdown Menu -->
          <div
            class="bg-forest-200/60 invisible absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border border-white/10 py-2 opacity-0 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-200 ease-out group-hover/user:visible group-hover/user:translate-y-0 group-hover/user:opacity-100"
          >
            <!-- Информация о пользователе -->
            <div class="px-4 py-3 border-b border-white/10 mb-1">
              <div class="flex items-center gap-3">
                <!-- ✅ Аватар в dropdown с fallback -->
                <div
                  class="text-forest-900 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-amber-400 font-bold overflow-hidden"
                >
                  <img
                    v-if="authStore.userAvatar && !avatarError"
                    :src="authStore.userAvatar"
                    alt="Avatar"
                    class="w-full h-full object-cover"
                    @error="avatarError = true"
                  />
                  <span v-else class="text-lg">{{ userInitial }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-cream-100 truncate">
                    {{ authStore.user?.name }}
                  </p>
                  <p class="text-xs text-white/50 truncate">
                    {{ authStore.user?.email }}
                  </p>
                  <div v-if="authStore.isAdmin" class="mt-1 flex items-center gap-1">
                    <i class="fa-solid fa-shield-halved text-accent text-[10px]"></i>
                    <span class="text-[10px] font-bold text-accent uppercase">Администратор</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Профиль -->
            <button
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-white/80 transition-colors hover:text-lime-400 hover:bg-white/5"
              @click="emit('openProfile')"
            >
              <i class="fa-solid fa-user text-xs w-4"></i>
              <span>Профиль</span>
            </button>

           

            <div class="my-1 h-px w-full bg-white/10"></div>

            <!-- Выйти -->
            <button
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-white/80 transition-colors hover:text-red-400 hover:bg-white/5"
              @click="handleLogout"
            >
              <i class="fa-solid fa-right-from-bracket text-xs w-4"></i>
              <span>Выйти</span>
            </button>
          </div>
        </li>

        <!-- Login Button (если не авторизован) -->
        <li v-else>
          <router-link
            to="/login"
            class="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-cream-100/90 transition-all hover:border-lime-400/50 hover:bg-lime-400/5 hover:text-lime-400"
          >
            Войти
          </router-link>
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
        class="absolute top-full right-0 left-0 flex flex-col gap-2 border-b border-white/10 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-xl md:hidden max-h-[calc(100vh-5rem)] overflow-y-auto"
      >
        <!-- Информация о пользователе (мобильная) -->
        <div
          v-if="authStore.isAuthenticated"
          class="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl border border-white/10 bg-white/5"
        >
          <!-- ✅ Аватар мобильный с fallback -->
          <div
            class="text-forest-900 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-amber-400 font-bold overflow-hidden"
          >
            <img
              v-if="authStore.userAvatar && !avatarError"
              :src="authStore.userAvatar"
              alt="Avatar"
              class="w-full h-full object-cover"
              @error="avatarError = true"
            />
            <span v-else class="text-lg">{{ userInitial }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-cream-100 truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-white/50 truncate">
              {{ authStore.user?.email }}
            </p>
          </div>
        </div>

        <!-- Админ-индикатор -->
        <div
          v-if="authStore.isAdmin"
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

        <!-- Навигационные ссылки -->
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

        <!-- Кнопка "Купить билет" -->
        <a
          href="#visit"
          @click.prevent="handleNavLinkClick('#visit'); closeMenu()"
          class="btn btn-lime text-forest-900 mt-4 w-full border border-amber-50 py-3 text-center font-bold"
        >
          Купить билет
        </a>

        <!-- Кнопка входа для мобильных -->
        <router-link
          v-if="!authStore.isAuthenticated"
          to="/login"
          @click="closeMenu()"
          class="mt-2 w-full rounded-xl border border-white/20 py-3 text-center text-cream-100/90 hover:border-lime-400/50 hover:bg-lime-400/5 hover:text-lime-400 transition-all"
        >
          Войти
        </router-link>

        <!-- Действия для авторизованных -->
        <template v-if="authStore.isAuthenticated">
          <button
            @click="emit('openProfile'); closeMenu()"
            class="mt-2 w-full rounded-xl border border-white/20 py-3 text-center text-cream-100/90 hover:border-lime-400/50 hover:bg-lime-400/5 hover:text-lime-400 transition-all"
          >
            <i class="fa-solid fa-user mr-2"></i>
            Профиль
          </button>


         

          <button
            @click="handleLogout"
            class="w-full rounded-xl border border-red-500/30 py-3 text-center text-red-400 hover:bg-red-500/10 transition-all"
          >
            <i class="fa-solid fa-right-from-bracket mr-2"></i>
            Выйти
          </button>
        </template>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

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
  }>(),
  {
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
const authStore = useAuthStore()

const isScrolled = ref(false)
const isMenuOpen = ref(false)

// ✅ Обработка ошибок загрузки изображений
const logoError = ref(false)
const avatarError = ref(false)

// Сбрасываем ошибку аватара при изменении URL аватара
// (например, когда пользователь загрузил новый аватар)
watch(
  () => authStore.userAvatar,
  () => {
    avatarError.value = false
  }
)

// Первая буква имени пользователя
const userInitial = computed(() => {
  const name = authStore.user?.name
  return name ? name.charAt(0).toUpperCase() : 'U'
})

// ==================== NAVIGATION ====================

const handleNavLinkClick = (path: string) => {
  if (route.path !== '/') {
    router.push('/').then(() => {
      setTimeout(() => {
        scrollToSection(path)
      }, 100)
    })
  } else {
    scrollToSection(path)
  }
}

const handleLogoClick = () => {
  if (route.path === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const isActiveLink = (path: string) => {
  return route.hash === path
}

const scrollToSection = (hash: string) => {
  if (!hash || hash === '#') return
  const element = document.querySelector(hash)
  if (element) {
    const offset = 80
    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    })
  }
}

const goToBookings = () => {
  emit('openProfile')
}



// ==================== AUTH ====================

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите выйти?',
      'Подтверждение выхода',
      {
        confirmButtonText: 'Выйти',
        cancelButtonText: 'Отмена',
        type: 'warning',
        confirmButtonClass: 'bg-red-500 hover:bg-red-600',
      }
    )
    
    await authStore.logout()
    ElMessage.success('Вы вышли из аккаунта')
    closeMenu()
    router.push('/login')
  } catch (error) {
    // Пользователь отменил
  }
}

// ==================== UI ====================

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

// ==================== LIFECYCLE ====================

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  
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

@keyframes pulse-slow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(168, 201, 107, 0.3);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 201, 107, 0.5);
}
</style>