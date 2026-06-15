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
        
        <!-- Вращающийся градиент рамки карточки -->
        <div 
          class="absolute top-1/2 left-1/2 w-[220%] h-[200%] -translate-x-1/2 -translate-y-1/2"
          :style="{ background: borderGradient }"
          :class="hasError ? 'animate-rotate-border-fast' : 'animate-rotate-border'"
        ></div>
        
        <!-- Размытый слой для эффекта свечения -->
        <div 
          class="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 blur-xl"
          :style="{ background: borderGradient }"
          :class="[
            hasError ? 'animate-rotate-border-fast animate-pulse-glow opacity-100' : 'animate-rotate-border opacity-60'
          ]"
        ></div>

        <!-- ВНУТРЕННЯЯ КАРТОЧКА (с анимацией тряски при ошибке) -->
        <form 
          @submit.prevent="handleLogin"
          class="relative z-10 w-full bg-forest-400/90 backdrop-blur-xl rounded-3xl p-8 flex flex-col gap-6 shadow-2xl transition-transform"
          :class="{ 'animate-shake': isShaking }"
        >
          <div class="text-center mb-2">
            <h2 class="text-3xl font-bold text-cream-100 tracking-tight">Вход</h2>
            <p class="text-white/50 text-sm mt-2">Введите свои данные</p>
          </div>

          <!-- ПОЛЕ ЛОГИН -->
          <div class="flex flex-col gap-2">
            <label for="login" class="ml-1 text-sm font-medium text-cream-100/90">
              Логин
            </label>
            <div class="relative group">
              <!-- Обычное зеленое свечение (скрыто при ошибке) -->
              <div 
                class="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-sage via-lime to-sage opacity-0 group-focus-within:opacity-100 transition-all duration-smooth ease-smooth blur-[1px]"
                :class="{ 'hidden': loginError }"
              ></div>
              
              <!-- Красное свечение ошибки (появляется при ошибке) -->
              <div 
                class="absolute -inset-[1px] rounded-2xl bg-terracotta opacity-0 transition-all duration-smooth ease-smooth blur-[2px]"
                :class="{ 'opacity-100': loginError }"
              ></div>

              <input 
                id="login"
                v-model="login"
                @input="loginError = false"
                type="text" 
                placeholder="Введите логин" 
                class="relative z-10 w-full bg-forest-300/50 border rounded-2xl py-3.5 pl-4 pr-12 
                       text-cream-100 placeholder:text-white/40 
                       outline-none transition-all duration-smooth ease-smooth
                       focus:bg-forest-300/80"
                :class="loginError 
                  ? 'border-terracotta focus:border-terracotta focus:ring-2 focus:ring-terracotta/30' 
                  : 'border-white/10 focus:border-transparent'"
              />
              <!-- Иконка пользователя -->
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
              <!-- Обычное зеленое свечение (скрыто при ошибке) -->
              <div 
                class="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-sage via-lime to-sage opacity-0 transition-all duration-smooth ease-smooth blur-[1px]"
                :class="{ 'hidden': passwordError, 'group-focus-within:opacity-100': password.length > 0 || isPasswordFocused }"
              ></div>
              
              <!-- Красное свечение ошибки (появляется при ошибке) -->
              <div 
                class="absolute -inset-[1px] rounded-2xl bg-terracotta opacity-0 transition-all duration-smooth ease-smooth blur-[2px]"
                :class="{ 'opacity-100': passwordError }"
              ></div>

              <input 
                id="password"
                v-model="password"
                @input="passwordError = false"
                @focus="isPasswordFocused = true"
                @blur="isPasswordFocused = false"
                type="password" 
                placeholder="Введите пароль" 
                class="relative z-10 w-full bg-forest-300/50 border rounded-2xl py-3.5 pl-4 pr-12 
                       text-cream-100 placeholder:text-white/40 
                       outline-none transition-all duration-smooth ease-smooth
                       focus:bg-forest-300/80"
                :class="passwordError 
                  ? 'border-terracotta focus:border-terracotta focus:ring-2 focus:ring-terracotta/30' 
                  : 'border-white/10 focus:border-transparent'"
              />
              <!-- Иконка замка -->
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-smooth pointer-events-none" 
                   :class="passwordError ? 'text-terracotta' : (password.length > 0 || isPasswordFocused ? 'text-lime' : 'text-white/30')" 
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <!-- Кнопка отправки -->
          <button 
            type="submit"
            class="mt-2 w-full bg-sage text-cream-100 font-semibold py-3.5 rounded-2xl 
                   shadow-lg shadow-forest-400/50
                   hover:bg-sage/90 hover:shadow-xl hover:-translate-y-0.5 
                   active:translate-y-0 active:scale-[0.98]
                   transition-all duration-smooth ease-smooth"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const login = ref('');
const password = ref('');
const isPasswordFocused = ref(false);

// Состояния ошибок
const loginError = ref(false);
const passwordError = ref(false);
const isShaking = ref(false);

// Вычисляем, есть ли ошибка в целом
const hasError = computed(() => loginError.value || passwordError.value);

// Динамический градиент для внешней рамки
const borderGradient = computed(() => {
  if (hasError.value) {
    // Цвета ошибки: terracotta (#c4602a) и amber (#e8933a) из вашей темы
    return 'conic-gradient(from 0deg, transparent 0%, transparent 35%, #cc282a 50%, transparent 65%, transparent 85%, #e8553a 100%)';
  }
  // Нормальные цвета: sage (#5c7a3e) и lime (#a8c96b)
  return 'conic-gradient(from 0deg, transparent 0%, transparent 35%, #5c7a3e 50%, transparent 65%, transparent 85%, #a8c96b 100%)';
});

const bars = [
  { height: '200px', left: '15%', top: '10%', duration: '12s', delay: '0s' },
  { height: '250px', left: '55%', top: '40%', duration: '15s', delay: '2s' },
  { height: '180px', left: '85%', top: '60%', duration: '10s', delay: '4s' },
  { height: '150px', left: '35%', top: '75%', duration: '14s', delay: '1s' },
]

const handleLogin = () => {
  // Сбрасываем предыдущие ошибки
  loginError.value = !login.value.trim();
  passwordError.value = !password.value.trim();

  // Если есть ошибки, запускаем анимацию тряски
  if (hasError.value) {
    isShaking.value = true;
    setTimeout(() => {
      isShaking.value = false;
    }, 400);
    return;
  }

  // Успешная валидация
  console.log('Форма успешно отправлена!', { login: login.value });
}
</script>

<style>
/* Обычное вращение рамки */
@keyframes rotate-border {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Ускоренное вращение при ошибке */
@keyframes rotate-border-fast {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Пульсация свечения при ошибке */
@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; filter: blur(20px); }
  50% { opacity: 1; filter: blur(30px); }
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-150px) rotate(5deg); opacity: 0.7; }
  100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
}

/* Анимация тряски при ошибке */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

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
</style>