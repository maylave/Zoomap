<template>
  <section id="events" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-14">
        <span
          class="border-accent/20 bg-accent/10 text-accent inline-flex rounded-full border px-4 py-2 text-sm font-medium"
        >
          {{ sectionBadge }}
        </span>

        <h2 class="text-cream-100 mt-6 text-4xl font-bold md:text-5xl">
          {{ sectionTitlePart1 }}
          <span class="text-accent italic"> {{ sectionTitlePart2 }} </span>
        </h2>
      </div>

      <!-- Warning Block (только для админа) -->
      <div
        v-if="authStore.isAdmin && !isDeleteMode"
        class="group/warning mb-10 flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-4 backdrop-blur-sm transition-all hover:border-warning/50 hover:bg-warning/15"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20">
            <i class="fa-solid fa-triangle-exclamation text-warning"></i>
          </div>
          <div>
            <p class="text-cream-100 text-sm font-medium">
              {{ warningTitle }}
            </p>
            <p class="text-cream-100/60 text-xs mt-0.5">
              {{ warningDescription }}
            </p>
          </div>
        </div>

        <button
          v-if="authStore.isAdmin"
          class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-2 rounded-lg hover:bg-white/5"
          title="Редактировать предупреждение"
          @click="openWarningEditModal"
        >
          <i class="fa-solid fa-pen text-sm"></i>
        </button>
      </div>

      <!-- Панель удаления -->
      <div
        v-if="isDeleteMode && selectedEvents.length > 0"
        class="mb-10 flex items-center justify-between rounded-2xl border border-terracotta/30 bg-terracotta/10 p-4 backdrop-blur-sm animate-fade-in"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/20">
            <i class="fa-solid fa-trash text-terracotta"></i>
          </div>
          <div>
            <p class="text-cream-100 text-sm font-medium">
              Выбрано событий: {{ selectedEvents.length }}
            </p>
            <p class="text-cream-100/60 text-xs mt-0.5">
              Нажмите "Удалить" для подтверждения
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="px-4 py-2 rounded-xl border border-white/10 text-cream-100/60 hover:text-cream-100 hover:bg-white/5 transition-all duration-smooth"
            @click="cancelDeleteMode"
          >
            Отмена
          </button>
          <button
            class="px-6 py-2 rounded-xl bg-terracotta text-cream-100 font-medium hover:bg-terracotta/90 hover:shadow-lg hover:shadow-terracotta/30 transition-all duration-smooth"
            @click="confirmDelete"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting">Удаление...</span>
            <span v-else>Удалить</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-accent mb-4"></i>
        <p class="text-cream-100/60">Загрузка событий...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="rounded-2xl border border-terracotta/30 bg-terracotta/10 p-8 text-center">
        <i class="fa-solid fa-triangle-exclamation text-4xl text-terracotta mb-3"></i>
        <p class="text-cream-100 mb-2">Ошибка загрузки событий</p>
        <p class="text-cream-100/60 text-sm mb-4">{{ loadError }}</p>
        <button
          @click="loadEvents"
          class="rounded-full bg-accent px-6 py-2 text-forest-900 font-medium hover:bg-accent/90 transition"
        >
          <i class="fa-solid fa-rotate-right mr-2"></i>
          Повторить
        </button>
      </div>

      <!-- Cards -->
      <div v-else class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="event in events"
          :key="event.id"
          class="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20"
          :class="[
            isDeleteMode ? 'cursor-pointer' : 'cursor-pointer hover:border-accent/30',
            { 'ring-2 ring-terracotta ring-offset-2 ring-offset-forest-400': selectedEvents.includes(event.id) }
          ]"
          @click="isDeleteMode ? toggleSelection(event.id) : openOverlay(event)"
        >
          <!-- Чекбокс для удаления -->
          <div
            v-if="isDeleteMode"
            class="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl border-2 bg-black/20 backdrop-blur-md transition-all duration-200"
            :class="selectedEvents.includes(event.id) ? 'border-terracotta bg-terracotta/20' : 'border-white/30 hover:border-white/60'"
          >
            <i
              v-if="selectedEvents.includes(event.id)"
              class="fa-solid fa-check text-terracotta text-sm"
            ></i>
          </div>

          <!-- Кнопка редактирования -->
          <button
            v-if="authStore.isAdmin && !isDeleteMode"
            class="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-cream-100/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent/20 hover:text-accent hover:border-accent/40 hover:scale-110"
            title="Редактировать событие"
            @click.stop="openEventEditModal(event)"
          >
            <i class="fa-solid fa-pen-to-square text-sm"></i>
          </button>

          <!-- Контент -->
          <div class="flex items-center justify-between p-6" :class="{ 'pl-16': isDeleteMode, 'pr-16': authStore.isAdmin && !isDeleteMode }">
            <div
              class="flex h-20 w-20 flex-col items-center justify-center rounded-2xl text-white"
              :class="event.dateBg"
            >
              <span class="text-3xl leading-none font-bold">{{ event.day }}</span>
              <span class="mt-1 text-xs tracking-wider uppercase">{{ event.month }}</span>
            </div>

            <div
              class="text-cream-100 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5"
            >
              <AppIcon :name="event.icon" class="size-8" />
            </div>
          </div>

          <div class="px-6 pb-6">
            <span class="text-sm font-medium" :class="event.categoryColor">
              {{ event.category }}
            </span>

            <h3 class="text-cream-100 mt-3 text-xl font-bold">
              {{ event.title }}
            </h3>

            <p class="text-cream-100/60 mt-4 line-clamp-4 text-sm leading-relaxed">
              {{ event.description }}
            </p>

            <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <div>
                <div class="text-accent text-lg font-bold">{{ event.price }}</div>
                <div class="text-cream-100/40 text-xs">{{ event.priceLabel }}</div>
              </div>

              <button class="btn btn-accent btn-sm rounded-full">
                {{ event.button }}
              </button>
            </div>
          </div>
        </article>

        <!-- Add New Event Card -->
        <article
          v-if="authStore.isAdmin && !isDeleteMode"
          class="group/add flex min-h-[380px] cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-accent/50 hover:bg-accent/5 hover:shadow-2xl hover:shadow-black/20"
          @click="openNewEventModal"
        >
          <div
            class="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 transition-all duration-300 group-hover/add:bg-accent/20 group-hover/add:scale-110"
          >
            <i
              class="fa-solid fa-plus text-3xl text-cream-100/40 transition-colors duration-300 group-hover/add:text-accent"
            ></i>
          </div>
          <div class="text-center">
            <p class="text-cream-100 text-base font-medium">Добавить событие</p>
            <p class="text-cream-100/40 text-xs mt-1">Создать новое мероприятие</p>
          </div>
        </article>

        <!-- Пустое состояние -->
        <div
          v-if="events.length === 0 && !isLoading"
          class="col-span-full py-20 text-center"
        >
          <i class="fa-solid fa-calendar text-6xl text-cream-100/20 mb-4"></i>
          <p class="text-cream-100/60 text-lg">Событий пока нет</p>
          <p v-if="authStore.isAdmin" class="text-cream-100/40 text-sm mt-2">
            Нажмите на кнопку "Добавить событие", чтобы создать первое
          </p>
        </div>
      </div>
    </div>

    <!-- Overlay Component -->
    <EventsOverlay
      :visible="!!selectedEvent"
      :event-data="selectedEvent"
      @close="selectedEvent = null"
    />

    <!-- Edit Modal для секции -->
    <EditModal
      :visible="isSectionEditModalOpen"
      :title="sectionEditModalTitle"
      :subtitle="sectionEditModalSubtitle"
      :fields="sectionEditFields"
      @close="closeSectionEditModal"
      @save="handleSectionEditSave"
    />

    <!-- Edit Modal для события -->
    <EditModal
      :visible="isEventEditModalOpen"
      :title="eventEditModalTitle"
      :subtitle="eventEditModalSubtitle"
      :fields="eventEditFields"
      @close="closeEventEditModal"
      @save="handleEventEditSave"
    />
  </section>
