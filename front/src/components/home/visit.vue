<template>
  <section id="visit" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div class="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
      <!-- Блок предупреждения (только для админа, скрывается в режиме удаления) -->
      <div
        v-if="isAdmin && !isDeleteMode"
        class="group/warning mb-10 flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-4 backdrop-blur-sm transition-all hover:border-warning/50 hover:bg-warning/15 lg:col-span-2"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20">
            <i class="fa-solid fa-triangle-exclamation text-warning"></i>
          </div>
          <div>
            <p class="text-cream-100 text-sm font-medium">
              Управление секцией "Время и цены"
            </p>
            <p class="text-cream-100/60 text-xs mt-0.5">
              Редактируйте время работы или цены на билеты
            </p>
          </div>
        </div>

        <button
          class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-2 rounded-lg hover:bg-white/5"
          title="Редактировать секцию"
        >
          <i class="fa-solid fa-pen text-sm"></i>
        </button>
      </div>

      <!-- Панель удаления (когда выбраны билеты) -->
      <div
        v-if="isDeleteMode && selectedTickets.length > 0"
        class="mb-10 flex items-center justify-between rounded-2xl border border-terracotta/30 bg-terracotta/10 p-4 backdrop-blur-sm animate-fade-in lg:col-span-2"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/20">
            <i class="fa-solid fa-trash text-terracotta"></i>
          </div>
          <div>
            <p class="text-cream-100 text-sm font-medium">
              Выбрано билетов: {{ selectedTickets.length }}
            </p>
            <p class="text-cream-100/60 text-xs mt-0.5">
              Нажмите "Удалить" для подтверждения
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="px-4 py-2 rounded-xl border border-white/10 text-cream-100/60 hover:text-cream-100 hover:bg-white/5 transition-all duration-smooth"
            @click="cancelDeleteMode"
          >
            Отмена
          </button>
          <button
            class="px-6 py-2 rounded-xl bg-terracotta text-cream-100 font-medium hover:bg-terracotta/90 hover:shadow-lg hover:shadow-terracotta/30 transition-all duration-smooth"
            @click="confirmDelete"
          >
            Удалить
          </button>
        </div>
      </div>

      <!-- Левая колонка -->
      <div>
        <span class="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          Планируйте визит
        </span>

        <h2 class="mt-6 text-4xl font-bold text-cream-100 md:text-5xl">
          Время и цены
        </h2>

        <p class="mt-6 max-w-xl leading-8 text-cream-100/60">
          ZooVerse работает 365 дней в году. Мы верим, что общение с природой должно быть доступным для каждого.
        </p>

        <!-- Кнопка открывает общую модалку (без предвыбора) -->
        <button
          v-if="!isDeleteMode"
          @click="openGeneralModal"
          class="btn btn-accent mt-8 rounded-full px-8 cursor-pointer"
        >
          Купить билет онлайн →
        </button>

        <!-- Время работы -->
        <div class="mt-10 grid gap-4 sm:grid-cols-2">
          <div
            v-for="(item, index) in hours"
            :key="item.day"
            class="group/hour relative rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            :class="{ 'ring-2 ring-terracotta ring-offset-2 ring-offset-forest-400': selectedHours.includes(index) }"
          >
            <!-- Чекбокс для удаления (только в режиме удаления) -->
            <div
              v-if="isDeleteMode"
              class="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg border-2 bg-black/40 backdrop-blur-md transition-all duration-200"
              :class="selectedHours.includes(index) 
                ? 'border-terracotta bg-terracotta/30' 
                : 'border-white/50 hover:border-white hover:bg-black/60'"
              @click.stop="toggleHourSelection(index)"
            >
              <i
                v-if="selectedHours.includes(index)"
                class="fa-solid fa-check text-white text-xs"
              ></i>
            </div>

            <p class="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
              {{ item.day }}
            </p>
            <p class="text-2xl font-bold text-cream-100" :class="{ 'pr-10': isDeleteMode }">
              {{ item.time }}
            </p>
          </div>

          <!-- Добавить время работы (только для админа и не в режиме удаления) -->
          <div
            v-if="isAdmin && !isDeleteMode"
            class="group/add flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-accent/5"
          >
            <i class="fa-solid fa-plus text-2xl text-cream-100/40 transition-colors duration-300 group-hover/add:text-accent"></i>
            <p class="text-cream-100/60 text-xs">Добавить</p>
          </div>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="rounded-[2rem] border border-accent/20 bg-accent/10 p-8 backdrop-blur-sm lg:p-10">
        <h3 class="mb-8 text-2xl font-bold text-cream-100">
          Стоимость билетов
        </h3>

        <div
          v-for="(ticket, index) in tickets"
          :key="ticket.name"
          class="relative flex items-center justify-between border-b border-white/10 py-4 last:border-0 transition-colors group"
          :class="[
            isDeleteMode ? 'cursor-pointer' : 'cursor-pointer hover:bg-white/5 px-2 -mx-2 rounded-lg',
            { 'ring-2 ring-terracotta ring-offset-2 ring-offset-accent/10 rounded-lg px-2 -mx-2': selectedTickets.includes(index) }
          ]"
          @click="isDeleteMode ? toggleTicketSelection(index) : openModal(ticket)"
        >
          <!-- Чекбокс для удаления (только в режиме удаления) -->
          <div
            v-if="isDeleteMode"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 flex h-8 w-8 items-center justify-center rounded-lg border-2 bg-black/40 backdrop-blur-md transition-all duration-200"
            :class="selectedTickets.includes(index) 
              ? 'border-terracotta bg-terracotta/30 scale-110' 
              : 'border-white/50 hover:border-white hover:bg-black/60'"
          >
            <i
              v-if="selectedTickets.includes(index)"
              class="fa-solid fa-check text-white text-xs"
            ></i>
          </div>

          <div :class="{ 'pl-4': isDeleteMode }">
            <p class="font-medium text-cream-100/80 group-hover:text-cream-100 transition-colors">
              {{ ticket.name }}
            </p>
            <p class="mt-1 text-sm text-cream-100/40">
              {{ ticket.description }}
            </p>
          </div>

          <span class="text-2xl font-bold text-accent">
            {{ ticket.price }} ₽
          </span>
        </div>

        <!-- Добавить билет (только для админа и не в режиме удаления) -->
        <div
          v-if="isAdmin && !isDeleteMode"
          class="group/add mt-6 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-accent/5"
        >
          <i class="fa-solid fa-plus text-xl text-cream-100/40 transition-colors duration-300 group-hover/add:text-accent"></i>
          <p class="text-cream-100/60 text-sm font-medium">Добавить тип билета</p>
        </div>
      </div>
    </div>

    <!-- Modal Component -->
    <VisitModal
      v-if="!isDeleteMode"
      :visible="isModalVisible"
      :tickets="tickets"
      :default-date="todayDate"
      :preselected-ticket="selectedTicket" 
      @close="closeModal"
      @purchase="handlePurchase"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VisitModal from '../overlay/VisitModal.vue'

