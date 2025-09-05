<template>
  <nav class="text-white px-6 py-4">
    <div class="items-center justify-between flex">
      <div>
        <!-- <p class="text-xl font-semibold">Guardia Pediátrica</p> -->
        <p class="text-xl font-semibold">
          <slot name="Sector"></slot>
        </p>
        <!-- <p class="text-sm opacity-90">Ingreso, Triage y Atención</p> -->
        <p class="text-sm opacity-90">
          <slot name="Subtitulo"></slot>
        </p>
      </div>
    </div>
  </nav>
</template>

<style scoped>
nav {
  background: #003d80;
}
</style>
