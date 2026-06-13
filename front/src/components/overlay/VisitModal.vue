<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click="$emit('close')"
    >
      <div
        class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-forest-900 shadow-2xl ring-1 ring-white/10 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Close Button -->
        <button
          class="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-cream-100 transition hover:bg-black/40"
          @click="$emit('close')"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Header -->
        <div class="border-b border-white/10 bg-accent/10 p-8 pb-6">
          <h3 class="text-2xl font-bold text-cream-100">
            Оформление билета
          </h3>
          <p class="mt-2 text-sm text-cream-100/60">
            Выберите дату, время и количество гостей
          </p>
        </div>

        <!-- Body -->
        <div class="space-y-6 p-8">

          <!-- Date Picker Trigger -->
          <div>
            <label class="mb-2 block text-sm font-medium text-cream-100/80">
              Дата посещения
            </label>
            <div
              class="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream-100 transition hover:border-accent/30"
              @click="showDatePicker = true"
            >
              <svg
                class="h-5 w-5 shrink-0 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="flex-1">{{ formattedDate }}</span>
              <svg
                class="h-4 w-4 text-cream-100/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          <!-- Time Slots -->
          <div>
            <label class="mb-2 block text-sm font-medium text-cream-100/80">
              Время посещения
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="slot in timeSlots"
                :key="slot.value"
                class="rounded-xl border px-3 py-2.5 text-sm font-medium transition"
                :class="
                  selectedTime === slot.value
                    ? 'border-accent bg-accent/20 text-accent'
                    : 'border-white/10 bg-white/5 text-cream-100/60 hover:border-white/20 hover:text-cream-100'
                "
                @click="selectedTime = slot.value"
              >
                {{ slot.label }}
              </button>
            </div>
          </div>

          <!-- Selected Tickets List -->
          <div>
            <label class="mb-2 block text-sm font-medium text-cream-100/80">
              Выбранные билеты
            </label>

            <div
              v-if="selectedTickets.length === 0"
              class="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-cream-100/40"
            >
              Нажмите «Добавить тип билета», чтобы начать
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(item, index) in selectedTickets"
                :key="index"
                class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div class="flex-1">
                  <span class="font-medium text-cream-100">{{ item.ticket.name }}</span>
                  <span class="ml-2 text-sm text-cream-100/60">{{ item.ticket.price }} ₽</span>
                </div>

                <div class="flex items-center gap-3">
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-cream-100 transition hover:bg-white/10"
                    @click="item.count > 1 ? item.count-- : removeTicket(index)"
                  >
                    {{ item.count > 1 ? '−' : '×' }}
                  </button>

                  <span class="w-8 text-center font-bold text-cream-100">{{ item.count }}</span>

                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-cream-100 transition hover:bg-white/10"
                    @click="item.count++"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Ticket Type Button -->
          <button
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent/30 bg-accent/5 py-3 text-accent transition hover:bg-accent/10"
            @click="showTypeSelector = true"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Добавить тип билета
          </button>

          <!-- Total -->
          <div class="flex items-center justify-between border-t border-white/10 pt-4">
            <span class="text-cream-100/60">Итого к оплате:</span>
            <span class="text-3xl font-bold text-accent">{{ totalPrice }} ₽</span>
          </div>

          <!-- Submit Button -->
          <button
            class="btn btn-accent w-full rounded-xl py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="selectedTickets.length === 0 || !selectedTime || !selectedDate"
            @click="handlePurchase"
          >
            Перейти к оплате
          </button>

          <p class="text-center text-xs text-cream-100/30">
            Нажимая кнопку, вы соглашаетесь с правилами посещения парка
          </p>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Custom Date Picker Modal -->
  <Transition name="fade">
    <div
      v-if="showDatePicker"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @click="showDatePicker = false"
    >
      <div
        class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-forest-900 shadow-2xl ring-1 ring-white/10"
        @click.stop
      >
        <!-- Month Navigation -->
        <div class="flex items-center justify-between border-b border-white/10 p-6">
          <button
            class="rounded-full p-2 text-cream-100/60 transition hover:bg-white/10 hover:text-cream-100"
            @click="prevMonth"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="text-lg font-bold text-cream-100 capitalize">
            {{ currentMonthName }} {{ currentYear }}
          </span>
          <button
            class="rounded-full p-2 text-cream-100/60 transition hover:bg-white/10 hover:text-cream-100"
            @click="nextMonth"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 px-6 pt-4">
          <div
            v-for="day in weekDays"
            :key="day"
            class="py-2 text-center text-xs font-medium text-cream-100/40"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-1 p-6 pt-2">
          <div
            v-for="n in leadingEmptyDays"
            :key="'empty-' + n"
            class="aspect-square"
          />
          <button
            v-for="day in daysInMonth"
            :key="day"
            class="aspect-square rounded-xl text-sm font-medium transition"
            :class="getDayClass(day)"
            :disabled="isDateDisabled(day)"
            @click="selectDate(day)"
          >
            {{ day }}
          </button>
        </div>

        <!-- Today Button -->
        <div class="border-t border-white/10 p-6">
          <button
            class="w-full rounded-xl bg-accent/10 py-3 text-accent transition hover:bg-accent/20"
            @click="selectToday"
          >
            Сегодня
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Ticket Type Selector Modal -->
  <Transition name="fade">
    <div
      v-if="showTypeSelector"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @click="showTypeSelector = false"
    >
      <div
        class="relative w-full max-w-md overflow-hidden rounded-3xl bg-forest-900 shadow-2xl ring-1 ring-white/10"
        @click.stop
      >
        <div class="border-b border-white/10 p-6">
          <h3 class="text-xl font-bold text-cream-100">Выберите тип билета</h3>
        </div>
        <div class="max-h-96 overflow-y-auto p-6">
          <div class="space-y-3">
            <button
              v-for="ticket in availableTickets"
              :key="ticket.name"
              class="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 hover:border-accent/30"
              @click="addTicket(ticket)"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium text-cream-100">{{ ticket.name }}</span>
                <span class="text-accent font-bold">{{ ticket.price }} ₽</span>
              </div>
            </button>
          </div>
        </div>
        <div class="border-t border-white/10 p-6">
          <button
            class="w-full rounded-xl bg-white/10 py-3 text-cream-100 transition hover:bg-white/20"
            @click="showTypeSelector = false"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch
} from 'vue'
import { Ticket,SelectedTicket } from "@/types/ticket";



