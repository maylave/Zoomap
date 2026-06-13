<template>
  <section id="visit" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div class="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
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
          @click="openGeneralModal"
          class="btn btn-accent mt-8 rounded-full px-8 cursor-pointer"
        >
          Купить билет онлайн →
        </button>

        <!-- Время работы -->
        <div class="mt-10 grid gap-4 sm:grid-cols-2">
          <div
            v-for="item in hours"
            :key="item.day"
            class="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
          >
            <p class="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
              {{ item.day }}
            </p>
            <p class="text-2xl font-bold text-cream-100">
              {{ item.time }}
            </p>
          </div>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="rounded-[2rem] border border-accent/20 bg-accent/10 p-8 backdrop-blur-sm lg:p-10">
        <h3 class="mb-8 text-2xl font-bold text-cream-100">
          Стоимость билетов
        </h3>

        <div
          v-for="ticket in tickets"
          :key="ticket.name"
          class="flex items-center justify-between border-b border-white/10 py-4 last:border-0 cursor-pointer hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors group"
          @click="openModal(ticket)"
        >
          <div>
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
      </div>
    </div>

    <!-- Modal Component -->
    <VisitModal
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

const isModalVisible = ref(false)
const selectedTicket = ref<Ticket | null>(null)

// Получаем сегодняшнюю дату в формате YYYY-MM-DD
const todayDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const hours = [
  { day: 'Пн – Пт', time: '9:00 – 19:00' },
  { day: 'Сб – Вс', time: '8:00 – 21:00' },
  { day: 'Праздники', time: '9:00 – 20:00' },
  { day: 'Ночное сафари', time: '21:00 – 23:30' }
]

const tickets: Ticket[] = [
  { name: 'Взрослый', description: '18–64 года', price: 890 },
  { name: 'Детский', description: '4–17 лет', price: 490 },
  { name: 'Пенсионный', description: '65+ лет', price: 450 },
  { name: 'Семейный', description: '2 взрослых + 2 детей', price: 2100 },
  { name: 'Годовой абонемент', description: 'Неограниченное посещение', price: 3900 }
]

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
</script>