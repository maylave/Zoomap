<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

interface Promocode {
  id: number
  code: string
  discount: number
  type: 'percent' | 'fixed'
  status: 'active' | 'expired' | 'used'
  createdAt: string
  expiresAt: string
  description: string
  used: boolean
}

const props = defineProps<{
  promocodes: Promocode[]
}>()

const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'expired' | 'used'>('all')

// Статистика
const stats = computed(() => {
  const active = props.promocodes.filter((p) => p.status === 'active')
  const expired = props.promocodes.filter((p) => p.status === 'expired')
  const used = props.promocodes.filter((p) => p.status === 'used')

  return {
    total: props.promocodes.length,
    active: active.length,
    expired: expired.length,
    used: used.length,
  }
})

// Фильтрация
const filteredPromocodes = computed(() => {
  return props.promocodes.filter((p) => {
    const matchesSearch =
      !searchQuery.value ||
      p.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.value.toLowerCase())

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
    month: 'short',
    year: 'numeric',
  })
}

// Форматирование скидки
const formatDiscount = (promocode: Promocode) => {
  if (promocode.type === 'percent') {
    return `${promocode.discount}%`
  }
  return `${promocode.discount} ₽`
}

// ✅ Статусы — БЕЗ лаймового, используем amber/terracotta/cream
const getStatusConfig = (status: Promocode['status']) => {
  const configs = {
    active: {
      label: 'Активен',
      class: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: 'check',
      iconColor: 'text-amber-300',
      bgColor: 'bg-amber-500/10',
    },
    expired: {
      label: 'Истёк',
      class: 'bg-white/10 text-cream-100/60 border-white/10',
      icon: 'clock',
      iconColor: 'text-cream-100/50',
      bgColor: 'bg-white/5',
    },
    used: {
      label: 'Использован',
      class: 'bg-terracotta/20 text-terracotta border-terracotta/30',
      icon: 'ticket',
      iconColor: 'text-terracotta',
      bgColor: 'bg-terracotta/10',
    },
  }
  return configs[status]
}

// Копирование промокода
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('Промокод скопирован')
  } catch (error) {
    ElMessage.error('Не удалось скопировать')
  }
}

// Осталось дней
const daysLeft = (expiresAt: string) => {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}
</script>

