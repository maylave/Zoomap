<template>
  <section
    ref="heroRef"
    class=" text-cream-100 group relative flex min-h-screen items-center overflow-hidden"
    @mousemove="hero.handleGlobalMouseMove"
  >
    <!-- 1. Основной яркий курсор -->
    <div
      class="bg-lime/40 pointer-events-none absolute z-0 h-[300px] w-[300px] rounded-full mix-blend-screen blur-[60px] transition-transform duration-75 ease-out will-change-transform"
      :style="{
        left: '-150px',
        top: '-150px',
        transform: `translate(${hero.cursor.x}px, ${hero.cursor.y}px)`,
      }"
    />

    <!-- 2. Спутник 1 -->
    <div
      class="pointer-events-none absolute z-0 h-[120px] w-[120px] rounded-full bg-emerald-400/30 mix-blend-screen blur-[40px] transition-transform duration-150 ease-out will-change-transform"
      :style="{
        left: '-60px',
        top: '-60px',
        transform: `translate(${hero.satellite1.x}px, ${hero.satellite1.y}px)`,
      }"
    />

    <!-- 3. Спутник 2 -->
    <div
      class="pointer-events-none absolute z-0 h-[80px] w-[80px] rounded-full bg-lime-200/40 mix-blend-screen blur-[30px] transition-transform duration-200 ease-out will-change-transform"
      :style="{
        left: '-40px',
        top: '-40px',
        transform: `translate(${hero.satellite2.x}px, ${hero.satellite2.y}px)`,
      }"
    />

    <!-- Фоновые статические пятна -->
    <div class="pointer-events-none absolute inset-0 z-0">
      <div
        class="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]"
      />
    </div>

    <!-- ✅ Блок предупреждения (только для админа из store) -->
    <div
      v-if="authStore.isAdmin"
      class="group/warning absolute top-6 left-6 z-50 flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-3 backdrop-blur-sm transition-all hover:border-warning/50 hover:bg-warning/15 max-w-sm"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
          <i class="fa-solid fa-triangle-exclamation text-warning text-sm"></i>
        </div>
        <div>
          <p class="text-cream-100 text-xs font-medium">
            Управление Hero секцией
          </p>
          <p class="text-cream-100/60 text-[10px] mt-0.5">
            Редактируйте текст и элементы
          </p>
        </div>
      </div>

      <button
        class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-1.5 rounded-lg hover:bg-white/5"
        title="Редактировать Hero"
        @click="hero.openEditModal"
      >
        <i class="fa-solid fa-pen text-xs"></i>
      </button>
    </div>

    <div
      class="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8"
    >
      <!-- Content -->
      <div class="flex flex-col items-start space-y-8">
        <!-- Бейдж -->
        <div
          class="border-lime/20 bg-lime/5 text-lime inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(168,201,107,0.1)] backdrop-blur-md"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="bg-lime absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            ></span>
            <span class="bg-lime relative inline-flex h-2 w-2 rounded-full"></span>
          </span>
          {{ hero.badgeText }}
        </div>

        <!-- Заголовок -->
        <h1
          class="font-serif text-5xl leading-[1.1] font-black tracking-tight drop-shadow-lg lg:text-7xl"
        >
          {{ hero.titleLine1 }}
          <br />
          <span
            class="from-lime bg-gradient-to-r to-emerald-400 bg-clip-text text-transparent italic"
          >
            {{ hero.titleLine2 }}
          </span>
          <br />
          {{ hero.titleLine3 }}
        </h1>

        <!-- Описание -->
        <p class="text-cream-100/70 max-w-xl text-lg leading-relaxed">
          {{ hero.description }}
        </p>

        <!-- Кнопки -->
        <div class="flex flex-wrap gap-4 pt-4">
          <button
            @click="hero.openAnimalModal('lion')"
            class="group bg-lime text-forest-900 relative overflow-hidden rounded-full px-8 py-4 font-bold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,201,107,0.6)]"
          >
            <span class="relative z-10 flex items-center gap-2">
              {{ hero.buttonText1 }}
              <svg
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </button>

          <!-- ✅ НОВАЯ КНОПКА - Интерактивная карта -->
          <button
            @click="hero.goToMap"
            class="group/map relative overflow-hidden rounded-full border border-lime/30 bg-gradient-to-r from-forest-300/40 to-forest-400/40 px-8 py-4 font-medium text-cream-100 backdrop-blur-sm transition-all duration-500 hover:border-lime/60 hover:shadow-[0_0_30px_rgba(168,201,107,0.4)] hover:scale-105"
          >
            <!-- Фоновая анимация при hover -->
            <div class="absolute inset-0 -z-10 bg-gradient-to-r from-lime/0 via-lime/20 to-lime/0 opacity-0 transition-opacity duration-500 group-hover/map:opacity-100"></div>
            
            <!-- Бегущий блик -->
            <div class="absolute inset-0 -z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover/map:translate-x-[100%]"></div>
            
            <span class="relative z-10 flex items-center gap-3">
              <i class="fa-solid fa-map-location-dot text-lime transition-transform duration-300 group-hover/map:rotate-12 group-hover/map:scale-110"></i>
              <span>{{ hero.buttonText2 }}</span>
              <i class="fa-solid fa-arrow-right text-sm text-lime/60 transition-all duration-300 group-hover/map:translate-x-1 group-hover/map:text-lime"></i>
            </span>
          </button>
        </div>
      </div>

      <!-- Visual with Parallax & Internal Glow -->
      <div class="perspective-1000 relative hidden items-center justify-center lg:flex">
        <div
          ref="cardRef"
          class="preserve-3d relative h-[500px] w-[360px] cursor-pointer transition-transform duration-100 ease-out"
          :style="hero.cardStyle"
          @mousemove.stop="hero.handleCardMouseMove"
          @mouseleave="hero.handleCardMouseLeave"
          @click="hero.openAnimalModal('lion')"
        >
          <!-- Main Card -->
          <div
            class="from-moss/40 to-forest-300/40 absolute inset-0 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br shadow-2xl backdrop-blur-xl"
          >
            <!-- Внутренний свет карточки -->
            <div
              class="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-overlay transition-opacity duration-300"
              :style="{
                background: `radial-gradient(600px circle at ${hero.cardMouse.x}px ${hero.cardMouse.y}px, rgba(168, 201, 107, 0.25), transparent 40%)`,
              }"
            ></div>

            <!-- SVG Lion Icon -->
            <div
              class="absolute inset-0 z-10 flex items-center justify-center brightness-110 drop-shadow-2xl filter transition-transform duration-500 select-none group-hover:scale-110"
            >
              <img src="https://avatars.mds.yandex.net/i?id=efafca60f07471a6b9a1cbdcb2625e85_l-5875611-images-thumbs&n=13" alt="">
              <AppIcon name="lion" class="text-lime/90 h-64 w-64" />
            </div>

            <div
              class="from-forest-900 absolute inset-0 z-10 bg-gradient-to-t via-transparent to-transparent opacity-80"
            />

            <!-- Бейдж -->
            <div
              class="border-lime/30 text-lime absolute top-6 left-6 z-20 flex items-center gap-1.5 rounded-full border bg-black/40 px-4 py-1.5 text-xs font-bold tracking-wider uppercase backdrop-blur-md"
            >
              <svg class="text-lime h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
              {{ hero.cardBadge }}
            </div>

            <!-- Информация о животном -->
            <div class="absolute right-8 bottom-8 left-8 z-20">
              <h3 class="mb-1 font-serif text-4xl font-bold text-white">{{ hero.animalName }}</h3>
              <p class="text-cream-100/60 text-sm font-medium">{{ hero.animalInfo }}</p>
            </div>
          </div>

          <!-- Floating Badges -->
          <div
            class="float text-forest-400 absolute top-10 -right-12 z-30 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/90 px-5 py-4 shadow-xl backdrop-blur-md"
          >
            <div class="bg-forest-100 rounded-full p-2">
              <AppIcon name="paw" class="text-forest-400 h-6 w-6" />
            </div>
            <div>
              <div class="font-serif text-2xl leading-none font-bold">{{ hero.statsAnimals }}</div>
              <div class="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                животных
              </div>
            </div>
          </div>

          <div
            class="float-delay text-forest-400 absolute bottom-20 -left-12 z-30 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/90 px-5 py-4 shadow-xl backdrop-blur-md"
          >
            <div class="bg-forest-100 rounded-full p-2">
              <AppIcon name="globe" class="text-forest-400 h-6 w-6" />
            </div>
            <div>
              <div class="font-serif text-2xl leading-none font-bold">{{ hero.statsContinents }}</div>
              <div class="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                континентов
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Component для животных -->
    <AnimalModal :visible="hero.isModalOpen" :animal-id="hero.selectedAnimalId" @close="hero.closeAnimalModal" />

    <!-- Universal Edit Modal -->
    <EditModal
      :visible="hero.isEditModalOpen"
      title="Редактирование Hero секции"
      subtitle="Измените текстовые элементы и параметры"
      :fields="hero.editFields"
      @close="hero.closeEditModal"
      @save="hero.handleEditSave"
    />
  </section>
