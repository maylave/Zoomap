<template>
  <section id="form" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div
      class="mx-auto max-w-4xl rounded-[2rem] border border-accent/20 bg-accent/5 p-8 backdrop-blur-sm lg:p-12"
    >
      <div class="text-center">
        <span
          class="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
        >
          Оставайтесь на связи
        </span>

        <h2 class="mt-6 text-4xl font-bold text-cream-100 md:text-5xl">
          Получайте новости
          <span class="inline-flex items-center gap-3 text-accent">
            первыми
            <i class="fa-solid fa-paw text-2xl"></i>
          </span>
        </h2>

        <p class="mx-auto mt-4 max-w-2xl text-cream-100/60">
          Анонсы событий, рождение детёнышей, скидки на билеты и эксклюзивные акции.
          Только самое важное — без спама.
        </p>
      </div>

      <!-- ==================== СОСТОЯНИЕ 1: Успешная подписка (новый пользователь) ==================== -->
      <div
        v-if="isSuccess && isNewUser"
        class="mt-10 rounded-2xl border border-lime/30 bg-lime/10 p-8 text-center animate-fade-in"
      >
        <div class="flex justify-center mb-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-lime/20">
            <i class="fa-solid fa-check text-lime text-3xl"></i>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-cream-100 mb-2">Добро пожаловать!</h3>
        <p class="text-cream-100/70 mb-6">
          Вы успешно подписались и создали аккаунт
        </p>

        <!-- Карточка с учетными данными -->
        <div class="max-w-md mx-auto rounded-xl border border-white/20 bg-white/5 p-6 mb-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
              <i class="fa-solid fa-key text-amber-400"></i>
            </div>
            <div class="text-left">
              <p class="text-cream-100 font-medium text-sm">Ваши учетные данные</p>
              <p class="text-xs text-cream-100/50">Сохраните их для входа</p>
            </div>
          </div>

          <div class="space-y-3 text-left">
            <div>
              <p class="text-xs text-cream-100/50 mb-1">Email</p>
              <p class="text-sm text-cream-100 font-mono">{{ email }}</p>
            </div>
            <div>
              <p class="text-xs text-cream-100/50 mb-1">Пароль</p>
              <div class="flex items-center gap-2">
                <p class="text-sm text-cream-100 font-mono flex-1">
                  {{ showPassword ? password : '••••••••' }}
                </p>
                <button
                  @click="showPassword = !showPassword"
                  class="text-cream-100/60 hover:text-lime transition-colors"
                >
                  <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
                <button
                  @click="copyPassword"
                  class="text-cream-100/60 hover:text-lime transition-colors"
                  title="Копировать"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Промокод -->
        <div class="mb-6">
          <p class="text-sm text-cream-100/50 mb-2">Ваш промокод на скидку 10%:</p>
          <p class="text-lg font-mono font-bold text-lime">{{ promoCode }}</p>
        </div>

        <!-- Кнопки действий -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="loginNow"
            :disabled="isLoggingIn"
            class="btn btn-accent btn-lg rounded-full px-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              v-if="isLoggingIn"
              class="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <template v-else>
              <i class="fa-solid fa-right-to-bracket"></i>
              Войти сейчас
            </template>
          </button>
          <button
            @click="resetForm"
            class="rounded-full border border-white/20 px-6 py-3 text-sm text-cream-100/80 hover:bg-white/5 transition-all"
          >
            Подписать ещё один email
          </button>
        </div>

        <p class="text-xs text-cream-100/40 mt-4">
          Вы также можете войти позже, используя email и пароль
        </p>
      </div>

      <!-- ==================== СОСТОЯНИЕ 2: Успешная подписка (существующий пользователь) ==================== -->
      <div
        v-else-if="isSuccess"
        class="mt-10 rounded-2xl border border-lime/30 bg-lime/10 p-8 text-center animate-fade-in"
      >
        <div class="flex justify-center mb-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-lime/20">
            <i class="fa-solid fa-check text-lime text-3xl"></i>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-cream-100 mb-2">Спасибо за подписку!</h3>
        <p class="text-cream-100/70 mb-4">
          Мы отправили промокод на скидку 10% на ваш email.
        </p>
        <p class="text-sm text-cream-100/50 mb-6">
          Промокод: <span class="font-mono font-bold text-lime">{{ promoCode }}</span>
        </p>
        <button
          @click="resetForm"
          class="rounded-full border border-white/20 px-6 py-2 text-sm text-cream-100/80 hover:bg-white/5 transition-all"
        >
          Подписать ещё один email
        </button>
      </div>

      <!-- ==================== СОСТОЯНИЕ 3: Авторизован и уже подписан ==================== -->
      <div
        v-else-if="authStore.isAuthenticated && isSubscribed"
        class="mt-10 rounded-2xl border border-lime/30 bg-lime/10 p-8 text-center animate-fade-in"
      >
        <div class="flex justify-center mb-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-lime/20">
            <i class="fa-solid fa-bell text-lime text-3xl"></i>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-cream-100 mb-2">Вы уже подписаны!</h3>
        <p class="text-cream-100/70 mb-1">
          Новости приходят на <span class="text-lime font-medium">{{ authStore.user?.email }}</span>
        </p>
        <p class="text-sm text-cream-100/50 mb-6">
          Вы первыми узнаете о новых событиях и акциях
        </p>
        <button
          @click="unsubscribe"
          :disabled="isSubmitting"
          class="rounded-full border border-red-500/30 px-6 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
        >
          <span v-if="isSubmitting">Отписка...</span>
          <span v-else>Отписаться от новостей</span>
        </button>
      </div>

      <!-- ==================== СОСТОЯНИЕ 4: Авторизован, но не подписан ==================== -->
      <div
        v-else-if="authStore.isAuthenticated"
        class="mt-10 flex flex-col items-center gap-6"
      >
        <!-- Информация о пользователе -->
        <div class="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-amber-400 text-forest-900 font-bold">
            {{ userInitial }}
          </div>
          <div class="text-left">
            <p class="text-cream-100 font-medium">{{ authStore.user?.name }}</p>
            <p class="text-sm text-cream-100/50">{{ authStore.user?.email }}</p>
          </div>
        </div>

        <p class="text-center text-cream-100/70 max-w-md">
          Подпишитесь одним кликом, чтобы получать новости на ваш email
        </p>

        <!-- Общая ошибка -->
        <div
          v-if="generalError"
          class="rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta flex items-center gap-2"
        >
          <i class="fa-solid fa-triangle-exclamation"></i>
          {{ generalError }}
        </div>

        <!-- Кнопка подписки -->
        <button
          @click="subscribeAsUser"
          :disabled="isSubmitting"
          class="btn btn-accent btn-lg rounded-full px-10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <template v-else>
            <i class="fa-solid fa-bell"></i>
            {{ isSubmitting ? 'Подписка...' : 'Подписаться на новости' }}
          </template>
        </button>

        <p class="text-center text-xs text-cream-100/40">
          Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
        </p>
      </div>

      <!-- ==================== СОСТОЯНИЕ 5: Не авторизован - полная форма ==================== -->
      <form
        v-else
        class="mt-10 flex flex-col gap-5"
        @submit.prevent="handleSubmit"
      >
        <div class="grid gap-5 md:grid-cols-2">
          <!-- Имя -->
          <div class="relative">
            <label class="floating-label">
              <span :class="{ 'text-terracotta': errors.name }">Ваше имя</span>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Иван"
                class="input input-bordered w-full rounded-2xl transition-all"
                :class="{
                  'border-terracotta focus:border-terracotta': errors.name,
                  'border-white/20 focus:border-lime': !errors.name
                }"
                :disabled="isSubmitting"
                @input="clearError('name')"
              />
            </label>
            <p v-if="errors.name" class="mt-1 text-xs text-terracotta flex items-center gap-1">
              <i class="fa-solid fa-circle-exclamation"></i>
              {{ errors.name }}
            </p>
          </div>

          <!-- Email -->
          <div class="relative">
            <label class="floating-label">
              <span :class="{ 'text-terracotta': errors.email }">Email</span>
              <input
                v-model="formData.email"
                type="email"
                placeholder="mail@example.com"
                class="input input-bordered w-full rounded-2xl transition-all"
                :class="{
                  'border-terracotta focus:border-terracotta': errors.email,
                  'border-white/20 focus:border-lime': !errors.email
                }"
                :disabled="isSubmitting"
                @input="clearError('email')"
              />
            </label>
            <p v-if="errors.email" class="mt-1 text-xs text-terracotta flex items-center gap-1">
              <i class="fa-solid fa-circle-exclamation"></i>
              {{ errors.email }}
            </p>
          </div>
        </div>

        <!-- Чекбокс -->
        <label class="label cursor-pointer justify-start gap-3">
          <input
            v-model="formData.subscribe"
            type="checkbox"
            class="checkbox checkbox-accent"
            :disabled="isSubmitting"
          />
          <span class="text-sm text-cream-100/70">
            Хочу получать новости и специальные предложения
          </span>
        </label>

        <!-- Общая ошибка -->
        <div
          v-if="generalError"
          class="rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta flex items-center gap-2"
        >
          <i class="fa-solid fa-triangle-exclamation"></i>
          {{ generalError }}
        </div>

        <!-- Кнопка -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="btn btn-accent btn-lg rounded-full px-10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <template v-else>
            <i class="fa-solid fa-ticket mr-2"></i>
            {{ isSubmitting ? 'Отправка...' : 'Получить скидку 10%' }}
          </template>
        </button>

        <p class="text-center text-xs text-cream-100/40">
          Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
        </p>

        <!-- Подсказка о регистрации -->
        <div class="text-center text-sm text-cream-100/60 pt-2">
          Уже есть аккаунт? 
          <router-link to="/login" class="text-lime hover:text-lime/80 font-medium transition-colors">
            Войдите
          </router-link>
          , чтобы подписаться в один клик
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { subscriptionService } from '@/services/subscription.service'

