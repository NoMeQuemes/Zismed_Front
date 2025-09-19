<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useDatosGuardiaStore } from '@/stores/DatosGuardia'

const datosGuardiaStore = useDatosGuardiaStore()

onMounted(() => {
  datosGuardiaStore.TraerInformacionUsuario()
})
</script>

<style scoped></style>
