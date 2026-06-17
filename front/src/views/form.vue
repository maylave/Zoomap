<template>
  <div class="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-forest-300 via-forest-400 to-forest-300">
    
    <!-- Фоновые анимированные полоски -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="(bar, index) in bars"
        :key="index"
        class="absolute bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        :style="{
          width: '30px',
          height: bar.height,
          left: bar.left,
          top: bar.top,
          borderRadius: '15px',
          filter: 'blur(3px)',
          animation: `float ${bar.duration} ease-in-out infinite ${bar.delay}`,
        }"
      ></div>
    </div>

    <!-- Контейнер центрирования -->
    <div class="flex flex-1 justify-center items-center p-4 z-10">
      
      <!-- ОБЕРТКА ДЛЯ СВЕЧЕНИЯ КАРТОЧКИ -->
      <div class="relative w-full max-w-md p-[2px] rounded-3xl overflow-hidden">
        
        <!-- Вращающийся градиент рамки -->
        <div 
          class="absolute top-1/2 left-1/2 w-[220%] h-[200%] -translate-x-1/2 -translate-y-1/2"
          :style="{ background: borderGradient }"
          :class="hasError ? 'animate-rotate-border-fast' : 'animate-rotate-border'"
        ></div>
        
        <!-- Размытый слой для свечения -->
        <div 
          class="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 blur-xl"
          :style="{ background: borderGradient }"
          :class="[
            hasError ? 'animate-rotate-border-fast animate-pulse-glow opacity-100' : 'animate-rotate-border opacity-60'
          ]"
        ></div>

        <!-- 3D КОНТЕЙНЕР ДЛЯ ПЕРЕВОРОТА -->
        <div class="relative z-10 w-full" style="perspective: 1000px;">
          <div 
            class="relative w-full transition-transform duration-700 ease-in-out"
            :class="{ 'rotate-y-180': isFlipped }"
            style="transform-style: preserve-3d;"
          >
            
            <!-- ==================== ЛИЦЕВАЯ СТОРОНА (ВХОД) ==================== -->
            <form 
              @submit.prevent="handleLogin"
              class="w-full bg-forest-400/90 backdrop-blur-xl rounded-3xl p-8 flex flex-col gap-6 shadow-2xl transition-transform max-h-[85vh] overflow-y-auto scrollbar-custom"
              :class="{ 'animate-shake': isShaking }"
              style="backface-visibility: hidden;"
            >
              <div class="text-center mb-2 flex-shrink-0">
                <h2 class="text-3xl font-bold text-cream-100 tracking-tight">Вход</h2>
                <p class="text-white/50 text-sm mt-2">Введите свои данные</p>
              </div>

              <!-- Сообщение об ошибке -->
              <div 
                v-if="serverError" 
                class="bg-terracotta/20 border border-terracotta/50 rounded-2xl px-4 py-3 text-terracotta text-sm flex items-center gap-2 animate-shake flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ serverError }}</span>
              </div>

              <!-- ПОЛЕ ЛОГИН -->
              <div class="flex flex-col gap-2">
                <label for="login" class="ml-1 text-sm font-medium text-cream-100/90">
                  Логин или Email
                </label>
                <div class="relative group">
                  <div 
                    class="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-sage via-lime to-sage opacity-0 group-focus-within:opacity-100 transition-all duration-smooth ease-smooth blur-[1px]"
                    :class="{ 'hidden': loginError }"
                  ></div>
                  
                  <div 
                    class="absolute -inset-[1px] rounded-2xl bg-terracotta opacity-0 transition-all duration-smooth ease-smooth blur-[2px]"
                    :class="{ 'opacity-100': loginError }"
                  ></div>

                  <input 
                    id="login"
                    v-model="identifier"
                    @input="loginError = false; serverError = ''"
                    type="text" 
                    placeholder="Введите логин или email" 
                    autocomplete="username"
                    class="relative z-10 w-full bg-forest-300/50 border rounded-2xl py-3.5 pl-4 pr-12 
                           text-cream-100 placeholder:text-white/40 
                           outline-none transition-all duration-smooth ease-smooth
                           focus:bg-forest-300/80"
                    :class="loginError 
                      ? 'border-terracotta focus:border-terracotta focus:ring-2 focus:ring-terracotta/30' 
                      : 'border-white/10 focus:border-transparent'"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-smooth pointer-events-none" 
                       :class="loginError ? 'text-terracotta' : 'text-white/30 group-focus-within:text-lime'" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <!-- ПОЛЕ ПАРОЛЬ -->
              <div class="flex flex-col gap-2">
                <label for="password" class="ml-1 text-sm font-medium text-cream-100/90">
                  Пароль
                </label>
                <div class="relative group">
                  <div 
                    class="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-sage via-lime to-sage opacity-0 transition-all duration-smooth ease-smooth blur-[1px]"
                    :class="{ 'hidden': passwordError, 'group-focus-within:opacity-100': password.length > 0 || isPasswordFocused }"
                  ></div>
                  
                  <div 
                    class="absolute -inset-[1px] rounded-2xl bg-terracotta opacity-0 transition-all duration-smooth ease-smooth blur-[2px]"
                    :class="{ 'opacity-100': passwordError }"
                  ></div>

                  <input 
                    id="password"
                    v-model="password"
                    @input="passwordError = false; serverError = ''"
                    @focus="isPasswordFocused = true"
                    @blur="isPasswordFocused = false"
                    type="password" 
                    placeholder="Введите пароль" 
                    autocomplete="current-password"
                    class="relative z-10 w-full bg-forest-300/50 border rounded-2xl py-3.5 pl-4 pr-12 
                           text-cream-100 placeholder:text-white/40 
                           outline-none transition-all duration-smooth ease-smooth
                           focus:bg-forest-300/80"
                    :class="passwordError 
                      ? 'border-terracotta focus:border-terracotta focus:ring-2 focus:ring-terracotta/30' 
                      : 'border-white/10 focus:border-transparent'"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-smooth pointer-events-none" 
                       :class="passwordError ? 'text-terracotta' : (password.length > 0 || isPasswordFocused ? 'text-lime' : 'text-white/30')" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <!-- Кнопка входа -->
              <button 
                type="submit"
                :disabled="isLoading"
                class="mt-2 w-full bg-sage text-cream-100 font-semibold py-3.5 rounded-2xl 
                       shadow-lg shadow-forest-400/50
                       hover:bg-sage/90 hover:shadow-xl hover:-translate-y-0.5 
                       active:translate-y-0 active:scale-[0.98]
                       transition-all duration-smooth ease-smooth
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex-shrink-0"
              >
                <span v-if="isLoading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Вход...
                </span>
                <span v-else>Войти</span>
              </button>

              <!-- Ссылка на регистрацию -->
              <p class="text-center text-white/50 text-sm flex-shrink-0">
                Нет аккаунта? 
                <button 
                  type="button"
                  @click="flipToRegister"
                  class="text-lime hover:text-lime/80 font-medium transition-colors"
                >
                  Зарегистрироваться
                </button>
              </p>
            </form>

            <!-- ==================== ОБРАТНАЯ СТОРОНА (РЕГИСТРАЦИЯ) ==================== -->
            <form 
              @submit.prevent="handleRegister"
              class="absolute top-0 left-0 w-full bg-forest-400/90 backdrop-blur-xl rounded-3xl p-8 flex flex-col gap-6 shadow-2xl transition-transform max-h-[85vh] overflow-y-auto scrollbar-custom"
              :class="{ 'animate-shake': isShaking }"
              style="backface-visibility: hidden; transform: rotateY(180deg);"
            >
              <div class="text-center mb-2 flex-shrink-0">
                <h2 class="text-3xl font-bold text-cream-100 tracking-tight">Регистрация</h2>
                <p class="text-white/50 text-sm mt-2">Создайте аккаунт</p>
              </div>

              <!-- Сообщение об ошибке -->
              <div 
                v-if="registerError" 
                class="bg-terracotta/20 border border-terracotta/50 rounded-2xl px-4 py-3 text-terracotta text-sm flex items-center gap-2 animate-shake flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ registerError }}</span>
              </div>

              <!-- Успешная регистрация с паролем -->
              <div 
                v-if="generatedPassword" 
                class="bg-lime/20 border border-lime/50 rounded-2xl px-4 py-4 text-cream-100 flex-shrink-0"
              >
                <div class="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-semibold">Регистрация успешна!</span>
                </div>
                <p class="text-sm text-white/70 mb-2">Ваш сгенерированный пароль:</p>
                <div class="flex items-center gap-2 bg-forest-300/50 rounded-xl px-3 py-2">
                  <code class="flex-1 text-lime font-mono text-sm">{{ generatedPassword }}</code>
                  <button 
                    type="button"
                    @click="copyPassword"
                    class="text-white/50 hover:text-lime transition-colors"
                    title="Скопировать"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <p class="text-xs text-white/50 mt-2">⚠️ Сохраните пароль! Он показан только один раз.</p>
              </div>

              <!-- ПОЛЕ ИМЯ (скрыто после регистрации) -->
              <div v-if="!generatedPassword" class="flex flex-col gap-2">
                <label for="name" class="ml-1 text-sm font-medium text-cream-100/90">
                  Имя
                </label>
                <div class="relative group">
                  <div 
                    class="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-sage via-lime to-sage opacity-0 group-focus-within:opacity-100 transition-all duration-smooth ease-smooth blur-[1px]"
                    :class="{ 'hidden': nameError }"
                  ></div>
                  
                  <div 
                    class="absolute -inset-[1px] rounded-2xl bg-terracotta opacity-0 transition-all duration-smooth ease-smooth blur-[2px]"
                    :class="{ 'opacity-100': nameError }"
                  ></div>

                  <input 
                    id="name"
                    v-model="name"
                    @input="nameError = false; registerError = ''"
                    type="text" 
                    placeholder="Введите ваше имя" 
                    autocomplete="name"
                    class="relative z-10 w-full bg-forest-300/50 border rounded-2xl py-3.5 pl-4 pr-12 
                           text-cream-100 placeholder:text-white/40 
                           outline-none transition-all duration-smooth ease-smooth
                           focus:bg-forest-300/80"
                    :class="nameError 
                      ? 'border-terracotta focus:border-terracotta focus:ring-2 focus:ring-terracotta/30' 
                      : 'border-white/10 focus:border-transparent'"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-smooth pointer-events-none" 
                       :class="nameError ? 'text-terracotta' : 'text-white/30 group-focus-within:text-lime'" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <!-- ПОЛЕ EMAIL (скрыто после регистрации) -->
              <div v-if="!generatedPassword" class="flex flex-col gap-2">
                <label for="email" class="ml-1 text-sm font-medium text-cream-100/90">
                  Email
                </label>
                <div class="relative group">
                  <div 
                    class="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-sage via-lime to-sage opacity-0 group-focus-within:opacity-100 transition-all duration-smooth ease-smooth blur-[1px]"
                    :class="{ 'hidden': emailError }"
                  ></div>
                  
                  <div 
                    class="absolute -inset-[1px] rounded-2xl bg-terracotta opacity-0 transition-all duration-smooth ease-smooth blur-[2px]"
                    :class="{ 'opacity-100': emailError }"
                  ></div>

                  <input 
                    id="email"
                    v-model="email"
                    @input="emailError = false; registerError = ''"
                    type="email" 
                    placeholder="Введите email" 
                    autocomplete="email"
                    class="relative z-10 w-full bg-forest-300/50 border rounded-2xl py-3.5 pl-4 pr-12 
                           text-cream-100 placeholder:text-white/40 
                           outline-none transition-all duration-smooth ease-smooth
                           focus:bg-forest-300/80"
                    :class="emailError 
                      ? 'border-terracotta focus:border-terracotta focus:ring-2 focus:ring-terracotta/30' 
                      : 'border-white/10 focus:border-transparent'"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-smooth pointer-events-none" 
                       :class="emailError ? 'text-terracotta' : 'text-white/30 group-focus-within:text-lime'" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <!-- Кнопка регистрации -->
              <button 
                v-if="!generatedPassword"
                type="submit"
                :disabled="isRegistering"
                class="mt-2 w-full bg-sage text-cream-100 font-semibold py-3.5 rounded-2xl 
                       shadow-lg shadow-forest-400/50
                       hover:bg-sage/90 hover:shadow-xl hover:-translate-y-0.5 
                       active:translate-y-0 active:scale-[0.98]
                       transition-all duration-smooth ease-smooth
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex-shrink-0"
              >
                <span v-if="isRegistering" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Регистрация...
                </span>
                <span v-else>Зарегистрироваться</span>
              </button>

              <!-- Кнопка ПРОДОЛЖИТЬ после регистрации -->
              <button 
                v-else
                type="button"
                @click="continueAfterRegister"
                class="mt-2 w-full bg-lime text-forest-400 font-semibold py-3.5 rounded-2xl 
                       shadow-lg shadow-forest-400/50
                       hover:bg-lime/90 hover:shadow-xl hover:-translate-y-0.5 
                       active:translate-y-0 active:scale-[0.98]
                       transition-all duration-smooth ease-smooth flex-shrink-0"
              >
                Продолжить
              </button>

              <!-- Ссылка на вход -->
              <p class="text-center text-white/50 text-sm flex-shrink-0">
                Уже есть аккаунт? 
                <button 
                  type="button"
                  @click="flipToLogin"
                  class="text-lime hover:text-lime/80 font-medium transition-colors"
                >
                  Войти
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authService } from '@/services'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ==================== ВХОД ====================
const identifier = ref('')
const password = ref('')
const isPasswordFocused = ref(false)
const loginError = ref(false)
const passwordError = ref(false)
const serverError = ref('')
const isLoading = ref(false)

