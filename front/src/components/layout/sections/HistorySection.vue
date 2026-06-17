<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTicketsStore } from '@/stores/tickets'
import type { Booking } from '@/services/tickets.service'

// Типы
interface Purchase {
  id: number
  date: string
  title: string
  category: string
  quantity: number
  price: number
  total: number
  status: 'completed' | 'pending' | 'cancelled' | 'refunded'
  paymentMethod: string
  visitDate?: string
  visitTime?: string
}

const router = useRouter()
const ticketsStore = useTicketsStore()

// Локальное состояние
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'completed' | 'pending' | 'cancelled' | 'refunded'>('all')

// Получаем реальные бронирования из store
const purchases = computed<Purchase[]>(() => {
  return ticketsStore.bookings.map((booking: Booking) => ({
    id: booking.id,
    date: booking.createdAt || booking.visitDate,
    title: booking.tickets.map(t => t.ticketType.name).join(', '),
    category: 'Билеты',
    quantity: booking.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0),
    price: booking.totalPrice / (booking.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0) || 1),
    total: booking.totalPrice,
    status: mapStatus(booking.status),
    paymentMethod: booking.paymentId ? 'Карта' : 'Не оплачено',
    visitDate: booking.visitDate,
    visitTime: booking.visitTime,
  }))
})

// Маппинг статусов
const mapStatus = (status: string): 'completed' | 'pending' | 'cancelled' | 'refunded' => {
  switch (status) {
    case 'paid': return 'completed'
    case 'pending': return 'pending'
    case 'cancelled': return 'cancelled'
    default: return 'pending'
  }
}

// Статистика
const stats = computed(() => {
  const completed = purchases.value.filter((p) => p.status === 'completed')
  return {
    total: purchases.value.length,
    completed: completed.length,
    totalSpent: completed.reduce((sum: number, p: Purchase) => sum + p.total, 0),
    lastPurchase: purchases.value[0]?.date || '—',
  }
})

