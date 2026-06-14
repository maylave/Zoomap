<script setup lang="ts">
const props = defineProps<{
  notifications: {
    email: boolean
    push: boolean
    sound: boolean
  }
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 class="mb-4 text-lg font-semibold text-white">Настройки уведомлений</h3>

      <div class="space-y-3">
        <label class="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 p-4 transition hover:bg-white/10">
          <div>
            <div class="font-medium text-white">Email уведомления</div>
            <div class="text-sm text-white/50">Получать уведомления на почту</div>
          </div>
          <input
            v-model="notifications.email"
            type="checkbox"
            class="toggle toggle-accent"
          />
        </label>

        <label class="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 p-4 transition hover:bg-white/10">
          <div>
            <div class="font-medium text-white">Push уведомления</div>
            <div class="text-sm text-white/50">Уведомления в браузере</div>
          </div>
          <input
            v-model="notifications.push"
            type="checkbox"
            class="toggle toggle-accent"
          />
        </label>

        <label class="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 p-4 transition hover:bg-white/10">
          <div>
            <div class="font-medium text-white">Звук уведомлений</div>
            <div class="text-sm text-white/50">Воспроизводить звук при получении</div>
          </div>
          <input
            v-model="notifications.sound"
            type="checkbox"
            class="toggle toggle-accent"
          />
        </label>
      </div>
    </div>
  </div>
</template>