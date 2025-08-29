<template>
  <Spinner
    :isLoading="IsLoading"
    :can-cancel="false"
    @update:isLoading="IsLoading = $event"
    class="local-spinner"
  />
  <div class="w-96 bg-white border-l border-gray-200 p-6" v-if="!IsLoading && informacionPaciente">
    <div class="mb-6">
      <div class="items-center justify-between mb-2 flex">
        <span class="text-base font-bold text-gray-900">
          {{ informacionPaciente.pacienteNombre }}
        </span>
        <!-- <div class="flex gap-2">
          <span class="bg-orange-100 text-orange-800 px-2 py-1 text-xs font-medium rounded"
            >N2 Urgente</span
          >
          <span class="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded">UDI</span>
        </div> -->
      </div>
      <div class="text-sm text-gray-600">Edad: 2 a Obra soc: OSDE Llegada: 14/08 08:1</div>
    </div>
    <div class="mb-6">
      <div class="mb-2 flex gap-4">
        <span class="text-blue-600 text-sm">Alergias: Amoxicilina</span>
        <span class="text-blue-600 text-sm">Crónicos: Asma</span>
      </div>
      <div class="text-sm text-gray-600">Últ. control: 06/06/2025</div>
    </div>
    <div class="mb-8 flex gap-3">
      <button
        type="submit"
        class="flex-1 hover:bg-blue-600 rounded bg-blue-500 text-white px-4 py-2 font-medium"
      >
        Evolucionar ahora
      </button>
      <button
        type="submit"
        class="hover:bg-gray-600 rounded bg-gray-500 text-white px-4 py-2 font-medium"
      >
        Indicaciones rápidas
      </button>
    </div>

    <!-- Time line de consultas dinámica -->
    <div class="space-y-6" style="max-height: 43vh; overflow-y: auto">
      <div class="flex" v-for="consulta in consultasPaciente" :key="consulta.consultaId">
        <div class="items-center mr-4 flex flex-col">
          <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div class="w-0.5 h-16 bg-gray-200 mt-2" v-if="consulta !== consultasPaciente[consultasPaciente.length - 1]"></div>
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">
            {{ $formatDateTime(consulta.fecha) }} • {{ consulta.diagnosticos?.[0]?.nombre || 'Sin diagnóstico' }}
          </div>
          <div class="text-sm text-gray-600">{{ consulta.evolucion }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axiosFunction from '@/Functions/axios'
import { ref, onMounted } from 'vue'
import Spinner from '@/components/Spinner.vue'

let informacionPaciente = ref(null)
let registroId = 1718482
let institucionId = null
let consultasPaciente = ref([])
let IsLoading = ref(false)

onMounted(() => {
  traerInformacionPaciente(registroId, institucionId)
})

function traerInformacionPaciente(registroId, institucionId) {
  IsLoading.value = true
  axiosFunction
    .get('Guardia/consultasPorPaciente', {
      params: {
        registroId: registroId,
        institucionId: institucionId,
      },
    })
    .then((resultado) => {
      //Toda la información que viene del paciente
      informacionPaciente.value = resultado.data
      console.log('Información del paciente: ', informacionPaciente.value)

      //Todas las consultas
      consultasPaciente.value = resultado.data.result
      console.log('Consultas del paciente: ', consultasPaciente.value)
      IsLoading.value = false
    })
    .catch((error) => {
      console.log('Error al traer la información del paciente: ', error)
      IsLoading.value = false
    })
}
</script>
