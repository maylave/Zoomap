<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click="handleOverlayClick"
    >
      <div
        class="relative mx-4 max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
        @click.stop
      >
        
        
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  visible?: boolean
  closable?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  closable: true,
  closeOnOverlay: true
})

const emit = defineEmits<{
  close: []
}>()

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    emit('close')
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>