interface Ticket {
  name: string
  description: string
  price: number
}

// Флаг администратора
const isAdmin = ref(true)

// Режим удаления
const isDeleteMode = ref(false)
const selectedTickets = ref<number[]>([])
const selectedHours = ref<number[]>([])

const isModalVisible = ref(false)
const selectedTicket = ref<Ticket | null>(null)

// Получаем сегодняшнюю дату в формате YYYY-MM-DD
const todayDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const hours = ref([
  { day: 'Пн – Пт', time: '9:00 – 19:00' },
  { day: 'Сб – Вс', time: '8:00 – 21:00' },
  { day: 'Праздники', time: '9:00 – 20:00' },
  { day: 'Ночное сафари', time: '21:00 – 23:30' }
])

const tickets = ref<Ticket[]>([
  { name: 'Взрослый', description: '18–64 года', price: 890 },
  { name: 'Детский', description: '4–17 лет', price: 490 },
  { name: 'Пенсионный', description: '65+ лет', price: 450 },
  { name: 'Семейный', description: '2 взрослых + 2 детей', price: 2100 },
  { name: 'Годовой абонемент', description: 'Неограниченное посещение', price: 3900 }
])

// Открытие общей модалки (пустой)
const openGeneralModal = () => {
  selectedTicket.value = null // Сбрасываем предвыбор
  isModalVisible.value = true
}

// Открытие модалки с конкретным билетом
const openModal = (ticket: Ticket) => {
  selectedTicket.value = ticket // Устанавливаем предвыбор
  isModalVisible.value = true
}

const closeModal = () => {
  isModalVisible.value = false
}

// Обработка покупки из модалки
const handlePurchase = (data: { tickets: any[]; date: string; time: string }) => {
  console.log('Покупка:', data)
  // Здесь логика отправки на бэкенд или перехода к оплате
  closeModal()
}

// Переключение режима удаления
const enableDeleteMode = () => {
  isDeleteMode.value = true
  selectedTickets.value = []
  selectedHours.value = []
}

const cancelDeleteMode = () => {
  isDeleteMode.value = false
  selectedTickets.value = []
  selectedHours.value = []
}

// Переключение выбора билета
const toggleTicketSelection = (index: number) => {
  const idx = selectedTickets.value.indexOf(index)
  if (idx > -1) {
    selectedTickets.value.splice(idx, 1)
  } else {
    selectedTickets.value.push(index)
  }
}

// Переключение выбора времени работы
const toggleHourSelection = (index: number) => {
  const idx = selectedHours.value.indexOf(index)
  if (idx > -1) {
    selectedHours.value.splice(idx, 1)
  } else {
    selectedHours.value.push(index)
  }
}

// Подтверждение удаления
const confirmDelete = () => {
  // Здесь будет логика удаления
  console.log('Удалить билеты:', selectedTickets.value)
  console.log('Удалить время работы:', selectedHours.value)
  // После удаления очищаем
  selectedTickets.value = []
  selectedHours.value = []
  isDeleteMode.value = false
}

// Эмитим состояние для родительского компонента
defineExpose({
  isDeleteMode,
  enableDeleteMode,
  cancelDeleteMode,
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>