const authStore = useAuthStore()

// ==================== STATE ====================

const formData = reactive({
  name: '',
  email: '',
  subscribe: true,
})

const errors = reactive({
  name: '',
  email: '',
})

const generalError = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)
const isNewUser = ref(false)
const promoCode = ref('')
const password = ref('')
const email = ref('')
const authToken = ref('') // ✅ Сохраняем токен из ответа
const showPassword = ref(false)
const isLoggingIn = ref(false)
const isSubscribed = ref(false)
const isCheckingSubscription = ref(false)

// Первая буква имени
const userInitial = computed(() => {
  const name = authStore.user?.name
  return name ? name.charAt(0).toUpperCase() : 'U'
})

// ==================== LIFECYCLE ====================

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await checkSubscriptionStatus()
  }
})

// ==================== ПРОВЕРКА СТАТУСА ПОДПИСКИ ====================

const checkSubscriptionStatus = async () => {
  if (!authStore.user?.email) return
  
  isCheckingSubscription.value = true
  try {
    const status = await subscriptionService.checkStatus(authStore.user.email)
    isSubscribed.value = status.isSubscribed
  } catch (error) {
    console.error('Error checking subscription:', error)
    isSubscribed.value = false
  } finally {
    isCheckingSubscription.value = false
  }
}