// ==================== РЕГИСТРАЦИЯ ====================
const name = ref('')
const email = ref('')
const nameError = ref(false)
const emailError = ref(false)
const registerError = ref('')
const isRegistering = ref(false)
const generatedPassword = ref('')

// ==================== ОБЩЕЕ ====================
const isShaking = ref(false)
const isFlipped = ref(false)

const hasError = computed(() => {
  if (isFlipped.value) {
    return nameError.value || emailError.value
  }
  return loginError.value || passwordError.value
})

const borderGradient = computed(() => {
  if (hasError.value) {
    return 'conic-gradient(from 0deg, transparent 0%, transparent 35%, #cc282a 50%, transparent 65%, transparent 85%, #e8553a 100%)'
  }
  return 'conic-gradient(from 0deg, transparent 0%, transparent 35%, #5c7a3e 50%, transparent 65%, transparent 85%, #a8c96b 100%)'
})

const bars = [
  { height: '200px', left: '15%', top: '10%', duration: '12s', delay: '0s' },
  { height: '250px', left: '55%', top: '40%', duration: '15s', delay: '2s' },
  { height: '180px', left: '85%', top: '60%', duration: '10s', delay: '4s' },
  { height: '150px', left: '35%', top: '75%', duration: '14s', delay: '1s' },
]

