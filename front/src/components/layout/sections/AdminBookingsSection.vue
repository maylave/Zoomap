<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/40 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Всего</div>
        <div class="mt-2 text-2xl font-bold text-cream-100">{{ stats.total }}</div>
      </div>
      <div class="rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Оплачено</div>
        <div class="mt-2 text-2xl font-bold text-lime">{{ stats.paid }}</div>
      </div>
      <div class="rounded-2xl border border-amber/20 bg-gradient-to-br from-amber/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Ожидают</div>
        <div class="mt-2 text-2xl font-bold text-amber">{{ stats.pending }}</div>
      </div>
      <div class="rounded-2xl border border-terracotta/20 bg-gradient-to-br from-terracotta/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Выручка</div>
        <div class="mt-2 text-2xl font-bold text-terracotta">{{ stats.revenue }} ₽</div>
      </div>
    </div>

    <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/30 to-forest-400/30 p-4 sm:p-6">
      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-accent"></i>
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-sage/15">
        <table class="w-full">
          <thead>
            <tr class="border-b border-sage/20 bg-forest-400/40">
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">ID</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Пользователь</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Дата</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Время</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Сумма</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.id" class="border-b border-sage/10 hover:bg-forest-300/30">
              <td class="px-4 py-3 text-sm text-cream-100">#{{ booking.id }}</td>
              <td class="px-4 py-3 text-sm text-cream-100">{{ booking.user?.name || 'Гость' }}</td>
              <td class="px-4 py-3 text-sm text-cream-100/70">{{ booking.visitDate }}</td>
              <td class="px-4 py-3 text-sm text-cream-100/70">{{ booking.visitTime }}</td>
              <td class="px-4 py-3 text-sm font-bold text-lime">{{ booking.totalPrice }} ₽</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-1 text-xs" :class="getStatusClass(booking.status)">
                  {{ getStatusText(booking.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="bookings.length === 0" class="py-12 text-center">
          <div class="text-5xl">🎫</div>
          <div class="mt-2 text-cream-100/70">Бронирований пока нет</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ticketsService } from '@/services/tickets.service'

const isLoading = ref(true)
const bookings = ref<any[]>([])

const stats = computed(() => ({
  total: bookings.value.length,
  paid: bookings.value.filter(b => b.status === 'paid').length,
  pending: bookings.value.filter(b => b.status === 'pending').length,
  revenue: bookings.value.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalPrice, 0),
}))

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    paid: 'bg-lime/20 text-lime',
    pending: 'bg-amber/20 text-amber',
    cancelled: 'bg-terracotta/20 text-terracotta',
  }
  return classes[status] || 'bg-white/10 text-cream-100'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    paid: 'Оплачен', pending: 'Ожидает', cancelled: 'Отменён',
  }
  return texts[status] || status
}

const loadBookings = async () => {
  isLoading.value = true
  try {
    bookings.value = await ticketsService.getAllBookings()
  } catch (error) {
    ElMessage.error('Ошибка загрузки бронирований')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadBookings())
</script>