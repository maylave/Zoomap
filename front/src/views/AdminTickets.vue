<template>
  <div class="min-h-screen bg-forest-400 px-6 py-12 lg:px-16">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-cream-100">Управление билетами</h1>
          <p class="mt-2 text-cream-100/60">Создавайте и управляйте типами билетов</p>
        </div>
        <button
          @click="openNewTicketModal"
          class="rounded-full bg-accent px-6 py-3 font-bold text-forest-900 transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/30"
        >
          <i class="fa-solid fa-plus mr-2"></i>
          Добавить билет
        </button>
      </div>

      <!-- Stats -->
      <div class="mb-8 grid gap-6 md:grid-cols-4">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-cream-100/60 text-sm">Всего билетов</p>
              <p class="mt-2 text-3xl font-bold text-accent">{{ stats.total }}</p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <i class="fa-solid fa-ticket text-2xl text-accent"></i>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-cream-100/60 text-sm">Активных</p>
              <p class="mt-2 text-3xl font-bold text-success">{{ stats.active }}</p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <i class="fa-solid fa-check text-2xl text-success"></i>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-cream-100/60 text-sm">Неактивных</p>
              <p class="mt-2 text-3xl font-bold text-terracotta">{{ stats.inactive }}</p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta/20">
              <i class="fa-solid fa-xmark text-2xl text-terracotta"></i>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-cream-100/60 text-sm">Средняя цена</p>
              <p class="mt-2 text-3xl font-bold text-lime">{{ stats.avgPrice }} ₽</p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-lime/20">
              <i class="fa-solid fa-ruble-sign text-2xl text-lime"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-accent mb-4"></i>
        <p class="text-cream-100/60">Загрузка билетов...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="rounded-2xl border border-terracotta/30 bg-terracotta/10 p-8 text-center">
        <i class="fa-solid fa-triangle-exclamation text-4xl text-terracotta mb-3"></i>
        <p class="text-cream-100 mb-2">Ошибка загрузки</p>
        <p class="text-cream-100/60 text-sm mb-4">{{ loadError }}</p>
        <button
          @click="loadTickets"
          class="rounded-full bg-accent px-6 py-2 text-forest-900 font-medium hover:bg-accent/90 transition"
        >
          <i class="fa-solid fa-rotate-right mr-2"></i>
          Повторить
        </button>
      </div>

      <!-- Tickets Table -->
      <div v-else class="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-white/5 border-b border-white/10">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-cream-100">Название</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-cream-100">Описание</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-cream-100">Цена</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-cream-100">Возраст</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-cream-100">Лимит</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-cream-100">Статус</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-cream-100">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr
                v-for="ticket in tickets"
                :key="ticket.id"
                class="hover:bg-white/5 transition-colors"
                :class="{ 'opacity-50': !ticket.isActive }"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                      <i class="fa-solid fa-ticket text-accent"></i>
                    </div>
                    <div>
                      <p class="font-semibold text-cream-100">{{ ticket.name }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="text-cream-100/60 text-sm line-clamp-2 max-w-xs">
                    {{ ticket.description || '—' }}
                  </p>
                </td>
                <td class="px-6 py-4">
                  <span class="text-lg font-bold text-lime">{{ ticket.price }} ₽</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-cream-100/60 text-sm">
                    {{ ticket.minAge || '0' }} - {{ ticket.maxAge || '∞' }} лет
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-cream-100/60 text-sm">
                    {{ ticket.maxQuantity || '∞' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    :class="ticket.isActive ? 'bg-success/20 text-success' : 'bg-terracotta/20 text-terracotta'"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :class="ticket.isActive ? 'bg-success' : 'bg-terracotta'"></span>
                    {{ ticket.isActive ? 'Активен' : 'Неактивен' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="toggleActive(ticket)"
                      class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-cream-100/60 hover:bg-accent/20 hover:text-accent transition-all"
                      :title="ticket.isActive ? 'Деактивировать' : 'Активировать'"
                    >
                      <i class="fa-solid" :class="ticket.isActive ? 'fa-toggle-on' : 'fa-toggle-off'"></i>
                    </button>
                    <button
                      @click="openEditTicketModal(ticket)"
                      class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-cream-100/60 hover:bg-accent/20 hover:text-accent transition-all"
                      title="Редактировать"
                    >
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button
                      @click="deleteTicket(ticket.id)"
                      class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-cream-100/60 hover:bg-terracotta/20 hover:text-terracotta transition-all"
                      title="Удалить"
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="tickets.length === 0" class="py-20 text-center">
            <i class="fa-solid fa-ticket text-6xl text-cream-100/20 mb-4"></i>
            <p class="text-cream-100/60 text-lg">Билеты пока не добавлены</p>
            <button
              @click="openNewTicketModal"
              class="mt-4 rounded-full bg-accent px-6 py-2 text-forest-900 font-medium hover:bg-accent/90 transition"
            >
              <i class="fa-solid fa-plus mr-2"></i>
              Добавить первый билет
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <EditModal
      :visible="isEditModalOpen"
      :title="editModalTitle"
      :subtitle="editModalSubtitle"
      :fields="editFields"
      @close="closeEditModal"
      @save="handleEditSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EditModal from '@/components/overlay/EditModal.vue'
import { ticketsService, type TicketType } from '@/services/tickets.service'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// ==================== СОСТОЯНИЕ ====================

const isLoading = ref(true)
const loadError = ref('')
const tickets = ref<TicketType[]>([])
const isEditModalOpen = ref(false)
const editModalTitle = ref('Редактирование билета')
const editModalSubtitle = ref('Измените данные билета')
const editingTicket = ref<TicketType | null>(null)
const isNewTicket = ref(false)

// ==================== СТАТИСТИКА ====================

const stats = computed(() => {
  const total = tickets.value.length
  const active = tickets.value.filter(t => t.isActive).length
  const inactive = total - active
  const avgPrice = total > 0
    ? Math.round(tickets.value.reduce((sum, t) => sum + t.price, 0) / total)
    : 0

  return { total, active, inactive, avgPrice }
})

// ==================== ПОЛЯ РЕДАКТИРОВАНИЯ ====================

const editFields = computed(() => {
  const ticket = editingTicket.value
  
  return [
    {
      key: 'name',
      label: 'Название билета *',
      value: ticket?.name || '',
      placeholder: 'Например: Взрослый',
      required: true,
      icon: 'fa-solid fa-ticket',
      type: 'text' as const,
    },
    {
      key: 'description',
      label: 'Описание',
      value: ticket?.description || '',
      placeholder: 'Краткое описание билета',
      rows: 3,
      icon: 'fa-solid fa-align-left',
      type: 'textarea' as const,
    },
    {
      key: 'price',
      label: 'Цена (₽) *',
      value: ticket?.price || 0,
      placeholder: '500',
      required: true,
      icon: 'fa-solid fa-ruble-sign',
      type: 'number' as const,
    },
    {
      key: 'minAge',
      label: 'Минимальный возраст',
      value: ticket?.minAge ?? '',
      placeholder: '0 (оставьте пустым если нет ограничений)',
      hint: 'Минимальный возраст для покупки билета',
      icon: 'fa-solid fa-user',
      type: 'number' as const,
    },
    {
      key: 'maxAge',
      label: 'Максимальный возраст',
      value: ticket?.maxAge ?? '',
      placeholder: '∞ (оставьте пустым если нет ограничений)',
      hint: 'Максимальный возраст для покупки билета',
      icon: 'fa-solid fa-user',
      type: 'number' as const,
    },
    {
      key: 'maxQuantity',
      label: 'Максимальное количество в день',
      value: ticket?.maxQuantity ?? '',
      placeholder: '100 (оставьте пустым если безлимитно)',
      hint: 'Максимальное количество билетов, которое можно продать за день',
      icon: 'fa-solid fa-hashtag',
      type: 'number' as const,
    },
    {
      key: 'isActive',
      label: 'Активен',
      value: ticket?.isActive ?? true,
      hint: 'Активные билеты доступны для покупки на сайте',
      icon: 'fa-solid fa-toggle-on',
      type: 'checkbox' as const,
    },
  ]
})

// ==================== ЗАГРУЗКА ДАННЫХ ====================

const loadTickets = async () => {
  isLoading.value = true
  loadError.value = ''
  
  try {
    tickets.value = await ticketsService.getAllTypes()
  } catch (error: any) {
    console.error('Error loading tickets:', error)
    loadError.value = error.response?.data?.error || 'Не удалось загрузить билеты'
    ElMessage.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

// ==================== CRUD ОПЕРАЦИИ ====================

const openNewTicketModal = () => {
  editingTicket.value = null
  isNewTicket.value = true
  editModalTitle.value = 'Добавить тип билета'
  editModalSubtitle.value = 'Заполните данные нового билета'
  isEditModalOpen.value = true
}

const openEditTicketModal = (ticket: TicketType) => {
  editingTicket.value = ticket
  isNewTicket.value = false
  editModalTitle.value = 'Редактирование билета'
  editModalSubtitle.value = `Редактирование: ${ticket.name}`
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  editingTicket.value = null
  isNewTicket.value = false
}

const handleEditSave = async (values: Record<string, any>) => {
  try {
    const data = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      minAge: values.minAge !== '' ? Number(values.minAge) : null,
      maxAge: values.maxAge !== '' ? Number(values.maxAge) : null,
      maxQuantity: values.maxQuantity !== '' ? Number(values.maxQuantity) : null,
      isActive: values.isActive ?? true,
    }

    if (isNewTicket.value) {
      await ticketsService.createType(data)
      ElMessage.success(`Билет "${values.name}" добавлен`)
    } else if (editingTicket.value) {
      await ticketsService.updateType(editingTicket.value.id, data)
      ElMessage.success(`Билет "${values.name}" обновлён`)
    }

    await loadTickets()
    closeEditModal()
  } catch (error: any) {
    console.error('Save error:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  }
}

const toggleActive = async (ticket: TicketType) => {
  try {
    await ticketsService.updateType(ticket.id, {
      isActive: !ticket.isActive,
    })
    
    ElMessage.success(`Билет "${ticket.name}" ${!ticket.isActive ? 'активирован' : 'деактивирован'}`)
    await loadTickets()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Ошибка обновления')
  }
}

const deleteTicket = async (id: number) => {
  const ticket = tickets.value.find(t => t.id === id)
  if (!ticket) return
  
  try {
    await ElMessageBox.confirm(
      `Удалить тип билета "${ticket.name}"? Это действие нельзя отменить.`,
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
        confirmButtonClass: 'bg-terracotta hover:bg-terracotta/90',
      }
    )
    
    await ticketsService.deleteType(id)
    ElMessage.success(`Билет "${ticket.name}" удалён`)
    await loadTickets()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || 'Ошибка удаления')
    }
  }
}

// ==================== LIFECYCLE ====================

onMounted(() => {
  // Проверка прав админа
  if (!authStore.isAdmin) {
    ElMessage.error('Доступ запрещён')
    router.push('/')
    return
  }
  
  loadTickets()
})
</script>

<style scoped>
/* Стили для скроллбара таблицы */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(168, 201, 107, 0.3);
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 201, 107, 0.5);
}
</style>