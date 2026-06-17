<template>
  <section id="visit" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div class="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
      <!-- Блок предупреждения (только для админа) -->
      <div
        v-if="authStore.isAdmin && !isDeleteMode"
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
          @click="openSectionEditModal"
        >
          <i class="fa-solid fa-pen text-sm"></i>
        </button>
      </div>

      <!-- Панель удаления -->
      <div
        v-if="isDeleteMode && (selectedTickets.length > 0 || selectedHours.length > 0)"
        class="mb-10 flex items-center justify-between rounded-2xl border border-terracotta/30 bg-terracotta/10 p-4 backdrop-blur-sm animate-fade-in lg:col-span-2"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/20">
            <i class="fa-solid fa-trash text-terracotta"></i>
          </div>
          <div>
            <p class="text-cream-100 text-sm font-medium">
              Выбрано: {{ selectedTickets.length + selectedHours.length }} элементов
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="px-4 py-2 rounded-xl border border-white/10 text-cream-100/60 hover:text-cream-100 hover:bg-white/5"
            @click="cancelDeleteMode"
          >
            Отмена
          </button>
          <button
            class="px-6 py-2 rounded-xl bg-terracotta text-cream-100 font-medium hover:bg-terracotta/90"
            @click="confirmDelete"
          >
            Удалить
          </button>
        </div>
      </div>

      <!-- Левая колонка -->
      <div>
        <span class="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          {{ sectionBadge }}
        </span>

        <h2 class="mt-6 text-4xl font-bold text-cream-100 md:text-5xl">
          {{ sectionTitle }}
        </h2>

        <p class="mt-6 max-w-xl leading-8 text-cream-100/60">
          {{ sectionDescription }}
        </p>

        <!-- Кнопка открывает модалку -->
        <button
          v-if="!isDeleteMode"
          @click="openGeneralModal"
          class="btn btn-accent mt-8 rounded-full px-8 cursor-pointer"
        >
          Купить билет онлайн →
        </button>

        <!-- Время работы (из API) -->
        <div class="mt-10 grid gap-4 sm:grid-cols-2">
          <div
            v-for="(item, index) in hours"
            :key="item.id || index"
            class="group/hour relative rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
          >
            <p class="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
              {{ item.day }}
            </p>
            <p class="text-2xl font-bold text-cream-100">
              {{ item.time }}
            </p>
          </div>

          <!-- Loading skeleton -->
          <div
            v-if="isLoadingHours"
            v-for="i in 2"
            :key="'skeleton-' + i"
            class="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse"
          >
            <div class="h-3 w-20 bg-white/10 rounded mb-2"></div>
            <div class="h-6 w-32 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Правая колонка - Билеты из API -->
      <div class="rounded-[2rem] border border-accent/20 bg-accent/10 p-8 backdrop-blur-sm lg:p-10">
        <h3 class="mb-8 text-2xl font-bold text-cream-100">
          Стоимость билетов
        </h3>

        <!-- Loading -->
        <div v-if="ticketsStore.isLoading && tickets.length === 0" class="space-y-4">
          <div
            v-for="i in 4"
            :key="i"
            class="flex items-center justify-between border-b border-white/10 py-4 animate-pulse"
          >
            <div>
              <div class="h-4 w-32 bg-white/10 rounded mb-2"></div>
              <div class="h-3 w-24 bg-white/5 rounded"></div>
            </div>
            <div class="h-6 w-20 bg-white/10 rounded"></div>
          </div>
        </div>

        <!-- Список билетов -->
        <div v-else>
          <div
            v-for="(ticket, index) in tickets"
            :key="ticket.id"
            class="relative flex items-center justify-between border-b border-white/10 py-4 last:border-0 transition-colors group/ticket cursor-pointer hover:bg-white/5 px-2 -mx-2 rounded-lg"
            @click="openModal(ticket)"
          >
            <div>
              <p class="font-medium text-cream-100/80 group-hover/ticket:text-cream-100 transition-colors">
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

          <!-- Пустое состояние -->
          <div
            v-if="tickets.length === 0"
            class="py-8 text-center text-cream-100/40"
          >
            <i class="fa-solid fa-ticket text-4xl mb-3"></i>
            <p>Нет доступных билетов</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal для покупки -->
    <VisitModal
      v-if="!isDeleteMode"
      :visible="isModalVisible"
      :tickets="tickets"
      :default-date="todayDate"
      :preselected-ticket="selectedTicket"
      @close="closeModal"
      @purchase="handlePurchase"
    />

    <!-- Edit Modals -->
    <EditModal
      :visible="isSectionEditModalOpen"
      title="Редактирование секции"
      subtitle="Измените заголовок и описание секции"
      :fields="sectionEditFields"
      @close="closeSectionEditModal"
      @save="handleSectionEditSave"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import VisitModal from '../overlay/VisitModal.vue'
import EditModal from '@/components/overlay/EditModal.vue'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { adminService } from '@/services/admin.service'

interface Ticket {
  id: number
  name: string
  description: string
  price: number
  minAge?: number
  maxAge?: number
  maxQuantity?: number
  isActive?: boolean
}

