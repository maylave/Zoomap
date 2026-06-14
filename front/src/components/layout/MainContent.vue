<template>
  <main class="custom-scrollbar flex-1 overflow-y-auto bg-black/10">
    <div class="p-6 md:p-8">
      <!-- Заголовок текущего раздела -->
      <div class="mb-6">
        <h2 class="mb-1 text-2xl font-bold text-white">
          {{ context.label }}
        </h2>
        <p class="text-sm text-white/50">
          {{ context.description }}
        </p>
      </div>

      <!-- Слот для контента -->
      <slot :active-menu="activeMenu">
        <!-- Дефолтный контент -->
        <div class="space-y-4">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 class="mb-2 font-medium text-white">Пример поля</h3>
            <p class="text-sm text-white/60">
              Это содержимое раздела «{{ context.label }}». Вы можете передать сюда любой контент
              через слот по умолчанию.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 class="mb-2 font-medium text-white">Ещё один блок</h3>
            <p class="text-sm text-white/60">
              Контент автоматически скроллится, если не помещается. Попробуйте развернуть окно на
              весь экран для лучшего эффекта.
            </p>
          </div>
        </div>
      </slot>
    </div>
  </main>
</template>

<script lang="ts" setup>
// Интерфейс контекста (PascalCase по конвенции)
interface Context {
  label: string
  description: string
}

// Пропсы с дефолтными значениями
const props = withDefaults(
  defineProps<{
    context?: Context
    activeMenu?: string
  }>(),
  {
    context: () => ({
      label: 'Настройки',
      description: 'Управление профилем и настройками',
    }),
    activeMenu: 'profile',
  }
)

// Определение слотов (опционально, для типобезопасности)
defineSlots<{
  default(props: { activeMenu?: string }): any
}>()
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>