</template>

<script setup lang="ts">
import EventsOverlay from '@/components/overlay/EventsOverlay.vue'
import EditModal from '@/components/overlay/EditModal.vue'
import AppIcon from '@/components/ui/BaseIcon.vue'
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { eventsService } from '@/services/events.service'
import type { EventItem } from '@/services/events.service'

const authStore = useAuthStore()

// ==================== СОСТОЯНИЕ ====================

const isLoading = ref(true)
const loadError = ref('')
const isDeleting = ref(false)
const isDeleteMode = ref(false)
const selectedEvents = ref<number[]>([])
const selectedEvent = ref<EventItem | null>(null)
const isSaving = ref(false)

// Редактируемые тексты секции (локально)
const sectionBadge = ref('Что происходит')
const sectionTitlePart1 = ref('Ближайшие')
const sectionTitlePart2 = ref('события')
const warningTitle = ref('Важное предупреждение для посетителей')
const warningDescription = ref('20 июня зоопарк закрыт на санитарный день')

// События
const events = ref<EventItem[]>([])

// Модалки
const isSectionEditModalOpen = ref(false)
const sectionEditModalTitle = ref('Редактирование секции')
const sectionEditModalSubtitle = ref('Измените заголовок и предупреждение')

const isEventEditModalOpen = ref(false)
const eventEditModalTitle = ref('Редактирование события')
const eventEditModalSubtitle = ref('Измените детали мероприятия')
const editingEvent = ref<EventItem | null>(null)
const isNewEvent = ref(false)