// ==================== ВАЛИДАЦИЯ ====================

const validateName = (name: string): string => {
  if (!name.trim()) return 'Введите ваше имя'
  if (name.trim().length < 2) return 'Имя должно содержать минимум 2 символа'
  if (name.trim().length > 50) return 'Имя слишком длинное'
  return ''
}

const validateEmail = (email: string): string => {
  if (!email.trim()) return 'Введите email'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Неверный формат email'
  return ''
}

const validateForm = (): boolean => {
  errors.name = validateName(formData.name)
  errors.email = validateEmail(formData.email)
  return !errors.name && !errors.email
}

const clearError = (field: 'name' | 'email') => {
  if (errors[field]) errors[field] = ''
  if (generalError.value) generalError.value = ''
}

// ==================== ПОДПИСКА ДЛЯ АВТОРИЗОВАННОГО ====================

const subscribeAsUser = async () => {
  if (!authStore.user?.email || !authStore.user?.name) {
    ElMessage.error('Не удалось получить данные профиля')
    return
  }

  isSubmitting.value = true
  generalError.value = ''

  try {
    const response = await subscriptionService.subscribe({
      name: authStore.user.name,
      email: authStore.user.email,
      subscribe: true,
    })

    isSubscribed.value = true
    promoCode.value = response.promoCode || 'ZOO10'
    ElMessage.success('Вы подписались на новости!')
  } catch (error: any) {
    console.error('Subscription error:', error)
    generalError.value = error.response?.data?.error || 'Ошибка подписки'
    ElMessage.error(generalError.value)
  } finally {
    isSubmitting.value = false
  }
}

