<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
      <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/40 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Всего зон</div>
        <div class="mt-2 text-2xl font-bold text-cream-100">{{ zones.length }}</div>
      </div>
      <div class="rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Всего животных</div>
        <div class="mt-2 text-2xl font-bold text-lime">{{ totalAnimals }}</div>
      </div>
    </div>

    <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/30 to-forest-400/30 p-4 sm:p-6">
      <div class="mb-4 flex justify-end">
        <button @click="openCreateModal" class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime">
          + Добавить зону
        </button>
      </div>

      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-accent"></i>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2">
        <div
          v-for="zone in zones"
          :key="zone.id"
          class="rounded-2xl border border-sage/15 bg-forest-400/40 p-4 transition hover:border-sage/30"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <img :src="zone.image" :alt="zone.name" class="h-16 w-16 rounded-xl object-cover" />
              <div>
                <h3 class="font-semibold text-cream-100">{{ zone.name }}</h3>
                <p class="text-xs text-cream-100/60">{{ zone.location }}</p>
                <p class="text-xs text-cream-100/40">{{ zone.animalsCount }} животных</p>
              </div>
            </div>
            <div class="flex gap-1">
              <button @click="openEditModal(zone)" class="rounded-lg p-2 text-cream-100/60 hover:bg-lime/10 hover:text-lime">
                <i class="fa-solid fa-pen text-sm"></i>
              </button>
              <button @click="deleteZone(zone.id)" class="rounded-lg p-2 text-cream-100/60 hover:bg-terracotta/15 hover:text-terracotta">
                <i class="fa-solid fa-trash text-sm"></i>
              </button>
            </div>
          </div>
          <p class="mt-3 text-sm text-cream-100/60 line-clamp-2">{{ zone.description }}</p>
          <div class="mt-3 flex gap-2 text-xs text-cream-100/50">
            <span>🌡️ {{ zone.climate }}</span>
            <span>•</span>
            <span>🕐 {{ zone.hours }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <Transition name="modal-backdrop">
      <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" @click="closeModal">
        <div @click.stop class="w-full max-w-md rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-6 shadow-2xl">
          <h3 class="mb-4 text-lg font-bold text-cream-100">
            {{ editingZone ? 'Редактировать зону' : 'Новая зона' }}
          </h3>
          <div class="space-y-3">
            <input v-model="form.name" placeholder="Название" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.location" placeholder="Расположение" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.image" placeholder="URL изображения" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <textarea v-model="form.description" placeholder="Описание" rows="3" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100"></textarea>
            <input v-model="form.climate" placeholder="Климат" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.hours" placeholder="Режим работы" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <div class="grid grid-cols-2 gap-3">
              <input v-model="form.positionX" type="number" placeholder="X (%)" class="rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
              <input v-model="form.positionY" type="number" placeholder="Y (%)" class="rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button @click="closeModal" class="rounded-full border border-sage/20 bg-forest-400/40 px-4 py-2 text-sm text-cream-100/80">Отмена</button>
            <button @click="saveZone" class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime">
              {{ editingZone ? '💾 Сохранить' : '✨ Создать' }}
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
import { zonesService, type Zone } from '@/services/zones.service'

const isLoading = ref(true)
const zones = ref<Zone[]>([])
const showModal = ref(false)
const editingZone = ref<Zone | null>(null)

const form = ref({
  name: '', location: '', image: '', description: '',
  climate: '', hours: '', positionX: 50, positionY: 50,
})

const totalAnimals = computed(() => zones.value.reduce((sum, z) => sum + z.animalsCount, 0))

const loadZones = async () => {
  isLoading.value = true
  try {
    const response = await zonesService.getAll()
    zones.value = response.zones
  } catch (error) {
    ElMessage.error('Ошибка загрузки зон')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  editingZone.value = null
  form.value = { name: '', location: '', image: '', description: '', climate: '', hours: '', positionX: 50, positionY: 50 }
  showModal.value = true
}

const openEditModal = (zone: Zone) => {
  editingZone.value = zone
  form.value = {
    name: zone.name, location: zone.location, image: zone.image,
    description: zone.description, climate: zone.climate, hours: zone.hours,
    positionX: zone.position.x, positionY: zone.position.y,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingZone.value = null
}

const saveZone = async () => {
  try {
    const data = {
      name: form.value.name,
      location: form.value.location,
      image: form.value.image,
      description: form.value.description,
      climate: form.value.climate,
      hours: form.value.hours,
      positionX: Number(form.value.positionX),
      positionY: Number(form.value.positionY),
    }

    if (editingZone.value) {
      await zonesService.update(editingZone.value.id, data)
      ElMessage.success('Зона обновлена')
    } else {
      await zonesService.create(data)
      ElMessage.success('Зона добавлена')
    }

    closeModal()
    await loadZones()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  }
}

const deleteZone = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить эту зону?', 'Подтверждение', {
      confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', type: 'warning',
    })
    await zonesService.delete(id)
    ElMessage.success('Зона удалена')
    await loadZones()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}

onMounted(() => loadZones())
</script>

<style scoped>
.modal-backdrop-enter-active, .modal-backdrop-leave-active { transition: opacity 0.3s ease; }
.modal-backdrop-enter-from, .modal-backdrop-leave-to { opacity: 0; }
</style>