// ==================== ЗАГРУЗКА ДАННЫХ ====================

const loadEvents = async () => {
  isLoading.value = true
  loadError.value = ''
  
  try {
    const response = await eventsService.getAll({ limit: 50 })
    events.value = response.events
  } catch (error: any) {
    console.error('Error loading events:', error)
    loadError.value = error.response?.data?.error || 'Не удалось загрузить события'
    ElMessage.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

// ==================== ПОЛЯ ДЛЯ РЕДАКТИРОВАНИЯ ====================

const sectionEditFields = computed(() => [
  {
    key: 'sectionBadge',
    label: 'Бейдж секции',
    type: 'text' as const,
    value: sectionBadge.value,
    placeholder: 'Например: Что происходит',
    hint: 'Маленький текст над заголовком',
    icon: 'fa-solid fa-tag',
  },
  {
    key: 'sectionTitlePart1',
    label: 'Заголовок (часть 1)',
    type: 'text' as const,
    value: sectionTitlePart1.value,
    placeholder: 'Первая часть заголовка',
    required: true,
    icon: 'fa-solid fa-heading',
  },
  {
    key: 'sectionTitlePart2',
    label: 'Заголовок (часть 2 - акцентная)',
    type: 'text' as const,
    value: sectionTitlePart2.value,
    placeholder: 'Вторая часть заголовка (выделена цветом)',
    required: true,
    icon: 'fa-solid fa-heading',
  },
  {
    key: 'warningTitle',
    label: 'Заголовок предупреждения',
    type: 'text' as const,
    value: warningTitle.value,
    placeholder: 'Заголовок предупреждения',
    icon: 'fa-solid fa-triangle-exclamation',
  },
  {
    key: 'warningDescription',
    label: 'Описание предупреждения',
    type: 'text' as const,
    value: warningDescription.value,
    placeholder: 'Текст предупреждения',
    icon: 'fa-solid fa-align-left',
  },
])

const eventEditFields = computed(() => {
  return [
    {
      key: 'title',
      label: 'Название события',
      type: 'text' as const,
      value: editingEvent.value?.title || '',
      placeholder: 'Название мероприятия',
      required: true,
      icon: 'fa-solid fa-heading',
    },
    {
      key: 'category',
      label: 'Категория',
      type: 'text' as const,
      value: editingEvent.value?.category || '',
      placeholder: 'Например: Кормление, Ночной тур',
      required: true,
      icon: 'fa-solid fa-tag',
    },
    {
      key: 'description',
      label: 'Описание',
      type: 'textarea' as const,
      value: editingEvent.value?.description || '',
      placeholder: 'Подробное описание события',
      required: true,
      rows: 4,
      icon: 'fa-solid fa-align-left',
    },
    {
      key: 'day',
      label: 'День',
      type: 'text' as const,
      value: editingEvent.value?.day || '',
      placeholder: 'Например: 15',
      required: true,
      icon: 'fa-solid fa-calendar-day',
    },
    {
      key: 'month',
      label: 'Месяц',
      type: 'text' as const,
      value: editingEvent.value?.month || '',
      placeholder: 'Например: Июн',
      required: true,
      icon: 'fa-solid fa-calendar',
    },
    {
      key: 'date',
      label: 'Дата события',
      type: 'date' as const,
      value: editingEvent.value?.date ? new Date(editingEvent.value.date).toISOString().split('T')[0] : '',
      placeholder: 'Выберите дату',
      required: true,
      icon: 'fa-solid fa-calendar',
    },
    {
      key: 'icon',
      label: 'Иконка',
      type: 'text' as const,
      value: editingEvent.value?.icon || 'calendar',
      placeholder: 'Например: lion, moon, elephant',
      hint: 'Название иконки',
      icon: 'fa-solid fa-image',
    },
    {
      key: 'price',
      label: 'Цена',
      type: 'text' as const,
      value: editingEvent.value?.price || '',
      placeholder: 'Например: 590 ₽ или Бесплатно',
      required: true,
      icon: 'fa-solid fa-ruble-sign',
    },
    {
      key: 'priceLabel',
      label: 'Подпись цены',
      type: 'text' as const,
      value: editingEvent.value?.priceLabel || '',
      placeholder: 'Например: за человека',
      icon: 'fa-solid fa-info-circle',
    },
    {
      key: 'buttonText',
      label: 'Текст кнопки',
      type: 'text' as const,
      value: editingEvent.value?.button || '',
      placeholder: 'Например: Записаться',
      required: true,
      icon: 'fa-solid fa-arrow-right',
    },
    {
      key: 'location',
      label: 'Место проведения',
      type: 'text' as const,
      value: editingEvent.value?.location || '',
      placeholder: 'Например: Зоопарк, главный вход',
      required: true,
      icon: 'fa-solid fa-location-dot',
    },
  ]
})

// ==================== LIGHTBOX / OVERLAY ====================

const openOverlay = (event: EventItem) => {
  selectedEvent.value = event
}

// ==================== РЕЖИМ УДАЛЕНИЯ ====================

const enableDeleteMode = () => {
  isDeleteMode.value = true
  selectedEvents.value = []
}

const cancelDeleteMode = () => {
  isDeleteMode.value = false
  selectedEvents.value = []
}

const toggleSelection = (id: number) => {
  const idx = selectedEvents.value.indexOf(id)
  if (idx > -1) {
    selectedEvents.value.splice(idx, 1)
  } else {
    selectedEvents.value.push(id)
  }
}

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `Удалить ${selectedEvents.value.length} событий? Это действие нельзя отменить.`,
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
        confirmButtonClass: 'bg-red-500 hover:bg-red-600',
      }
    )
    
    isDeleting.value = true
    
    await Promise.all(
      selectedEvents.value.map(id => eventsService.delete(id))
    )
    
    ElMessage.success(`Удалено событий: ${selectedEvents.value.length}`)
    
    await loadEvents()
    
    selectedEvents.value = []
    isDeleteMode.value = false
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete error:', error)
      ElMessage.error(error.response?.data?.error || 'Ошибка удаления')
    }
  } finally {
    isDeleting.value = false
  }
}