<template>
  <div class="space-y-6">
    <!-- Статистика -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-cream-100/50">
          <i class="fa-solid fa-ticket text-cream-100/40"></i>
          Всего промокодов
        </div>
        <div class="mt-1 text-2xl font-bold text-cream-100">{{ stats.total }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-cream-100/50">
          <i class="fa-solid fa-check text-amber-400/70"></i>
          Активных
        </div>
        <div class="mt-1 text-2xl font-bold text-amber-300">{{ stats.active }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-cream-100/50">
          <i class="fa-solid fa-ticket text-terracotta/70"></i>
          Использовано
        </div>
        <div class="mt-1 text-2xl font-bold text-terracotta">{{ stats.used }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div class="flex items-center gap-2 text-sm text-cream-100/50">
          <i class="fa-solid fa-times text-cream-100/40"></i>
          Истекло
        </div>
        <div class="mt-1 text-2xl font-bold text-cream-100/60">{{ stats.expired }}</div>
      </div>
    </div>

    <!-- Панель управления -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <!-- Поиск -->
        <div class="relative max-w-md flex-1">
          <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/30"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по коду или описанию..."
            class="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-cream-100 placeholder:text-cream-100/40 outline-none transition-all focus:border-amber-400/50 focus:bg-white/10"
          />
        </div>

        <!-- Фильтры -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="status in [
              { value: 'all', label: 'Все' },
              { value: 'active', label: 'Активные' },
              { value: 'used', label: 'Использованные' },
              { value: 'expired', label: 'Истёкшие' },
            ]"
            :key="status.value"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
            :class="
              statusFilter === status.value
                ? 'bg-amber text-forest-900'
                : 'border border-white/10 text-cream-100/70 hover:bg-white/5'
            "
            @click="statusFilter = status.value as any"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Список промокодов -->
      <div class="space-y-3">
        <div
          v-for="promocode in filteredPromocodes"
          :key="promocode.id"
          class="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-white/10 hover:bg-white/5"
        >
          <!-- Фоновый градиент для активных (amber) -->
          <div
            v-if="promocode.status === 'active'"
            class="absolute inset-0 bg-gradient-to-br from-amber/5 to-transparent opacity-0 transition group-hover:opacity-100"
          ></div>

          <div class="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <!-- Основная информация -->
            <div class="flex items-start gap-4">
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                :class="getStatusConfig(promocode.status).bgColor"
              >
                <i
                  :class="getStatusConfig(promocode.status).iconColor"
                  class="fa-solid"
                  :style="{ fontSize: '1.5rem' }"
                >
                  <template v-if="promocode.status === 'active'">✓</template>
                  <template v-else-if="promocode.status === 'used'">🎫</template>
                  <template v-else>⏱</template>
                </i>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-1 flex-wrap">
                  <h4 class="font-mono text-lg font-bold text-cream-100">
                    {{ promocode.code }}
                  </h4>
                  <span
                    class="inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
                    :class="getStatusConfig(promocode.status).class"
                  >
                    {{ getStatusConfig(promocode.status).label }}
                  </span>
                </div>

                <p class="text-sm text-cream-100/60 mb-2">{{ promocode.description }}</p>

                <div class="flex flex-wrap items-center gap-3 text-xs text-cream-100/40">
                  <span>
                    <i class="fa-solid fa-calendar mr-1"></i>
                    Получен: {{ formatDate(promocode.createdAt) }}
                  </span>
                  <span class="text-cream-100/20">•</span>
                  <span>
                    <i class="fa-solid fa-hourglass-end mr-1"></i>
                    Действует до: {{ formatDate(promocode.expiresAt) }}
                  </span>
                  <span
                    v-if="promocode.status === 'active' && daysLeft(promocode.expiresAt) > 0"
                    class="text-amber-300"
                  >
                    • Осталось {{ daysLeft(promocode.expiresAt) }} дн.
                  </span>
                </div>
              </div>
            </div>

            <!-- Скидка и действия -->
            <div class="flex items-center gap-4 sm:flex-col sm:items-end">
              <div class="text-right">
                <div class="text-3xl font-bold text-amber">
                  {{ formatDiscount(promocode) }}
                </div>
                <div class="text-xs text-cream-100/50">
                  {{ promocode.type === 'percent' ? 'скидка' : 'выгода' }}
                </div>
              </div>

              <button
                v-if="promocode.status === 'active'"
                @click="copyCode(promocode.code)"
                class="rounded-lg border border-amber/30 bg-amber/10 px-4 py-2 text-sm font-medium text-amber transition hover:bg-amber/20"
              >
                <i class="fa-solid fa-copy mr-2"></i>
                Копировать
              </button>
            </div>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div
          v-if="filteredPromocodes.length === 0"
          class="py-12 text-center"
        >
          <i class="fa-solid fa-ticket text-5xl text-cream-100/20 mb-3"></i>
          <div class="text-cream-100/50">
            {{ searchQuery || statusFilter !== 'all' ? 'Ничего не найдено' : 'У вас пока нет промокодов' }}
          </div>
          <p class="mt-1 text-sm text-cream-100/30">
            {{ searchQuery || statusFilter !== 'all' ? 'Попробуйте изменить фильтры' : 'Подпишитесь на новости, чтобы получать промокоды' }}
          </p>
        </div>
      </div>

      <!-- Итого -->
      <div
        v-if="filteredPromocodes.length > 0"
        class="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-cream-100/50"
      >
        <span>Показано: {{ filteredPromocodes.length }} из {{ promocodes.length }}</span>
        <span>
          Активных: <strong class="text-amber">{{ stats.active }}</strong>
        </span>
      </div>
    </div>
  </div>
</template>