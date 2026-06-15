<template>
  <section class="relative w-full overflow-hidden bg-forest-300/80 backdrop-blur-sm py-4">
    
    <!-- Блок предупреждения (только для админа) -->
    <div
      v-if="isAdmin"
      class="group/warning mx-6 mb-4 flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-3 backdrop-blur-sm transition-all hover:border-warning/50 hover:bg-warning/15"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
          <i class="fa-solid fa-triangle-exclamation text-warning text-sm"></i>
        </div>
        <div>
          <p class="text-cream-100 text-xs font-medium">
            Управление бегущей строкой
          </p>
          <p class="text-cream-100/60 text-[10px] mt-0.5">
            Редактируйте зоны или добавьте новые
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="text-cream-100/60 hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-white/5 flex items-center gap-1.5 text-xs"
          title="Добавить зону"
          @click="openNewZoneModal"
        >
          <i class="fa-solid fa-plus text-xs"></i>
          <span>Добавить</span>
        </button>
        <button
          class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-1.5 rounded-lg hover:bg-white/5"
          title="Редактировать все зоны"
          @click="openAllZonesEditModal"
        >
          <i class="fa-solid fa-pen text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Градиентные маски по краям для плавного исчезновения текста -->
    <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-forest-300/80 to-transparent" />
    <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-forest-300/80 to-transparent" />

    <div class="marquee-wrap flex overflow-hidden">
      <div class="marquee-track flex whitespace-nowrap">
        <!-- Дублируем контент дважды для бесшовной анимации -->
        <template v-for="n in 2" :key="n">
          <span 
            v-for="(zone, index) in zones" 
            :key="`${n}-${index}`"
            class="group/zone relative flex items-center px-8 text-sm font-medium uppercase tracking-wider text-forest-900"
          >
            {{ zone }}
            <span class="ml-8 opacity-60">✦</span>
            
            <!-- Админские иконки (только для админа, появляются при hover) -->
            <template v-if="isAdmin">
              <span class="ml-3 flex items-center gap-2 opacity-0 group-hover/zone:opacity-100 transition-opacity duration-200">
                <button
                  class="text-cream-100/60 hover:text-accent transition-colors p-1 rounded hover:bg-white/10"
                  title="Редактировать зону"
                  @click.stop="openZoneEditModal(index)"
                >
                  <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button
                  class="text-cream-100/60 hover:text-error transition-colors p-1 rounded hover:bg-white/10"
                  title="Удалить зону"
                  @click.stop="deleteZone(index)"
                >
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </span>
            </template>
          </span>
        </template>
      </div>
    </div>

    <!-- EditModal для одной зоны -->
    <EditModal
      :visible="isZoneEditModalOpen"
      :title="zoneEditModalTitle"
      :subtitle="zoneEditModalSubtitle"
      :fields="zoneEditFields"
      @close="closeZoneEditModal"
      @save="handleZoneEditSave"
    />

    <!-- EditModal для всех зон -->
    <EditModal
      :visible="isAllZonesEditModalOpen"
      title="Редактирование всех зон"
      subtitle="Измените названия всех зон зоопарка"
      :fields="allZonesEditFields"
      @close="closeAllZonesEditModal"
      @save="handleAllZonesEditSave"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EditModal from '@/components/overlay/EditModal.vue'

// Флаг администратора
const isAdmin = ref(true)

// Состояние зон
const zones = ref<string[]>([
  'Африканская саванна',
  'Тропический лес',
  'Арктическая зона',
  'Океанариум',
  'Детский зоопарк',
  'Ночное сафари'
])

// Состояние для модалки редактирования одной зоны
const isZoneEditModalOpen = ref(false)
const zoneEditModalTitle = ref('Редактирование зоны')
const zoneEditModalSubtitle = ref('Измените название зоны')
const editingZoneIndex = ref<number | null>(null)
const isNewZone = ref(false)

// Состояние для модалки редактирования всех зон
const isAllZonesEditModalOpen = ref(false)

// Поля для редактирования одной зоны
const zoneEditFields = computed(() => {
  const zoneName = editingZoneIndex.value !== null ? zones.value[editingZoneIndex.value] : ''
  
  return [
    {
      key: 'zoneName',
      label: 'Название зоны',
      value: zoneName,
      placeholder: 'Например: Африканская саванна',
      required: true,
      hint: 'Это название будет отображаться в бегущей строке',
      icon: 'fa-solid fa-map-marker-alt',
      type: 'text' as const,
    },
  ]
})

// Поля для редактирования всех зон
const allZonesEditFields = computed(() => {
  return zones.value.map((zone, index) => ({
    key: `zone_${index}`,
    label: `Зона ${index + 1}`,
    value: zone,
    placeholder: `Название зоны ${index + 1}`,
    required: true,
    icon: 'fa-solid fa-map-marker-alt',
    type: 'text' as const,
  }))
})

// === EditModal: Одна зона ===
const openZoneEditModal = (index: number) => {
  editingZoneIndex.value = index
  isNewZone.value = false
  zoneEditModalTitle.value = 'Редактирование зоны'
  zoneEditModalSubtitle.value = `Редактирование: ${zones.value[index]}`
  isZoneEditModalOpen.value = true
}

const openNewZoneModal = () => {
  editingZoneIndex.value = null
  isNewZone.value = true
  zoneEditModalTitle.value = 'Добавить новую зону'
  zoneEditModalSubtitle.value = 'Введите название новой зоны'
  isZoneEditModalOpen.value = true
}

const closeZoneEditModal = () => {
  isZoneEditModalOpen.value = false
  editingZoneIndex.value = null
  isNewZone.value = false
}

const handleZoneEditSave = (values: Record<string, any>) => {
  if (isNewZone.value) {
    // Добавление новой зоны
    zones.value.push(values.zoneName)
    console.log('Добавлена новая зона:', values.zoneName)
  } else if (editingZoneIndex.value !== null) {
    // Обновление существующей зоны
    zones.value[editingZoneIndex.value] = values.zoneName
    console.log('Обновлена зона:', values.zoneName)
  }
}

// === EditModal: Все зоны ===
const openAllZonesEditModal = () => {
  isAllZonesEditModalOpen.value = true
}

const closeAllZonesEditModal = () => {
  isAllZonesEditModalOpen.value = false
}

const handleAllZonesEditSave = (values: Record<string, any>) => {
  // Обновляем все зоны
  const newZones: string[] = []
  for (let i = 0; i < zones.value.length; i++) {
    const key = `zone_${i}`
    if (values[key] !== undefined) {
      newZones.push(values[key])
    }
  }
  zones.value = newZones
  console.log('Обновлены все зоны:', newZones)
}

// Удаление зоны
const deleteZone = (index: number) => {
  const zoneName = zones.value[index]
  if (confirm(`Удалить зону "${zoneName}"?`)) {
    zones.value.splice(index, 1)
    console.log('Удалена зона:', zoneName)
  }
}
</script>

<style scoped>
.marquee-track {
  animation: marquee 25s linear infinite;
}

/* Останавливаем анимацию при наведении для удобства чтения */
.marquee-wrap:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>