const props = defineProps<{
  visible: boolean
  tickets?: Ticket[]
  defaultDate?: string
  preselectedTicket?: Ticket | null // <-- Важно для автодобавления
}>()

const emit = defineEmits<{
  close: []
  purchase: [data: { tickets: SelectedTicket[]; date: string; time: string }]
}>()

// Default tickets if not provided via props
const defaultTickets: Ticket[] = [
  { name: 'Взрослый', price: 890 },
  { name: 'Детский', price: 490 },
  { name: 'Пенсионный', price: 450 },
  { name: 'Семейный', price: 2100 }
]

const tickets = computed(() => props.tickets ?? defaultTickets)

const selectedTickets = ref<SelectedTicket[]>([])
const showTypeSelector = ref(false)
const showDatePicker = ref(false)
const selectedTime = ref('')

// Date state
const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)

// Watch for visibility and preselected ticket to reset/add initial state
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      // Reset basic state
      selectedTime.value = ''
      
      // Set Date
      if (props.defaultDate) {
        const d = new Date(props.defaultDate)
        selectedDate.value = d
        currentDate.value = new Date(d.getFullYear(), d.getMonth(), 1)
      } else {
        const now = new Date()
        selectedDate.value = now
        currentDate.value = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      // Handle Preselected Ticket
      selectedTickets.value = []
      if (props.preselectedTicket) {
        selectedTickets.value.push({
          ticket: props.preselectedTicket,
          count: 1
        })
      }
    }
  }
)

// Time slots
const timeSlots = [
  { label: '09:00', value: '09:00' },
  { label: '10:00', value: '10:00' },
  { label: '11:00', value: '11:00' },
  { label: '12:00', value: '12:00' },
  { label: '13:00', value: '13:00' },
  { label: '14:00', value: '14:00' },
  { label: '15:00', value: '15:00' },
  { label: '16:00', value: '16:00' },
  { label: '17:00', value: '17:00' },
  { label: '18:00', value: '18:00' },
  { label: '19:00', value: '19:00' },
  { label: '20:00', value: '20:00' }
]

// Calendar helpers
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('ru-RU', { month: 'long' })
})

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const daysInMonth = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  return new Date(year, month + 1, 0).getDate()
})

const leadingEmptyDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1
})

const today = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
})

function isDateDisabled(day: number): boolean {
  const date = new Date(currentYear.value, currentMonth.value, day)
  return date < today.value
}

function getDayClass(day: number): string {
  const date = new Date(currentYear.value, currentMonth.value, day)
  const isToday = date.getTime() === today.value.getTime()
  const isSelected =
    selectedDate.value &&
    selectedDate.value.getFullYear() === currentYear.value &&
    selectedDate.value.getMonth() === currentMonth.value &&
    selectedDate.value.getDate() === day
  const disabled = isDateDisabled(day)

  if (isSelected) {
    return 'bg-accent text-white font-bold shadow-lg shadow-accent/30'
  }
  if (isToday) {
    return 'border border-accent/50 text-accent hover:bg-accent/10'
  }
  if (disabled) {
    return 'text-cream-100/20 cursor-not-allowed'
  }
  return 'text-cream-100 hover:bg-white/10'
}

function selectDate(day: number) {
  if (isDateDisabled(day)) return
  selectedDate.value = new Date(currentYear.value, currentMonth.value, day)
  showDatePicker.value = false
}

function selectToday() {
  const now = new Date()
  selectedDate.value = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  currentDate.value = new Date(now.getFullYear(), now.getMonth(), 1)
  showDatePicker.value = false
}

function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

// Formatted date display
const formattedDate = computed(() => {
  if (!selectedDate.value) return 'Выберите дату'
  return selectedDate.value.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Available tickets (excluding already selected types to avoid duplicates in selector)
const availableTickets = computed(() => {
  const selectedNames = selectedTickets.value.map(item => item.ticket.name)
  return tickets.value.filter(ticket => !selectedNames.includes(ticket.name))
})

// Total price
const totalPrice = computed(() => {
  return selectedTickets.value.reduce((sum, item) => {
    return sum + item.ticket.price * item.count
  }, 0)
})

// Add ticket
function addTicket(ticket: Ticket) {
  selectedTickets.value.push({ ticket, count: 1 })
  showTypeSelector.value = false
}

// Remove ticket
function removeTicket(index: number) {
  selectedTickets.value.splice(index, 1)
}

// Handle purchase
function handlePurchase() {
  if (selectedTickets.value.length === 0 || !selectedTime.value || !selectedDate.value) return

  emit('purchase', {
    tickets: selectedTickets.value,
    date: selectedDate.value.toISOString().split('T')[0],
    time: selectedTime.value
  })
}

// Keyboard handler
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showDatePicker.value) {
      showDatePicker.value = false
    } else if (showTypeSelector.value) {
      showTypeSelector.value = false
    } else {
      emit('close')
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .relative,
.fade-leave-active .relative {
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.3s ease;
}

.fade-enter-from .relative,
.fade-leave-to .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>