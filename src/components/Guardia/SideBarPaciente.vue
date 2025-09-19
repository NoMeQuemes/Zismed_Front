<template>
  <Transition name="slide-right-panel">
    <div v-if="mostrar">
      <Spinner
        :isLoading="IsLoading"
        :can-cancel="false"
        @update:isLoading="IsLoading = $event"
        class="local-spinner"
      />
      <div
        class="w-96 bg-white border-l border-gray-200 p-6"
        v-if="!IsLoading && informacionPaciente"
      >
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
          <div class="text-sm text-gray-600">
            Edad: {{ $calcularEdad(informacionPaciente.pacienteFechaNacimiento) }} a Obra soc: OSDE
            Llegada: 2025-09-05
          </div>
        </div>
        <div class="mb-6">
          <div class="mb-2 flex gap-4">
            <span class="text-blue-600 text-sm">Alergias: Amoxicilina</span>
            <span class="text-blue-600 text-sm">Crónicos: Asma</span>
          </div>
          <div class="text-sm text-gray-600">Últ. control: 06/06/2025</div>
        </div>
        <div class="mb-8 flex gap-2">
          <router-link
            :to="{
              name: 'CreateConsulta',
              params: {
                pacienteId: informacionPaciente.pacienteID,
                GuardiaRegistroId: props.registroId,
              },
            }"
          >
            <button
              type="submit"
              class="flex-1 hover:bg-blue-600 rounded bg-blue-500 text-white px-3 py-1 font-small"
            >
              Evolucionar ahora
            </button>
          </router-link>
          <button
            type="submit"
            class="hover:bg-gray-600 rounded bg-gray-500 text-white px-3 py-1 font-small"
          >
            Indicaciones rápidas
          </button>
          <router-link :to="{ name: 'HistoriaClinica', params: { guardiaRegistroId: registroId } }">
            <button
              type="submit"
              class="hover:bg-gray-600 rounded bg-gray-500 text-white px-3 py-1 font-small"
            >
              Historia clínica
            </button>
          </router-link>
        </div>

        <!-- Time line de consultas dinámica -->
        <div class="space-y-6" style="max-height: 56vh; overflow-y: auto">
          <div class="flex" v-for="consulta in consultasPaciente" :key="consulta.consultaId">
            <div class="items-center mr-4 flex flex-col">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div
                class="w-0.5 h-16 bg-gray-200 mt-2"
                v-if="consulta !== consultasPaciente[consultasPaciente.length - 1]"
              ></div>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">
                {{ $formatDateTime(consulta.fecha) }} •
                {{ consulta.diagnosticos?.[0]?.nombre || 'Sin diagnóstico' }}
              </div>
              <div class="text-sm text-gray-600">{{ consulta.evolucion }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import axiosFunction from '@/Functions/axios'
import { ref, Transition, watch } from 'vue'
import Spinner from '@/components/Spinner.vue'

let informacionPaciente = ref(null)
let consultasPaciente = ref([])
let IsLoading = ref(false)

const props = defineProps({
  registroId: {
    type: Number,
    required: true,
    default: null,
  },
  mostrar: {
    type: Boolean,
    required: true,
    default: false,
  },
})

function traerInformacionPaciente() {
  if (!props.registroId) {
    return
  }
  IsLoading.value = true
  axiosFunction
    .get('Guardia/consultasPorPaciente', {
      params: {
        registroId: props.registroId,
        institucionId: null,
      },
    })
    .then((resultado) => {
      //Toda la información que viene del paciente
      informacionPaciente.value = resultado.data

      //Todas las consultas
      consultasPaciente.value = resultado.data.result
      IsLoading.value = false
    })
    .catch((error) => {
      console.log('Error al traer la información del paciente: ', error)
      IsLoading.value = false
    })
}

// Se usa watch para que la función se ejecute cada vez que la prop 'registroId' cambie
watch(
  () => props.registroId,
  () => {
    traerInformacionPaciente()
  },
)
</script>

<style scoped>
.slide-right-panel-enter-active,
.slide-right-panel-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-panel-enter-from,
.slide-right-panel-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
.slide-right-panel-enter-to,
.slide-right-panel-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