// ==================== EDIT MODAL: СЕКЦИЯ ====================

const openWarningEditModal = () => {
  sectionEditModalTitle.value = 'Редактирование секции'
  sectionEditModalSubtitle.value = 'Измените заголовок и предупреждение'
  isSectionEditModalOpen.value = true
}

const closeSectionEditModal = () => {
  isSectionEditModalOpen.value = false
}

const handleSectionEditSave = (values: Record<string, any>) => {
  if (values.sectionBadge !== undefined) sectionBadge.value = values.sectionBadge
  if (values.sectionTitlePart1 !== undefined) sectionTitlePart1.value = values.sectionTitlePart1
  if (values.sectionTitlePart2 !== undefined) sectionTitlePart2.value = values.sectionTitlePart2
  if (values.warningTitle !== undefined) warningTitle.value = values.warningTitle
  if (values.warningDescription !== undefined) warningDescription.value = values.warningDescription
  
  ElMessage.success('Секция обновлена')
}

// ==================== EDIT MODAL: СОБЫТИЕ ====================

const openEventEditModal = (event: EventItem) => {
  editingEvent.value = event
  isNewEvent.value = false
  eventEditModalTitle.value = 'Редактирование события'
  eventEditModalSubtitle.value = `Редактирование: ${event.title}`
  isEventEditModalOpen.value = true
}

const openNewEventModal = () => {
  editingEvent.value = null
  isNewEvent.value = true
  eventEditModalTitle.value = 'Новое событие'
  eventEditModalSubtitle.value = 'Заполните детали нового мероприятия'
  isEventEditModalOpen.value = true
}

const closeEventEditModal = () => {
  isEventEditModalOpen.value = false
  editingEvent.value = null
  isNewEvent.value = false
}

const handleEventEditSave = async (values: Record<string, any>) => {
  if (isSaving.value) return
  isSaving.value = true
  
  try {
    const data = {
      title: values.title,
      description: values.description,
      date: values.date,
      day: Number(values.day),
      month: values.month,
      icon: values.icon,
      category: values.category,
      price: values.price,
      priceLabel: values.priceLabel,
      buttonText: values.buttonText,
      location: values.location,
    }
    
    if (isNewEvent.value) {
      await eventsService.create(data as any)
      ElMessage.success(`Событие "${values.title}" добавлено`)
    } else if (editingEvent.value) {
      await eventsService.update(editingEvent.value.id, data)
      ElMessage.success(`Событие "${values.title}" обновлено`)
    }
    
    await loadEvents()
    closeEventEditModal()
  } catch (error: any) {
    console.error('Save error:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  } finally {
    isSaving.value = false
  }
}

// ==================== EXPOSE ====================

defineExpose({
  isDeleteMode,
  enableDeleteMode,
  cancelDeleteMode,
})

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>