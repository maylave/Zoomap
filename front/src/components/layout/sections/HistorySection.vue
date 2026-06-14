<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'

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
}

// Данные (в реальном проекте — из API/store)
const purchases = ref<Purchase[]>([
  {
    id: 1001,
    date: '2026-06-12',
    title: 'Семейный билет',
    category: 'Билеты',
    quantity: 1,
    price: 2100,
    total: 2100,
    status: 'completed',
    paymentMethod: 'Карта •• 4532',
  },
  {
    id: 1002,
    date: '2026-06-10',
    title: 'Ночное сафари',
    category: 'Экскурсии',
    quantity: 2,
    price: 590,
    total: 1180,
    status: 'completed',
    paymentMethod: 'Карта •• 4532',
  },
  {
    id: 1003,
    date: '2026-06-05',
    title: 'Мастер-класс "Слоны-художники"',
    category: 'Мастер-классы',
    quantity: 1,
    price: 350,
    total: 350,
    status: 'pending',
    paymentMethod: 'SBP',
  },
  {
    id: 1004,
    date: '2026-05-28',
    title: 'Годовой абонемент',
    category: 'Абонементы',
    quantity: 1,
    price: 3900,
    total: 3900,
    status: 'completed',
    paymentMethod: 'Карта •• 4532',
  },
  {
    id: 1005,
    date: '2026-05-15',
    title: 'Детский билет (4-17 лет)',
    category: 'Билеты',
    quantity: 2,
    price: 490,
    total: 980,
    status: 'refunded',
    paymentMethod: 'Карта •• 4532',
  },
  {
    id: 1006,
    date: '2026-05-01',
    title: 'Экскурсия "День льва"',
    category: 'Экскурсии',
    quantity: 1,
    price: 0,
    total: 0,
    status: 'completed',
    paymentMethod: 'Бесплатно',
  },
])

// Поиск
const searchQuery = ref('')

// Фильтр по статусу
const statusFilter = ref<'all' | 'completed' | 'pending' | 'cancelled' | 'refunded'>('all')

// Статистика
const stats = computed(() => {
  const completed = purchases.value.filter((p) => p.status === 'completed')
  return {
    total: purchases.value.length,
    completed: completed.length,
    totalSpent: completed.reduce((sum, p) => sum + p.total, 0),
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
    completed: { label: 'Оплачено', class: 'badge-success', icon: 'check' },
    pending: { label: 'Ожидает', class: 'badge-warning', icon: 'clock' },
    cancelled: { label: 'Отменено', class: 'badge-error', icon: 'close' },
    refunded: { label: 'Возврат', class: 'badge-ghost', icon: 'undo' },
  }
  return configs[status]
}

// Повторить покупку
const repeatPurchase = (purchase: Purchase) => {
  console.log('Повторить покупку:', purchase.title)
  // Здесь будет логика повторного заказа
}

// Скачать чек
const downloadReceipt = (purchase: Purchase) => {
  console.log('Скачать чек:', purchase.id)
  // Здесь будет генерация PDF
}
</script>

<template>
  <div class="space-y-6">
    <!-- Статистика -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-white/50">
          <BaseIcon name="receipt" size="sm" class="text-white/40" />
          Всего покупок
        </div>
        <div class="mt-1 text-2xl font-bold text-white">{{ stats.total }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-white/50">
          <BaseIcon name="check" size="sm" class="text-success/70" />
          Оплачено
        </div>
        <div class="mt-1 text-2xl font-bold text-success">{{ stats.completed }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-white/50">
          <BaseIcon name="wallet" size="sm" class="text-accent/70" />
          Потрачено
        </div>
        <div class="mt-1 text-2xl font-bold text-accent">{{ formatPrice(stats.totalSpent) }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-white/50">
          <BaseIcon name="calendar" size="sm" class="text-white/40" />
          Последняя покупка
        </div>
        <div class="mt-1 text-lg font-bold text-white">{{ formatDate(stats.lastPurchase) }}</div>
      </div>
    </div>

    <!-- Панель управления -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BaseInput
          v-model="searchQuery"
          placeholder="Поиск по названию или категории..."
          class="max-w-md"
        />

        <div class="flex gap-2">
          <button
            v-for="status in [
              { value: 'all', label: 'Все' },
              { value: 'completed', label: 'Оплачено' },
              { value: 'pending', label: 'Ожидает' },
              { value: 'refunded', label: 'Возврат' },
            ]"
            :key="status.value"
            class="btn btn-sm"
            :class="
              statusFilter === status.value
                ? 'btn-accent'
                : 'btn-ghost border-white/10 text-white/70 hover:bg-white/5'
            "
            @click="statusFilter = status.value as any"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Список покупок -->
      <div class="space-y-3">
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
                'bg-success/10 text-success': purchase.status === 'completed',
                'bg-warning/10 text-warning': purchase.status === 'pending',
                'bg-error/10 text-error': purchase.status === 'cancelled',
                'bg-white/5 text-white/50': purchase.status === 'refunded',
              }"
            >
              <BaseIcon
                :name="getStatusConfig(purchase.status).icon"
                size="md"
              />
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
                {{ purchase.paymentMethod }}
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
                class="badge badge-sm mt-1"
                :class="getStatusConfig(purchase.status).class"
              >
                {{ getStatusConfig(purchase.status).label }}
              </span>
            </div>

            <div class="flex gap-2 opacity-0 transition group-hover:opacity-100">
              <button
                v-if="purchase.status === 'completed'"
                class="btn btn-ghost btn-xs text-white/70 hover:text-white"
                @click="repeatPurchase(purchase)"
                title="Повторить"
              >
                <BaseIcon name="refresh" size="sm" />
              </button>
              <button
                v-if="purchase.status === 'completed'"
                class="btn btn-ghost btn-xs text-white/70 hover:text-white"
                @click="downloadReceipt(purchase)"
                title="Скачать чек"
              >
                <BaseIcon name="download" size="sm" />
              </button>
            </div>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div
          v-if="filteredPurchases.length === 0"
          class="py-12 text-center"
        >
          <BaseIcon name="receipt" size="lg" class="mx-auto mb-3 text-white/20" />
          <div class="text-white/50">
            {{ searchQuery || statusFilter !== 'all' ? 'Ничего не найдено' : 'У вас пока нет покупок' }}
          </div>
          <p class="mt-1 text-sm text-white/30">
            {{ searchQuery || statusFilter !== 'all' ? 'Попробуйте изменить фильтры' : 'Здесь появится история ваших покупок' }}
          </p>
        </div>
      </div>

      <!-- Итого -->
      <div
        v-if="filteredPurchases.length > 0"
        class="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/50"
      >
        <span>Показано: {{ filteredPurchases.length }} из {{ purchases.length }}</span>
        <span>
          Итого: <strong class="text-white">{{ formatPrice(filteredPurchases.reduce((sum, p) => sum + p.total, 0)) }}</strong>
        </span>
      </div>
    </div>
  </div>
</template>