</template>

<script setup lang="ts">
import AnimalModal from '@/components/overlay/AnimalModal.vue'
import EditModal from '@/components/overlay/EditModal.vue'
import AppIcon from '@/components/ui/BaseIcon.vue'
import { computed, ref } from 'vue'

import { useHero } from '@/composables/useHero'
import { useAuthStore } from '@/stores/auth'

const hero = useHero()
const authStore = useAuthStore()

// Поля для формы редактирования
const editFields = computed(() => [
  {
    key: 'badgeText',
    label: 'Бейдж статуса',
    type: 'text' as const,
    value: hero.badgeText,                 // передаём ref целиком
    placeholder: 'Например: Открыто каждый день',
    hint: 'Текст в верхнем левом бейдже',
    icon: 'fa-solid fa-tag',
  },
  {
    key: 'titleLine1',
    label: 'Заголовок (строка 1)',
    type: 'text' as const,
    value: hero.titleLine1,
    placeholder: 'Первая строка заголовка',
    required: true,
    icon: 'fa-solid fa-heading',
  },
  {
    key: 'titleLine2',
    label: 'Заголовок (строка 2 - акцентная)',
    type: 'text' as const,
    value: hero.titleLine2,
    placeholder: 'Вторая строка заголовка (выделена цветом)',
    required: true,
    icon: 'fa-solid fa-heading',
  },
  {
    key: 'titleLine3',
    label: 'Заголовок (строка 3)',
    type: 'text' as const,
    value: hero.titleLine3,
    placeholder: 'Третья строка заголовка',
    required: true,
    icon: 'fa-solid fa-heading',
  },
  {
    key: 'description',
    label: 'Описание',
    type: 'textarea' as const,
    value: hero.description,
    placeholder: 'Описание секции',
    rows: 4,
    hint: 'Основной текст под заголовком',
    icon: 'fa-solid fa-align-left',
  },
  {
    key: 'buttonText1',
    label: 'Текст первой кнопки',
    type: 'text' as const,
    value: hero.buttonText1,
    placeholder: 'Текст основной кнопки',
    icon: 'fa-solid fa-arrow-right',
  },
  {
    key: 'buttonText2',
    label: 'Текст второй кнопки',
    type: 'text' as const,
    value: hero.buttonText2,
    placeholder: 'Текст вторичной кнопки',
    icon: 'fa-solid fa-arrow-right',
  },
  {
    key: 'cardBadge',
    label: 'Бейдж на карточке',
    type: 'text' as const,
    value: hero.cardBadge,
    placeholder: 'Например: Звезда сезона',
    icon: 'fa-solid fa-star',
  },
  {
    key: 'animalName',
    label: 'Имя животного',
    type: 'text' as const,
    value: hero.animalName,
    placeholder: 'Например: Симба',
    icon: 'fa-solid fa-paw',
  },
  {
    key: 'animalInfo',
    label: 'Информация о животном',
    type: 'text' as const,
    value: hero.animalInfo,
    placeholder: 'Например: Африканский лев · Зона Саванна',
    hint: 'Описание под именем животного',
    icon: 'fa-solid fa-info-circle',
  },
  {
    key: 'statsAnimals',
    label: 'Статистика: животные',
    type: 'text' as const,
    value: hero.statsAnimals,
    placeholder: 'Например: 3000+',
    icon: 'fa-solid fa-paw',
  },
  {
    key: 'statsContinents',
    label: 'Статистика: континенты',
    type: 'text' as const,
    value: hero.statsContinents,
    placeholder: 'Например: 5',
    icon: 'fa-solid fa-globe',
  },
])

defineExpose({
  openEditModal: hero.openEditModal,
  toggleEditMode: hero.toggleEditMode,
})
</script>



<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
.float {
  animation: float 6s ease-in-out infinite;
}
.float-delay {
  animation: float 6s ease-in-out infinite 3s;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
</style>