// ==================== ФУНКЦИИ ====================

const flipToRegister = () => {
  isFlipped.value = true
  loginError.value = false
  passwordError.value = false
  serverError.value = ''
}

const flipToLogin = () => {
  isFlipped.value = false
  generatedPassword.value = ''
  nameError.value = false
  emailError.value = false
  registerError.value = ''
}

const continueAfterRegister = () => {
  // Переход на главную или в профиль
  ElMessage.success('Добро пожаловать в ZooVerse!')
  router.push('/')
}

const handleLogin = async () => {
  serverError.value = ''
  loginError.value = !identifier.value.trim()
  passwordError.value = !password.value.trim()

  if (hasError.value) {
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 400)
    return
  }

  isLoading.value = true
  
  try {
    const response = await authService.login({
      identifier: identifier.value.trim(),
      password: password.value,
    })
    
    authStore.user = response.user
    authStore.token = response.token
    localStorage.setItem('token', response.token)
    
    ElMessage.success('Добро пожаловать!')
    
    if (response.user.role === 'admin' || response.user.role === 'dev') {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Ошибка входа'
    serverError.value = errorMessage
    loginError.value = true
    passwordError.value = true
    
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 400)
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  registerError.value = ''
  nameError.value = !name.value.trim()
  emailError.value = !email.value.trim() || !email.value.includes('@')

  if (hasError.value) {
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 400)
    return
  }

  isRegistering.value = true
  
  try {
    const response = await authService.register({
      name: name.value.trim(),
      email: email.value.trim(),
    })
    
    generatedPassword.value = response.password || ''
    
    authStore.user = response.user
    authStore.token = response.token
    localStorage.setItem('token', response.token)
    
    ElMessage.success('Регистрация успешна!')
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Ошибка регистрации'
    registerError.value = errorMessage
    nameError.value = true
    emailError.value = true
    
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 400)
  } finally {
    isRegistering.value = false
  }
}

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
    ElMessage.success('Пароль скопирован!')
  } catch (error) {
    ElMessage.error('Не удалось скопировать')
  }
}
</script>

<style scoped>


.animate-rotate-border {
  animation: rotate-border 4s linear infinite;
}

.animate-rotate-border-fast {
  animation: rotate-border-fast 2s linear infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 0.8s ease-in-out infinite;
}

.animate-shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

/* Кастомный скроллбар */
.scrollbar-custom::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: rgba(30, 54, 28, 0.3);
  border-radius: 10px;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(92, 122, 62, 0.6);
  border-radius: 10px;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 201, 107, 0.8);
}

/* Для Firefox */
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: rgba(92, 122, 62, 0.6) rgba(30, 54, 28, 0.3);
}
</style>

<style>
@keyframes rotate-border {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes rotate-border-fast {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; filter: blur(20px); }
  50% { opacity: 1; filter: blur(30px); }
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-150px) rotate(5deg); opacity: 0.7; }
  100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
/* Глобальные стили для Element Plus */
.el-message {
  position: fixed !important;
  top: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: auto !important;
  max-width: 500px !important;
  z-index: 9999 !important;
}
</style>