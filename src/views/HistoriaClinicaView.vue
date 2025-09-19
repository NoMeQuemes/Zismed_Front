<template>
  <div class="min-h-screen bg-[#F7FAFC]">
    <!-- Header superior -->
    <Navigation>
      <template #Sector>
        <p>Historia Clínica</p>
      </template>
      <template #Subtitulo>
        <p>Resumen del paciente y línea de tiempo</p>
      </template>
    </Navigation>

    <div class="px-8 py-4">
      <!-- Spinner de carga -->
      <Spinner
        :isLoading="IsLoading"
        :can-cancel="false"
        @update:isLoading="IsLoading = $event"
        class="local-spinner"
      />
      <!-- Card principal paciente + urgencia -->
      <div
        v-if="!IsLoading && informacionPaciente"
        class="flex items-center justify-between bg-[#F4F8FE] rounded-xl px-6 py-4 border border-[#E4E9F2]"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-3xl"
          >
            <!-- Icono de usuario (placeholder) -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="9" r="4" stroke="currentColor" stroke-width="1.5" />
              <path d="M4 20c0-4 16-4 16 0" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-4">
              <span class="font-semibold text-lg tracking-wide">{{
                informacionPaciente.pacienteDocumento
              }}</span>
              <span class="font-bold text-lg tracking-wide">{{
                informacionPaciente.pacienteNombre
              }}</span>
            </div>
            <div class="text-sm text-[#677080] flex gap-3">
              <span>Edad: {{ $calcularEdad(informacionPaciente.pacienteFechaNacimiento) }}</span>
              <span>Obra social: {{ informacionPaciente.pacienteObraSocialNombre }}</span>
            </div>
          </div>
        </div>
        <div>
          <span
            class="bg-[#FFECCB] text-[#8E6B13] px-4 py-2 rounded-full border border-[#F3D49E] font-medium text-sm shadow-inner"
            >N2 Urgente</span
          >
        </div>
      </div>

      <!-- Contenido principal dividido en timeline y paneles de datos -->
      <div class="mt-6 flex gap-6">
        <!-- Timeline -->
        <div class="flex-[1.5]">
          <div
            class="bg-white rounded-xl border border-[#E4E9F2] p-4 h-[calc(85vh-120px)] min-h-[400px] overflow-y-auto"
          >
            <div class="flex">
              <!-- Columna de línea y puntos dinámica -->
              <div class="relative flex flex-col items-center w-8">
                <template v-for="(consulta, idx) in consultasPaciente" :key="consulta.consultaId">
                  <span
                    class="z-10 w-3 h-3 rounded-full bg-[#3E7BCE] border-2 border-white shadow"
                  ></span>
                  <div
                    v-if="idx < consultasPaciente.length - 1"
                    class="w-0.5 flex-1 bg-[#3E7BCE]"
                  ></div>
                </template>
              </div>
              <!-- Cards de eventos, alineadas a los puntos -->
              <div class="flex flex-col justify-between flex-1 ml-2 gap-2">
                <template v-for="consulta in consultasPaciente" :key="consulta.consultaId">
                  <div class="bg-[#F7FAFC] rounded-lg px-4 py-2 border border-[#E4E9F2]">
                    <div class="font-semibold">
                      {{ $formatDateTime ? $formatDateTime(consulta.fecha) : consulta.fecha }} ·
                      {{ obtenerOrigenConsulta(consulta) }}
                    </div>
                    <div class="text-sm text-[#60697B]">
                      {{ consulta.evolucion || 'Sin evolución' }}
                      <span v-if="consulta.diagnosticos?.length">
                        <br />Diagnóstico: {{ consulta.diagnosticos[0].nombre }}
                      </span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Paneles de datos -->
        <div class="flex-[2] flex flex-col gap-4">
          <!-- Datos clínicos clave -->
          <div class="bg-white rounded-xl border border-[#E4E9F2] px-6 py-4 flex flex-col gap-3">
            <div class="text-[#235B9A] font-semibold">Datos clínicos clave</div>
            <div class="text-sm text-[#60697B]">
              <span class="font-semibold">Alergias:</span> Amoxicilina &nbsp; • &nbsp;
              <span class="font-semibold">Antecedentes:</span> Asma leve intermitente<br />
              <span class="font-semibold">Medicaciones habituales:</span> Salbutamol PRN<br />
              <span class="font-semibold">Controles recientes:</span>
              Peso 12.1 kg &nbsp; • &nbsp; Talla 85 cm &nbsp; • &nbsp; IMC 16.7
            </div>
            <div class="flex gap-3 mt-2">
              <button
                class="bg-[#3578E1] hover:bg-[#255ba9] transition text-white rounded-lg px-4 py-2 font-medium text-sm shadow"
              >
                Nueva consulta
              </button>
              <button
                class="bg-[#3578E1] hover:bg-[#255ba9] transition text-white rounded-lg px-4 py-2 font-medium text-sm shadow"
              >
                Ver indicaciones prev.
              </button>
            </div>
          </div>
          <!-- Últimos diagnósticos -->
          <div class="bg-white rounded-xl border border-[#E4E9F2] px-6 py-4">
            <div class="text-[#235B9A] font-semibold">Últimos diagnósticos (CIE-10 / SNOMED)</div>
            <div class="text-sm text-[#60697B]">R11, K59, Z719</div>
          </div>
          <!-- Resultados recientes -->
          <div class="bg-white rounded-xl border border-[#E4E9F2] px-6 py-4">
            <div class="text-[#235B9A] font-semibold">Resultados / Estudios recientes</div>
            <div class="text-sm text-[#60697B]">Hemograma 2025-06-06 · Normal</div>
          </div>
          <!-- Notas relevantes -->
          <div class="bg-white rounded-xl border border-[#E4E9F2] px-6 py-4">
            <div class="text-[#235B9A] font-semibold">Notas relevantes</div>
            <div class="text-sm text-[#60697B]">Preferencia familiar: avisar a madre.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navigation from '@/components/NavBar.vue'
import axiosFunction from '@/Functions/axios'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Spinner from '@/components/Spinner.vue'

let consultasPaciente = ref([])
let informacionPaciente = ref(null)
let IsLoading = ref(false)

const $route = useRoute()

onMounted(() => {
  traerConsultas()
})

function traerConsultas() {
  IsLoading.value = true
  axiosFunction
    .get('Guardia/consultasPorPaciente', {
      params: {
        registroId: $route.params.guardiaRegistroId,
        institucionId: null,
      },
    })
    .then((resultado) => {
      //Toda la información que viene del paciente
      informacionPaciente.value = resultado.data

      //Solo las consultas
      consultasPaciente.value = resultado.data.result
      console.log('Consultas del paciente desde la vista de HC: ', consultasPaciente.value)
      IsLoading.value = false
    })
    .catch((error) => {
      console.log('Error al traer la información del paciente: ', error)
      IsLoading.value = false
    })
}

function obtenerOrigenConsulta(item) {
  console.log('Item de consulta: ', item)
  if (item.turnoID != null) {
    return 'Ambulatorio'
  } else if (item.guardiaRegistroID != null) {
    return 'Guardia'
  } else if (item.interconsultaID != null && item.camaId != null) {
    return 'Internación'
  } else if (
    item.turnoID == null &&
    item.guardiaRegistroID == null &&
    item.interconsultaID != null &&
    item.camaId == null
  ) {
    return 'Hc en Papel'
  } else {
    return 'No definido'
  }
}
</script>
