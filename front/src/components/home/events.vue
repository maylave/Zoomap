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
        v-if="isAdmin && !isDeleteMode"
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
          v-if="isAdmin"
          class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-2 rounded-lg hover:bg-white/5"
          title="Редактировать предупреждение"
          @click="openWarningEditModal"
        >
          <i class="fa-solid fa-pen text-sm"></i>
        </button>
      </div>

      <!-- Панель удаления (когда выбраны карточки) -->
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
          >
            Удалить
          </button>
        </div>
      </div>

      <!-- Cards -->
      <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="(event, index) in events"
          :key="event.title"
          class="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20"
          :class="[
            isDeleteMode ? 'cursor-pointer' : 'cursor-pointer hover:border-accent/30',
            { 'ring-2 ring-terracotta ring-offset-2 ring-offset-forest-400': selectedEvents.includes(index) }
          ]"
          @click="isDeleteMode ? toggleSelection(index) : openOverlay(index)"
        >
          <!-- Чекбокс для удаления -->
          <div
            v-if="isDeleteMode"
            class="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl border-2 bg-black/20 backdrop-blur-md transition-all duration-200"
            :class="selectedEvents.includes(index) ? 'border-terracotta bg-terracotta/20' : 'border-white/30 hover:border-white/60'"
          >
            <i
              v-if="selectedEvents.includes(index)"
              class="fa-solid fa-check text-terracotta text-sm"
            ></i>
          </div>

          <!-- Кнопка редактирования (только для админа и не в режиме удаления) -->
          <button
            v-if="isAdmin && !isDeleteMode"
            class="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-cream-100/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent/20 hover:text-accent hover:border-accent/40 hover:scale-110"
            title="Редактировать событие"
            @click.stop="openEventEditModal(index)"
          >
            <i class="fa-solid fa-pen-to-square text-sm"></i>
          </button>

          <!-- Обычный контент -->
          <div class="flex items-center justify-between p-6" :class="{ 'pl-16': isDeleteMode, 'pr-16': isAdmin && !isDeleteMode }">
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

          <!-- Content -->
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
          v-if="isAdmin && !isDeleteMode"
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
      </div>
    </div>

    <!-- Overlay Component -->
    <EventsOverlay
      :visible="!!selectedEvent"
      :event-data="selectedEvent"
      @close="selectedEvent = null"
    />

    <!-- Universal Edit Modal для секции -->
    <EditModal
      :visible="isSectionEditModalOpen"
      :title="sectionEditModalTitle"
      :subtitle="sectionEditModalSubtitle"
      :fields="sectionEditFields"
      @close="closeSectionEditModal"
      @save="handleSectionEditSave"
    />

    <!-- Universal Edit Modal для события -->
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
import { ref, computed } from 'vue'
import type { EventItem } from '@/types/events.types'

// Флаг администратора
const isAdmin = ref(true)

// Режим удаления
const isDeleteMode = ref(false)
const selectedEvents = ref<number[]>([])

const selectedEvent = ref<EventItem | null>(null)

// Редактируемые тексты секции
const sectionBadge = ref('Что происходит')
const sectionTitlePart1 = ref('Ближайшие')
const sectionTitlePart2 = ref('события')
const warningTitle = ref('Важное предупреждение для посетителей')
const warningDescription = ref('20 июня зоопарк закрыт на санитарный день')

// Состояние для модалки редактирования секции
const isSectionEditModalOpen = ref(false)
const sectionEditModalTitle = ref('Редактирование секции')
const sectionEditModalSubtitle = ref('Измените заголовок и предупреждение')

// Состояние для модалки редактирования события
const isEventEditModalOpen = ref(false)
const eventEditModalTitle = ref('Редактирование события')
const eventEditModalSubtitle = ref('Измените детали мероприятия')
const editingEventIndex = ref<number | null>(null)
const isNewEvent = ref(false)