interface Hour {
  id?: number
  day: string
  time: string
}

const router = useRouter()
const ticketsStore = useTicketsStore()
const authStore = useAuthStore()

// Состояние
const isDeleteMode = ref(false)
const selectedTickets = ref<number[]>([])
const selectedHours = ref<number[]>([])
const isModalVisible = ref(false)
const selectedTicket = ref<Ticket | null>(null)
const isLoadingHours = ref(false)

// Данные
const hours = ref<Hour[]>([])

// Тексты секции
const sectionBadge = ref('Планируйте визит')
const sectionTitle = ref('Время и цены')
const sectionDescription = ref('ZooVerse работает 365 дней в году. Мы верим, что общение с природой должно быть доступным для каждого.')

// Сегодняшняя дата
const todayDate = computed(() => new Date().toISOString().split('T')[0])

// Билеты из store (активные)
const tickets = computed<Ticket[]>(() => {
  return ticketsStore.ticketTypes
    .filter(t => t.isActive !== false)
    .map(t => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      price: t.price,
      minAge: t.minAge,
      maxAge: t.maxAge,
      maxQuantity: t.maxQuantity,
      isActive: t.isActive,
    }))
})

// Поля для редактирования секции
const isSectionEditModalOpen = ref(false)
const sectionEditFields = computed(() => [
  { key: 'sectionBadge', label: 'Бейдж', value: sectionBadge.value, type: 'text' as const },
  { key: 'sectionTitle', label: 'Заголовок', value: sectionTitle.value, required: true, type: 'text' as const },
  { key: 'sectionDescription', label: 'Описание', value: sectionDescription.value, rows: 3, type: 'textarea' as const },
])

// Загрузка данных при монтировании
onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    // Загружаем типы билетов
    await ticketsStore.fetchTicketTypes()
    
    // Загружаем расписание работы
    await fetchWorkingHours()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
}

async function fetchWorkingHours() {
  isLoadingHours.value = true
  try {
    const response = await ticketsStore.fetchSchedule()
    if (Array.isArray(response)) {
      hours.value = response.map(h => ({
        id: h.id,
        day: h.daysOfWeek,
        time: `${h.openTime} – ${h.closeTime}`,
      }))
    } else {
      // Fallback на локальные данные
      hours.value = [
        { day: 'Пн – Пт', time: '9:00 – 19:00' },
        { day: 'Сб – Вс', time: '8:00 – 21:00' },
      ]
    }
  } catch (error) {
    hours.value = [
      { day: 'Пн – Пт', time: '9:00 – 19:00' },
      { day: 'Сб – Вс', time: '8:00 – 21:00' },
    ]
  } finally {
    isLoadingHours.value = false
  }
}

// Модалки
const openGeneralModal = () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    ElMessage.info('Войдите, чтобы купить билет')
    return
  }
  selectedTicket.value = null
  isModalVisible.value = true
}

const openModal = (ticket: Ticket) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    ElMessage.info('Войдите, чтобы купить билет')
    return
  }
  selectedTicket.value = ticket
  isModalVisible.value = true
}

const closeModal = () => {
  isModalVisible.value = false
}

// Покупка - интеграция с API
const handlePurchase = async (data: { tickets: any[]; date: string; time: string }) => {
  try {
    // Маппим в формат API
    const tickets = data.tickets.map((item: any) => ({
      ticketTypeId: item.ticket.id,
      quantity: item.count,
      price: item.ticket.price,
    }))

    // Создаём бронирование через store
    const booking = await ticketsStore.createBooking({
      visitDate: data.date,
      visitTime: data.time,
      tickets,
    })

    if (booking) {
      closeModal()
      ElMessage.success('Бронирование создано!')
      
      // Переход в профиль к моим билетам
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    }
  } catch (error: any) {
    console.error('Ошибка покупки:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка бронирования')
  }
}

// Режим удаления (для админа)
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

const confirmDelete = async () => {
  // Удаляем билеты
  for (const index of [...selectedTickets.value].sort((a, b) => b - a)) {
    const ticket = tickets.value[index]
    if (ticket) {
      await adminService.deleteTicketType(ticket.id)
    }
  }

  // Удаляем время работы
  for (const index of [...selectedHours.value].sort((a, b) => b - a)) {
    const hour = hours.value[index]
    if (hour?.id) {
      await adminService.deleteWorkingHour(hour.id)
    }
  }

  ElMessage.success('Удалено')
  await loadData()
  cancelDeleteMode()
}

// Редактирование секции
const openSectionEditModal = () => {
  isSectionEditModalOpen.value = true
}

const closeSectionEditModal = () => {
  isSectionEditModalOpen.value = false
}

const handleSectionEditSave = (values: Record<string, any>) => {
  if (values.sectionBadge !== undefined) sectionBadge.value = values.sectionBadge
  if (values.sectionTitle !== undefined) sectionTitle.value = values.sectionTitle
  if (values.sectionDescription !== undefined) sectionDescription.value = values.sectionDescription
  ElMessage.success('Секция обновлена')
}

defineExpose({
  isDeleteMode,
  enableDeleteMode,
  cancelDeleteMode,
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
</style>