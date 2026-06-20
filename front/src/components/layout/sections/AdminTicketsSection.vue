<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/40 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Всего</div>
        <div class="mt-2 text-2xl font-bold text-cream-100">{{ stats.total }}</div>
      </div>
      <div class="rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Активных</div>
        <div class="mt-2 text-2xl font-bold text-lime">{{ stats.active }}</div>
      </div>
      <div class="rounded-2xl border border-terracotta/20 bg-gradient-to-br from-terracotta/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Неактивных</div>
        <div class="mt-2 text-2xl font-bold text-terracotta">{{ stats.inactive }}</div>
      </div>
      <div class="rounded-2xl border border-amber/20 bg-gradient-to-br from-amber/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Средняя цена</div>
        <div class="mt-2 text-2xl font-bold text-amber">{{ stats.avgPrice }} ₽</div>
      </div>
    </div>

    <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/30 to-forest-400/30 p-4 sm:p-6">
      <div class="mb-4 flex justify-end">
        <button @click="openCreateModal" class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime">
          + Добавить билет
        </button>
      </div>

      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-accent"></i>
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-sage/15">
        <table class="w-full">
          <thead>
            <tr class="border-b border-sage/20 bg-forest-400/40">
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Название</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Цена</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Возраст</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Лимит</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Статус</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase text-cream-100/60">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in tickets" :key="ticket.id" class="border-b border-sage/10 hover:bg-forest-300/30">
              <td class="px-4 py-3 font-medium text-cream-100">{{ ticket.name }}</td>
              <td class="px-4 py-3 text-lime font-bold">{{ ticket.price }} ₽</td>
              <td class="px-4 py-3 text-sm text-cream-100/60">{{ ticket.minAge || 0 }} - {{ ticket.maxAge || '∞' }}</td>
              <td class="px-4 py-3 text-sm text-cream-100/60">{{ ticket.maxQuantity || '∞' }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-1 text-xs" :class="ticket.isActive ? 'bg-lime/20 text-lime' : 'bg-terracotta/20 text-terracotta'">
                  {{ ticket.isActive ? 'Активен' : 'Неактивен' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button @click="openEditModal(ticket)" class="rounded-lg p-2 text-cream-100/60 hover:bg-lime/10 hover:text-lime">
                    <i class="fa-solid fa-pen text-sm"></i>
                  </button>
                  <button @click="deleteTicket(ticket.id)" class="rounded-lg p-2 text-cream-100/60 hover:bg-terracotta/15 hover:text-terracotta">
                    <i class="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модалка -->
    <Transition name="modal-backdrop">
      <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" @click="closeModal">
        <div @click.stop class="w-full max-w-md rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-6 shadow-2xl">
          <h3 class="mb-4 text-lg font-bold text-cream-100">{{ editingTicket ? 'Редактировать билет' : 'Новый билет' }}</h3>
          <div class="space-y-3">
            <input v-model="form.name" placeholder="Название" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <textarea v-model="form.description" placeholder="Описание" rows="2" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100"></textarea>
            <input v-model.number="form.price" type="number" placeholder="Цена (₽)" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <div class="grid grid-cols-2 gap-3">
              <input v-model.number="form.minAge" type="number" placeholder="Мин. возраст" class="rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
              <input v-model.number="form.maxAge" type="number" placeholder="Макс. возраст" class="rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            </div>
            <input v-model.number="form.maxQuantity" type="number" placeholder="Лимит в день" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <label class="flex items-center gap-2 text-cream-100">
              <input v-model="form.isActive" type="checkbox" class="h-4 w-4" />
              <span class="text-sm">Активен</span>
            </label>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button @click="closeModal" class="rounded-full border border-sage/20 bg-forest-400/40 px-4 py-2 text-sm text-cream-100/80">Отмена</button>
            <button @click="saveTicket" class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime">
              {{ editingTicket ? '💾 Сохранить' : '✨ Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ticketsService, type TicketType } from '@/services/tickets.service'

const isLoading = ref(true)
const tickets = ref<TicketType[]>([])
const showModal = ref(false)
const editingTicket = ref<TicketType | null>(null)

const form = ref({
  name: '', description: '', price: 0,
  minAge: null as number | null, maxAge: null as number | null,
  maxQuantity: null as number | null, isActive: true,
})

const stats = computed(() => ({
  total: tickets.value.length,
  active: tickets.value.filter(t => t.isActive).length,
  inactive: tickets.value.filter(t => !t.isActive).length,
  avgPrice: tickets.value.length > 0
    ? Math.round(tickets.value.reduce((sum, t) => sum + t.price, 0) / tickets.value.length)
    : 0,
}))

const loadTickets = async () => {
  isLoading.value = true
  try {
    tickets.value = await ticketsService.getAllTypes()
  } catch (error) {
    ElMessage.error('Ошибка загрузки билетов')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  editingTicket.value = null
  form.value = { name: '', description: '', price: 0, minAge: null, maxAge: null, maxQuantity: null, isActive: true }
  showModal.value = true
}

const openEditModal = (ticket: TicketType) => {
  editingTicket.value = ticket
  form.value = {
    name: ticket.name, description: ticket.description || '', price: ticket.price,
    minAge: ticket.minAge, maxAge: ticket.maxAge,
    maxQuantity: ticket.maxQuantity, isActive: ticket.isActive,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTicket.value = null
}

const saveTicket = async () => {
  try {
    const data = {
      name: form.value.name,
      description: form.value.description,
      price: form.value.price,
      minAge: form.value.minAge ?? undefined,
      maxAge: form.value.maxAge ?? undefined,
      maxQuantity: form.value.maxQuantity ?? undefined,
      isActive: form.value.isActive,
    }

    if (editingTicket.value) {
      await ticketsService.updateType(editingTicket.value.id, data)
      ElMessage.success('Билет обновлён')
    } else {
      await ticketsService.createType(data)
      ElMessage.success('Билет добавлен')
    }

    closeModal()
    await loadTickets()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  }
}

const deleteTicket = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить этот билет?', 'Подтверждение', {
      confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', type: 'warning',
    })
    await ticketsService.deleteType(id)
    ElMessage.success('Билет удалён')
    await loadTickets()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}

onMounted(() => loadTickets())
</script>

<style scoped>
.modal-backdrop-enter-active, .modal-backdrop-leave-active { transition: opacity 0.3s ease; }
.modal-backdrop-enter-from, .modal-backdrop-leave-to { opacity: 0; }
</style>