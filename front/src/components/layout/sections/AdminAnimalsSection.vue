<template>
  <div class="space-y-6">
    <!-- Статистика -->
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/40 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Всего животных</div>
        <div class="mt-2 text-2xl font-bold text-cream-100">{{ stats.total }}</div>
      </div>
      <div class="rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Хищники</div>
        <div class="mt-2 text-2xl font-bold text-lime">{{ stats.predators }}</div>
      </div>
      <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-sage/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Травоядные</div>
        <div class="mt-2 text-2xl font-bold text-sage">{{ stats.herbivores }}</div>
      </div>
      <div class="rounded-2xl border border-amber/20 bg-gradient-to-br from-amber/10 to-forest-400/40 p-4">
        <div class="text-xs font-medium text-cream-100/60">Средний рейтинг</div>
        <div class="mt-2 text-2xl font-bold text-amber">{{ stats.avgRating }}</div>
      </div>
    </div>

    <!-- Панель управления -->
    <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/30 to-forest-400/30 p-4 sm:p-6">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Поиск по имени..."
          class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100 placeholder:text-cream-100/40 focus:border-lime/50 focus:outline-none sm:max-w-xs"
        />
        <button
          @click="openCreateModal"
          class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime"
        >
          + Добавить животное
        </button>
      </div>

      <!-- Загрузка -->
      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-accent"></i>
      </div>

      <!-- Таблица -->
      <div v-else class="overflow-hidden rounded-xl border border-sage/15">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-sage/20 bg-forest-400/40">
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Фото</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Имя</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Вид</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Зона</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Питание</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-cream-100/60">Рейтинг</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase text-cream-100/60">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="animal in filteredAnimals"
                :key="animal.id"
                class="border-b border-sage/10 hover:bg-forest-300/30"
              >
                <td class="px-4 py-3">
                  <img :src="animal.image" :alt="animal.name" class="h-12 w-12 rounded-lg object-cover" />
                </td>
                <td class="px-4 py-3 font-medium text-cream-100">{{ animal.name }}</td>
                <td class="px-4 py-3 text-sm italic text-cream-100/60">{{ animal.scientificName }}</td>
                <td class="px-4 py-3 text-sm text-cream-100/70">{{ animal.zone }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full bg-white/10 px-2 py-1 text-xs text-cream-100">
                    {{ animal.diet }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 text-amber">
                    <i class="fa-solid fa-star text-xs"></i>
                    <span class="text-sm">{{ animal.rating.toFixed(1) }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <button
                      @click="openEditModal(animal)"
                      class="rounded-lg p-2 text-cream-100/60 hover:bg-lime/10 hover:text-lime"
                    >
                      <i class="fa-solid fa-pen text-sm"></i>
                    </button>
                    <button
                      @click="deleteAnimal(animal.id)"
                      class="rounded-lg p-2 text-cream-100/60 hover:bg-terracotta/15 hover:text-terracotta"
                    >
                      <i class="fa-solid fa-trash text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredAnimals.length === 0" class="py-12 text-center">
          <div class="text-5xl">🦁</div>
          <div class="mt-2 text-cream-100/70">Животные не найдены</div>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <Transition name="modal-backdrop">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        @click="closeModal"
      >
        <div @click.stop class="w-full max-w-md rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-6 shadow-2xl">
          <h3 class="mb-4 text-lg font-bold text-cream-100">
            {{ editingAnimal ? 'Редактировать животное' : 'Новое животное' }}
          </h3>

          <div class="space-y-3">
            <input v-model="form.name" placeholder="Имя" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.species" placeholder="Вид (лат.)" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.image" placeholder="URL фото" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <textarea v-model="form.description" placeholder="Описание" rows="3" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100"></textarea>
            
            <select v-model="form.zoneId" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100">
              <option value="">Выберите зону</option>
              <option v-for="zone in zones" :key="zone.id" :value="zone.id">{{ zone.name }}</option>
            </select>

            <select v-model="form.diet" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100">
              <option value="хищник">Хищник</option>
              <option value="травоядное">Травоядное</option>
              <option value="всеядное">Всеядное</option>
            </select>

            <div class="grid grid-cols-2 gap-3">
              <input v-model="form.weight" type="number" placeholder="Вес (кг)" class="rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
              <input v-model="form.age" type="number" placeholder="Возраст (лет)" class="rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button @click="closeModal" class="rounded-full border border-sage/20 bg-forest-400/40 px-4 py-2 text-sm text-cream-100/80">
              Отмена
            </button>
            <button @click="saveAnimal" class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime">
              {{ editingAnimal ? '💾 Сохранить' : '✨ Создать' }}
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
import { animalsService, type Animal } from '@/services/animals.service'
import { zonesService, type Zone } from '@/services/zones.service'

const isLoading = ref(true)
const animals = ref<Animal[]>([])
const zones = ref<Zone[]>([])
const searchQuery = ref('')
const showModal = ref(false)
const editingAnimal = ref<Animal | null>(null)

const form = ref({
  name: '',
  species: '',
  image: '',
  description: '',
  zoneId: '',
  diet: 'хищник' as const,
  weight: '',
  age: '',
})

const stats = computed(() => ({
  total: animals.value.length,
  predators: animals.value.filter(a => a.diet === 'хищник').length,
  herbivores: animals.value.filter(a => a.diet === 'травоядное').length,
  avgRating: animals.value.length > 0
    ? (animals.value.reduce((sum, a) => sum + a.rating, 0) / animals.value.length).toFixed(1)
    : '0.0',
}))

const filteredAnimals = computed(() => {
  if (!searchQuery.value) return animals.value
  const q = searchQuery.value.toLowerCase()
  return animals.value.filter(a => a.name.toLowerCase().includes(q))
})

const loadData = async () => {
  isLoading.value = true
  try {
    const [animalsRes, zonesRes] = await Promise.all([
      animalsService.getAll(),
      zonesService.getAll(),
    ])
    animals.value = animalsRes.animals
    zones.value = zonesRes.zones
  } catch (error) {
    ElMessage.error('Ошибка загрузки данных')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  editingAnimal.value = null
  form.value = {
    name: '', species: '', image: '', description: '',
    zoneId: '', diet: 'хищник', weight: '', age: '',
  }
  showModal.value = true
}

const openEditModal = (animal: Animal) => {
  editingAnimal.value = animal
  form.value = {
    name: animal.name,
    species: animal.scientificName,
    image: animal.image,
    description: animal.description,
    zoneId: String(animal.zoneId),
    diet: animal.diet as any,
    weight: animal.weight.replace(' кг', ''),
    age: animal.age.replace(' лет', ''),
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingAnimal.value = null
}

const saveAnimal = async () => {
  try {
    const data = {
      name: form.value.name,
      species: form.value.species,
      image: form.value.image,
      description: form.value.description,
      zoneId: Number(form.value.zoneId),
      diet: form.value.diet,
      weight: form.value.weight ? Number(form.value.weight) : undefined,
      age: form.value.age ? Number(form.value.age) : undefined,
    }

    if (editingAnimal.value) {
      await animalsService.update(editingAnimal.value.id, data)
      ElMessage.success('Животное обновлено')
    } else {
      await animalsService.create(data)
      ElMessage.success('Животное добавлено')
    }

    closeModal()
    await loadData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  }
}

const deleteAnimal = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить это животное?', 'Подтверждение', {
      confirmButtonText: 'Удалить',
      cancelButtonText: 'Отмена',
      type: 'warning',
    })
    await animalsService.delete(id)
    ElMessage.success('Животное удалено')
    await loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Ошибка удаления')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
</style>