<template>
  <div class="flex-1 p-6">
    <div class="mb-6">
      <input
        type="text"
        placeholder="Buscar por DNI / Nombre / N° de triage"
        class="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-4 py-2 rounded-lg bg-white text-gray-900"
      />
    </div>
    <div class="bg-white rounded-lg shadow" style="max-height: 70vh; overflow-y: auto">
      <table class="min-w-full text-sm text-gray-900 patient-table">
        <thead class="bg-gray-50 text-gray-700">
          <tr>
            <th class="px-4 py-2 border-b" v-for="columna in columnas" :key="columna">
              {{ columna }}
            </th>
          </tr>
        </thead>
        <tbody class="text-center divide-y divide-gray-200">
          <slot name="row" v-for="(item, index) in datos" :item="item" :index="index" :key="index">
          </slot>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  columnas: {
    type: Array,
    required: true,
  },
  datos: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.patient-table th,
.patient-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.patient-table th {
  background-color: #f9fafb;
  color: #333;
  font-weight: 500;
}
.patient-table tbody tr {
  background-color: #fff;
}
.patient-table tbody tr:last-child td {
  border-bottom: none;
}
.patient-table button {
  background-color: #22c55e;
  color: #fff;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 0.9em;
  font-weight: 500;
  transition: background 0.2s;
}
.patient-table button:hover {
  background-color: #16a34a;
}
</style>