// Фильтрация
const filteredPurchases = computed(() => {
  return purchases.value.filter((p) => {
    const matchesSearch =
      !searchQuery.value ||
      p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

// Форматирование даты
const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Форматирование цены
const formatPrice = (price: number) => {
  if (price === 0) return 'Бесплатно'
  return `${price.toLocaleString('ru-RU')} ₽`
}

// Статусы
const getStatusConfig = (status: Purchase['status']) => {
  const configs = {
    completed: { label: 'Оплачено', class: 'bg-lime-500/20 text-lime-400', icon: 'fa-check' },
    pending: { label: 'Ожидает', class: 'bg-amber-500/20 text-amber-400', icon: 'fa-clock' },
    cancelled: { label: 'Отменено', class: 'bg-red-500/20 text-red-400', icon: 'fa-times' },
    refunded: { label: 'Возврат', class: 'bg-white/10 text-white/60', icon: 'fa-undo' },
  }
  return configs[status]
}

// Повторить покупку
const repeatPurchase = (purchase: Purchase) => {
  ElMessage.info('Переход к покупке билетов...')
  router.push('/tickets')
}

// Скачать чек
const downloadReceipt = async (purchase: Purchase) => {
  try {
    const receipt = generateReceipt(purchase)
    
    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `чек_${purchase.id}_${purchase.date}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('Чек скачан')
  } catch (error) {
    ElMessage.error('Ошибка скачивания чека')
  }
}

// Генерация текста чека
const generateReceipt = (purchase: Purchase) => {
  return `
═══════════════════════════════════════
         ZooVerse - Чек оплаты
═══════════════════════════════════════

Номер заказа: #${purchase.id}
Дата: ${formatDate(purchase.date)}
Время посещения: ${purchase.visitDate} в ${purchase.visitTime}

───────────────────────────────────────
Услуги:
───────────────────────────────────────
${purchase.title}
Количество: ${purchase.quantity} шт.
Цена за единицу: ${formatPrice(purchase.price)}

───────────────────────────────────────
ИТОГО: ${formatPrice(purchase.total)}
───────────────────────────────────────

Способ оплаты: ${purchase.paymentMethod}
Статус: ${getStatusConfig(purchase.status).label}

═══════════════════════════════════════
    Спасибо за посещение ZooVerse!
═══════════════════════════════════════
  `.trim()
}

// Загрузка данных при монтировании
onMounted(async () => {
  isLoading.value = true
  try {
    await ticketsStore.fetchMyBookings()
  } catch (error) {
    ElMessage.error('Ошибка загрузки истории покупок')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Статистика -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-white/50">
          <i class="fa-solid fa-receipt text-white/40"></i>
          Всего покупок
        </div>
        <div class="mt-1 text-2xl font-bold text-white">{{ stats.total }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-white/50">
          <i class="fa-solid fa-check text-lime-400/70"></i>
          Оплачено
        </div>
        <div class="mt-1 text-2xl font-bold text-lime-400">{{ stats.completed }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-white/50">
          <i class="fa-solid fa-wallet text-amber-400/70"></i>
          Потрачено
        </div>
        <div class="mt-1 text-2xl font-bold text-amber-400">{{ formatPrice(stats.totalSpent) }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-white/50">
          <i class="fa-solid fa-calendar text-white/40"></i>
          Последняя покупка
        </div>
        <div class="mt-1 text-lg font-bold text-white">{{ formatDate(stats.lastPurchase) }}</div>
      </div>
    </div>

    <!-- Панель управления -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <!-- Поиск -->
        <div class="relative max-w-md flex-1">
          <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-white/30"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по названию или категории..."
            class="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-white/40 outline-none transition-all focus:border-lime-400/50 focus:bg-white/10"
          />
        </div>

        <!-- Фильтры -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="status in [
              { value: 'all', label: 'Все' },
              { value: 'completed', label: 'Оплачено' },
              { value: 'pending', label: 'Ожидает' },
              { value: 'refunded', label: 'Возврат' },
            ]"
            :key="status.value"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
            :class="
              statusFilter === status.value
                ? 'bg-lime-400 text-forest-900'
                : 'border border-white/10 text-white/70 hover:bg-white/5'
            "
            @click="statusFilter = status.value as any"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Список покупок -->
      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-white/30"></i>
        <p class="mt-3 text-white/50">Загрузка...</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="purchase in filteredPurchases"
          :key="purchase.id"
          class="group flex flex-col gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/10 hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
        >
          <!-- Основная информация -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
              :class="{
                'bg-lime-500/10 text-lime-400': purchase.status === 'completed',
                'bg-amber-500/10 text-amber-400': purchase.status === 'pending',
                'bg-red-500/10 text-red-400': purchase.status === 'cancelled',
                'bg-white/5 text-white/50': purchase.status === 'refunded',
              }"
            >
              <i :class="getStatusConfig(purchase.status).icon" class="text-xl"></i>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="font-medium text-white truncate">
                  {{ purchase.title }}
                </h4>
                <span class="text-xs text-white/40">#{{ purchase.id }}</span>
              </div>

              <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/50">
                <span>{{ purchase.category }}</span>
                <span class="text-white/20">•</span>
                <span>{{ formatDate(purchase.date) }}</span>
                <span class="text-white/20">•</span>
                <span>{{ purchase.quantity }} шт.</span>
              </div>

              <div class="mt-1 text-xs text-white/40">
                <i class="fa-solid fa-clock mr-1"></i>
                {{ purchase.visitDate }} в {{ purchase.visitTime }}
              </div>
            </div>
          </div>

          <!-- Сумма и действия -->
          <div class="flex items-center gap-4 sm:flex-col sm:items-end">
            <div class="text-right">
              <div class="text-lg font-bold text-white">
                {{ formatPrice(purchase.total) }}
              </div>
              <span
                class="inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="getStatusConfig(purchase.status).class"
              >
                {{ getStatusConfig(purchase.status).label }}
              </span>
            </div>

            <div class="flex gap-2 opacity-0 transition group-hover:opacity-100">
              <button
                v-if="purchase.status === 'completed'"
                class="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
                @click="repeatPurchase(purchase)"
                title="Повторить"
              >
                <i class="fa-solid fa-rotate-right"></i>
              </button>
              <button
                v-if="purchase.status === 'completed'"
                class="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
                @click="downloadReceipt(purchase)"
                title="Скачать чек"
              >
                <i class="fa-solid fa-download"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div
          v-if="filteredPurchases.length === 0"
          class="py-12 text-center"
        >
          <i class="fa-solid fa-receipt text-5xl text-white/20 mb-3"></i>
          <div class="text-white/50">
            {{ searchQuery || statusFilter !== 'all' ? 'Ничего не найдено' : 'У вас пока нет покупок' }}
          </div>
          <p class="mt-1 text-sm text-white/30">
            {{ searchQuery || statusFilter !== 'all' ? 'Попробуйте изменить фильтры' : 'Здесь появится история ваших покупок' }}
          </p>
          <button
            v-if="!searchQuery && statusFilter === 'all'"
            @click="router.push('/tickets')"
            class="mt-4 rounded-full bg-lime-400 px-6 py-2 text-sm font-bold text-forest-900 hover:bg-lime-500 transition"
          >
            Купить билеты
          </button>
        </div>
      </div>

      <!-- Итого -->
      <div
        v-if="filteredPurchases.length > 0"
        class="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/50"
      >
        <span>Показано: {{ filteredPurchases.length }} из {{ purchases.length }}</span>
        <span>
          Итого: <strong class="text-white">{{ formatPrice(filteredPurchases.reduce((sum: number, p: Purchase) => sum + p.total, 0)) }}</strong>
        </span>
      </div>
    </div>
  </div>
</template>