// Поля для редактирования секции
const sectionEditFields = computed(() => [
  {
    key: 'sectionBadge',
    label: 'Бейдж секции',
    value: sectionBadge.value,
    placeholder: 'Например: Что происходит',
    hint: 'Маленький текст над заголовком',
    icon: 'fa-solid fa-tag',
    type: 'text' as const,
  },
  {
    key: 'sectionTitlePart1',
    label: 'Заголовок (часть 1)',
    value: sectionTitlePart1.value,
    placeholder: 'Первая часть заголовка',
    required: true,
    icon: 'fa-solid fa-heading',
    type: 'text' as const,
  },
  {
    key: 'sectionTitlePart2',
    label: 'Заголовок (часть 2 - акцентная)',
    value: sectionTitlePart2.value,
    placeholder: 'Вторая часть заголовка (выделена цветом)',
    required: true,
    icon: 'fa-solid fa-heading',
    type: 'text' as const,
  },
  {
    key: 'warningTitle',
    label: 'Заголовок предупреждения',
    value: warningTitle.value,
    placeholder: 'Заголовок предупреждения',
    icon: 'fa-solid fa-triangle-exclamation',
    type: 'text' as const,
  },
  {
    key: 'warningDescription',
    label: 'Описание предупреждения',
    value: warningDescription.value,
    placeholder: 'Текст предупреждения',
    icon: 'fa-solid fa-align-left',
    type: 'text' as const,
  },
])

// Поля для редактирования события
const eventEditFields = computed(() => {
  const event = editingEventIndex.value !== null ? events[editingEventIndex.value] : null
  
  return [
    {
      key: 'day',
      label: 'День',
      value: event?.day || '',
      placeholder: 'Например: 15',
      required: true,
      icon: 'fa-solid fa-calendar-day',
      type: 'text' as const,
    },
    {
      key: 'month',
      label: 'Месяц',
      value: event?.month || '',
      placeholder: 'Например: Июн',
      required: true,
      icon: 'fa-solid fa-calendar',
      type: 'text' as const,
    },
    {
      key: 'icon',
      label: 'Иконка',
      value: event?.icon || 'lion',
      placeholder: 'Например: lion, moon, elephant',
      hint: 'Доступные иконки: lion, moon, elephant',
      icon: 'fa-solid fa-image',
      type: 'text' as const,
    },
    {
      key: 'category',
      label: 'Категория',
      value: event?.category || '',
      placeholder: 'Например: Кормление',
      required: true,
      icon: 'fa-solid fa-tag',
      type: 'text' as const,
    },
    {
      key: 'title',
      label: 'Название события',
      value: event?.title || '',
      placeholder: 'Название мероприятия',
      required: true,
      icon: 'fa-solid fa-heading',
      type: 'text' as const,
    },
    {
      key: 'description',
      label: 'Описание',
      value: event?.description || '',
      placeholder: 'Подробное описание события',
      required: true,
      rows: 4,
      icon: 'fa-solid fa-align-left',
      type: 'textarea' as const,
    },
    {
      key: 'price',
      label: 'Цена',
      value: event?.price || '',
      placeholder: 'Например: 590 ₽ или Бесплатно',
      required: true,
      icon: 'fa-solid fa-ruble-sign',
      type: 'text' as const,
    },
    {
      key: 'priceLabel',
      label: 'Подпись цены',
      value: event?.priceLabel || '',
      placeholder: 'Например: за человека',
      icon: 'fa-solid fa-info-circle',
      type: 'text' as const,
    },
    {
      key: 'button',
      label: 'Текст кнопки',
      value: event?.button || '',
      placeholder: 'Например: Записаться',
      required: true,
      icon: 'fa-solid fa-arrow-right',
      type: 'text' as const,
    },
  ]
})

const openOverlay = (index: number) => {
  selectedEvent.value = events[index] ?? null
}

// Переключение режима удаления
const enableDeleteMode = () => {
  isDeleteMode.value = true
  selectedEvents.value = []
}

const cancelDeleteMode = () => {
  isDeleteMode.value = false
  selectedEvents.value = []
}

// Переключение выбора карточки
const toggleSelection = (index: number) => {
  const idx = selectedEvents.value.indexOf(index)
  if (idx > -1) {
    selectedEvents.value.splice(idx, 1)
  } else {
    selectedEvents.value.push(index)
  }
}

// Подтверждение удаления
const confirmDelete = () => {
  console.log('Удалить события:', selectedEvents.value)
  selectedEvents.value = []
  isDeleteMode.value = false
}