// ==================== ОТПИСКА ====================

const unsubscribe = async () => {
  if (!authStore.user?.email) return

  isSubmitting.value = true
  try {
    await subscriptionService.unsubscribe(authStore.user.email)
    isSubscribed.value = false
    ElMessage.success('Вы отписались от новостей')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Ошибка отписки')
  } finally {
    isSubmitting.value = false
  }
}

// ==================== ПОДПИСКА ДЛЯ ГОСТЯ ====================

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  generalError.value = ''

  try {
    // ✅ Создаем явные строковые переменные
    const nameValue: string = formData.name.trim()
    const emailValue: string = formData.email.trim()

    const response = await subscriptionService.subscribe({
      name: nameValue,
      email: emailValue,
      subscribe: formData.subscribe,
    })

    isSuccess.value = true
    promoCode.value = response.promoCode || 'ZOO10'
    email.value = response.email || emailValue
    
    // Если есть токен и пароль - это новый пользователь
    if (response.token && response.password) {
      isNewUser.value = true
      password.value = response.password
      authToken.value = response.token // ✅ Сохраняем токен
      ElMessage.success('Вы успешно подписались и создали аккаунт!')
    } else {
      isNewUser.value = false
      ElMessage.success('Вы успешно подписались на новости!')
    }
  } catch (error: any) {
    console.error('Subscription error:', error)
    
    if (error.response?.status === 409) {
      generalError.value = 'Этот email уже подписан на новости'
    } else if (error.response?.status === 400) {
      generalError.value = error.response?.data?.error || 'Неверные данные'
    } else {
      generalError.value = 'Ошибка отправки. Попробуйте позже.'
    }
    
    ElMessage.error(generalError.value)
  } finally {
    isSubmitting.value = false
  }
}

// ==================== АВТОМАТИЧЕСКИЙ ВХОД ====================

const loginNow = async () => {
  if (!authToken.value) {
    ElMessage.error('Токен не найден')
    return
  }

  isLoggingIn.value = true
  try {
    // ✅ Используем сохраненный токен вместо повторного запроса
    localStorage.setItem('token', authToken.value)
    authStore.token = authToken.value
    
    // Загружаем профиль
    await authStore.fetchProfile()
    
    ElMessage.success('Вы вошли в аккаунт!')
    
    // Перенаправляем на главную или в профиль
    
  } catch (error: any) {
    console.error('Login error:', error)
    ElMessage.error('Не удалось войти. Попробуйте использовать email и пароль.')
  } finally {
    isLoggingIn.value = false
  }
}

// ==================== КОПИРОВАНИЕ ПАРОЛЯ ====================

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(password.value)
    ElMessage.success('Пароль скопирован')
  } catch (error) {
    ElMessage.error('Не удалось скопировать')
  }
}

// ==================== СБРОС ====================

const resetForm = () => {
  formData.name = ''
  formData.email = ''
  formData.subscribe = true
  errors.name = ''
  errors.email = ''
  generalError.value = ''
  isSuccess.value = false
  isNewUser.value = false
  promoCode.value = ''
  password.value = ''
  email.value = ''
  authToken.value = '' // ✅ Очищаем токен
  showPassword.value = false
}

defineExpose({
  resetForm,
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.floating-label {
  position: relative;
  display: block;
}
.floating-label span {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0 0.25rem;
  color: rgba(245, 230, 211, 0.6);
  font-size: 0.875rem;
  pointer-events: none;
  transition: all 0.2s ease;
}
.floating-label input:focus + span,
.floating-label input:not(:placeholder-shown) + span {
  top: 0;
  font-size: 0.75rem;
  color: #a8c96b;
  background: #1e361c;
}

.input {
  background: rgba(255, 255, 255, 0.05);
  color: #f5e6d3;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.875rem 1rem;
  transition: all 0.2s;
}
.input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(168, 201, 107, 0.2);
}
.input::placeholder {
  color: rgba(245, 230, 211, 0.3);
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}
.checkbox:checked {
  background: #a8c96b;
  border-color: #a8c96b;
}

.btn-accent {
  background: #a8c96b;
  color: #1a2e1a;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-accent:hover:not(:disabled) {
  background: #96b85a;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(168, 201, 107, 0.3);
}
</style>