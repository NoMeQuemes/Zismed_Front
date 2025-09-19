<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-modalEnter">
        <!-- Botón de cerrar -->
        <button @click="close" class="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
          <span class="text-2xl">&times;</span>
        </button>
        <!-- Slot para el contenido -->
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  show: Boolean,
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes modalEnter {
  0% {
    transform: translateY(32px) scale(0.98);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
.animate-modalEnter {
  animation: modalEnter 0.18s;
}
</style>
