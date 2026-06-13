<template>
  <section id="events" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-14">
        <span class="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          Что происходит
        </span>

        <h2 class="mt-6 text-4xl font-bold text-cream-100 md:text-5xl">
          Ближайшие
          <span class="text-accent italic"> события </span>
        </h2>
      </div>

      <!-- Cards -->
      <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="(event, index) in events"
          :key="event.title"
          class="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-accent/30 hover:shadow-2xl hover:shadow-black/20"
          @click="openOverlay(index)"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6">
            <div class="flex h-20 w-20 flex-col items-center justify-center rounded-2xl text-white" :class="event.dateBg">
              <span class="text-3xl font-bold leading-none">{{ event.day }}</span>
              <span class="mt-1 text-xs uppercase tracking-wider">{{ event.month }}</span>
            </div>

            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-cream-100">
              <!-- Замените AppIcon на ваш компонент или svg -->
              <AppIcon :name="event.icon" class="size-8" />
            </div>
          </div>

          <!-- Content -->
          <div class="px-6 pb-6">
            <span class="text-sm font-medium" :class="event.categoryColor">
              {{ event.category }}
            </span>

            <h3 class="mt-3 text-xl font-bold text-cream-100">
              {{ event.title }}
            </h3>

            <p class="mt-4 line-clamp-4 text-sm leading-relaxed text-cream-100/60">
              {{ event.description }}
            </p>

            <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <div>
                <div class="text-lg font-bold text-accent">{{ event.price }}</div>
                <div class="text-xs text-cream-100/40">{{ event.priceLabel }}</div>
              </div>

              <button class="btn btn-accent btn-sm rounded-full">
                {{ event.button }}
              </button>
            </div>
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
  </section>
</template>

<script setup lang="ts">
import EventsOverlay from '@/components/overlay/EventsOverlay.vue'
import AppIcon from '@/components/ui/BaseIcon.vue'; // Убедитесь, что путь верный
import { ref } from 'vue'

interface EventItem {
  day: string
  month: string
  icon: string
  category: string
  title: string
  description: string
  price: string
  priceLabel: string
  button: string
  dateBg: string
  categoryColor: string
}

const selectedEvent = ref<EventItem | null>(null)

const openOverlay = (index: number) => {
  selectedEvent.value = events[index]
}

const events: EventItem[] = [
  {
    day: '15',
    month: 'Июн',
    icon: 'lion',
    category: 'Кормление',
    title: 'День льва: специальное кормление',
    description: 'Наблюдайте за кормлением нашего прайда с безопасного мостика-наблюдения. Зоолог расскажет о поведении и охотничьих инстинктах.',
    price: 'Бесплатно',
    priceLabel: 'с билетом',
    button: 'Записаться',
    dateBg: 'bg-accent',
    categoryColor: 'text-accent'
  },
  {
    day: '22',
    month: 'Июн',
    icon: 'moon',
    category: 'Ночной тур',
    title: 'Ночное сафари: тайная жизнь зоопарка',
    description: 'Откройте тёмную сторону зоопарка. Узнайте, чем занимаются животные после закрытия парка.',
    price: '590 ₽',
    priceLabel: 'за человека',
    button: 'Забронировать',
    dateBg: 'bg-warning',
    categoryColor: 'text-warning'
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
    categoryColor: 'text-success'
  }
]
</script>