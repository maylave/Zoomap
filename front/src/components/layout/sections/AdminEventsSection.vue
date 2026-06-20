<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/30 to-forest-400/30 p-4 sm:p-6">
      <div class="mb-4 flex justify-between">
        <div class="text-cream-100/60">Всего событий: {{ events.length }}</div>
        <button @click="openCreateModal" class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime">
          + Добавить событие
        </button>
      </div>

      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-accent"></i>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2">
        <div v-for="event in events" :key="event.id" class="rounded-2xl border border-sage/15 bg-forest-400/40 p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">{{ event.category }}</span>
                <span class="text-xs text-cream-100/40">{{ event.day }} {{ event.month }}</span>
              </div>
              <h3 class="mt-2 font-semibold text-cream-100">{{ event.title }}</h3>
              <p class="mt-1 text-sm text-cream-100/60 line-clamp-2">{{ event.description }}</p>
              <div class="mt-2 text-sm text-cream-100/50">
                <span>{{ event.price }}</span> • <span>{{ event.location }}</span>
              </div>
            </div>
            <div class="flex gap-1">
              <button @click="openEditModal(event)" class="rounded-lg p-2 text-cream-100/60 hover:bg-lime/10 hover:text-lime">
                <i class="fa-solid fa-pen text-sm"></i>
              </button>
              <button @click="deleteEvent(event.id)" class="rounded-lg p-2 text-cream-100/60 hover:bg-terracotta/15 hover:text-terracotta">
                <i class="fa-solid fa-trash text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <Transition name="modal-backdrop">
      <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" @click="closeModal">
        <div @click.stop class="w-full max-w-md rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-6 shadow-2xl">
          <h3 class="mb-4 text-lg font-bold text-cream-100">{{ editingEvent ? 'Редактировать событие' : 'Новое событие' }}</h3>
          <div class="space-y-3">
            <input v-model="form.title" placeholder="Название" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.category" placeholder="Категория" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <textarea v-model="form.description" placeholder="Описание" rows="3" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100"></textarea>
            <input v-model="form.date" type="date" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <div class="grid grid-cols-2 gap-3">
              <input v-model="form.day" type="number" placeholder="День" class="rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
              <input v-model="form.month" placeholder="Месяц" class="rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            </div>
            <input v-model="form.price" placeholder="Цена" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.location" placeholder="Место проведения" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.buttonText" placeholder="Текст кнопки" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button @click="closeModal" class="rounded-full border border-sage/20 bg-forest-400/40 px-4 py-2 text-sm text-cream-100/80">Отмена</button>
            <button @click="saveEvent" class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime">
              {{ editingEvent ? '💾 Сохранить' : '✨ Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { eventsService, type EventItem } from '@/services/events.service'

const isLoading = ref(true)
const events = ref<EventItem[]>([])
const showModal = ref(false)
const editingEvent = ref<EventItem | null>(null)

const form = ref({
  title: '', category: '', description: '', date: '',
  day: '', month: '', price: '', location: '', buttonText: '',
})

const loadEvents = async () => {
  isLoading.value = true
  try {
    const response = await eventsService.getAll()
    events.value = response.events
  } catch (error) {
    ElMessage.error('Ошибка загрузки событий')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  editingEvent.value = null
  form.value = { title: '', category: '', description: '', date: '', day: '', month: '', price: '', location: '', buttonText: '' }
  showModal.value = true
}

const openEditModal = (event: EventItem) => {
  editingEvent.value = event
  form.value = {
    title: event.title, category: event.category, description: event.description,
    date: event.date ? event.date.split('T')[0] : '', day: event.day, month: event.month,
    price: event.price, location: event.location, buttonText: event.button,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingEvent.value = null
}

const saveEvent = async () => {
  try {
    const data = {
      title: form.value.title,
      category: form.value.category,
      description: form.value.description,
      date: form.value.date,
      day: Number(form.value.day),
      month: form.value.month,
      price: form.value.price,
      location: form.value.location,
      buttonText: form.value.buttonText,
    }

    if (editingEvent.value) {
      await eventsService.update(editingEvent.value.id, data)
      ElMessage.success('Событие обновлено')
    } else {
      await eventsService.create(data)
      ElMessage.success('Событие добавлено')
    }

    closeModal()
    await loadEvents()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  }
}

const deleteEvent = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить это событие?', 'Подтверждение', {
      confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', type: 'warning',
    })
    await eventsService.delete(id)
    ElMessage.success('Событие удалено')
    await loadEvents()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}

onMounted(() => loadEvents())
</script>

<style scoped>
.modal-backdrop-enter-active, .modal-backdrop-leave-active { transition: opacity 0.3s ease; }
.modal-backdrop-enter-from, .modal-backdrop-leave-to { opacity: 0; }
</style>