// Открытие модалки редактирования секции
const openWarningEditModal = () => {
  sectionEditModalTitle.value = 'Редактирование секции'
  sectionEditModalSubtitle.value = 'Измените заголовок и предупреждение'
  isSectionEditModalOpen.value = true
}

const closeSectionEditModal = () => {
  isSectionEditModalOpen.value = false
}

const handleSectionEditSave = (values: Record<string, any>) => {
  if (values.sectionBadge) sectionBadge.value = values.sectionBadge
  if (values.sectionTitlePart1) sectionTitlePart1.value = values.sectionTitlePart1
  if (values.sectionTitlePart2) sectionTitlePart2.value = values.sectionTitlePart2
  if (values.warningTitle) warningTitle.value = values.warningTitle
  if (values.warningDescription) warningDescription.value = values.warningDescription
  
  console.log('Сохранены изменения секции:', values)
}

// Открытие модалки редактирования события
const openEventEditModal = (index: number) => {
  editingEventIndex.value = index
  isNewEvent.value = false
  eventEditModalTitle.value = 'Редактирование события'
  eventEditModalSubtitle.value = `Редактирование: ${events[index].title}`
  isEventEditModalOpen.value = true
}

const openNewEventModal = () => {
  editingEventIndex.value = null
  isNewEvent.value = true
  eventEditModalTitle.value = 'Новое событие'
  eventEditModalSubtitle.value = 'Заполните детали нового мероприятия'
  isEventEditModalOpen.value = true
}

const closeEventEditModal = () => {
  isEventEditModalOpen.value = false
  editingEventIndex.value = null
  isNewEvent.value = false
}

const handleEventEditSave = (values: Record<string, any>) => {
  if (isNewEvent.value) {
    // Добавление нового события
    const newEvent: EventItem = {
      day: values.day,
      month: values.month,
      icon: values.icon as any,
      category: values.category,
      title: values.title,
      description: values.description,
      price: values.price,
      priceLabel: values.priceLabel,
      button: values.button,
      dateBg: 'bg-accent',
      categoryColor: 'text-accent',
    }
    events.push(newEvent)
    console.log('Добавлено новое событие:', newEvent)
  } else if (editingEventIndex.value !== null) {
    // Обновление существующего события
    const event = events[editingEventIndex.value]
    if (event) {
      event.day = values.day
      event.month = values.month
      event.icon = values.icon as any
      event.category = values.category
      event.title = values.title
      event.description = values.description
      event.price = values.price
      event.priceLabel = values.priceLabel
      event.button = values.button
      console.log('Обновлено событие:', event)
    }
  }
}

// Эмитим состояние для родительского компонента
defineExpose({
  isDeleteMode,
  enableDeleteMode,
  cancelDeleteMode,
})

const events: EventItem[] = [
  {
    day: '15',
    month: 'Июн',
    icon: 'lion',
    category: 'Кормление',
    title: 'День льва: специальное кормление',
    description:
      'Наблюдайте за кормлением нашего прайда с безопасного мостика-наблюдения. Зоолог расскажет о поведении и охотничьих инстинктах.',
    price: 'Бесплатно',
    priceLabel: 'с билетом',
    button: 'Записаться',
    dateBg: 'bg-accent',
    categoryColor: 'text-accent',
  },
  {
    day: '22',
    month: 'Июн',
    icon: 'moon',
    category: 'Ночной тур',
    title: 'Ночное сафари: тайная жизнь зоопарка',
    description:
      'Откройте тёмную сторону зоопарка. Узнайте, чем занимаются животные после закрытия парка.',
    price: '590 ₽',
    priceLabel: 'за человека',
    button: 'Забронировать',
    dateBg: 'bg-warning',
    categoryColor: 'text-warning',
  },
  {
    day: '29',
    month: 'Июн',
    icon: 'elephant',
    category: 'Мастер-класс',
    title: 'Слоны-художники: арт-сессия',
    description: 'Наши слоны создадут картину прямо у вас на глазах.',
    price: '350 ₽',
    priceLabel: 'за человека',
    button: 'Участвовать',
    dateBg: 'bg-success',
    categoryColor: 'text-success',
  },
]
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