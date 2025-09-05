<template>
  <!-- <div class="bg-gray-50 font-sans"> Con este cambio se quita el modo oscuro por defecto -->
  <div class="bg-gray-50 font-sans">
    <div class="min-h-screen flex flex-col">
      <Navigation>
        <template #Sector>
          <p>{{ sectorConsulta }}</p>
          <!-- <p class="text-sm opacity-90">Ingreso, Triage y Atención</p> -->
        </template>
        <template #Subtitulo>
          <p>Ingreso, Triage y Atención</p>
        </template>
      </Navigation>
      <div class="flex flex-1">
        <PatientSearch
          :columnas="[
            'N°',
            'Paciente',
            'Documento',
            'Ingreso',
            'Médico que recibe',
            'Estado',
            'Acciones',
          ]"
          :datos="listaPacientesFiltrados"
          v-model:stringBusqueda="stringBusqueda"
        >
          <template #row="{ item, index }">
            <tr>
              <td class="py-4">{{ index + 1 }}</td>
              <td class="py-4">{{ item.pacienteNombre }}</td>
              <td class="py-4">{{ item.pacienteDocumento }}</td>
              <td class="py-4">{{ item.fechaIngreso }}</td>
              <td class="py-4">{{ item.prestadorRecibe.trim() }}</td>
              <td class="py-4">{{ item.estado == null ? 'Sin Estado' : item.estado }}</td>
              <td class="py-4">
                <button
                  class="bg-green-500 text-white px-2 py-1 rounded"
                  @click="selectPatient(item.guardiaRegistroID)"
                >
                  Atender
                </button>
              </td>
            </tr>
          </template>
        </PatientSearch>

        <!-- Panel de información del paciente -->
        <RightPanel :registroId="selectedRegistroId" :mostrar="IsShowRightPanel" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navigation from '@/components/NavBar.vue'
import PatientSearch from '@/components/PlantillaTabla.vue'
import RightPanel from '@/components/SideBarPaciente.vue'
import { ref, onMounted, computed } from 'vue'
import axiosFunction from '@/Functions/axios'

let listaPacientes = ref([])
let sectorConsulta = ref()
let selectedRegistroId = ref(0)
let IsShowRightPanel = ref(false)
const stringBusqueda = ref('')

const listaPacientesFiltrados = computed(() => {
  return listaPacientes.value.filter((paciente) => {
    return (
      paciente.pacienteNombre.toLowerCase().includes(stringBusqueda.value.toLowerCase()) ||
      paciente.pacienteDocumento.toLowerCase().includes(stringBusqueda.value.toLowerCase())
    )
  })
})

onMounted(() => {
  // const pathParts = window.location.pathname.split('/').filter(Boolean)
  // const idSectorGuardia = pathParts[pathParts.length - 1]
  // console.log('ID del sector de guardia:', idSectorGuardia)
  listarPacientes(38)
})

function listarPacientes(id) {
  axiosFunction
    .get(`Guardia/pacientePorSector/${id}`)
    .then((resultado) => {
      // console.log('Resultado de traer las consultas de un paciente: ', resultado)
      listaPacientes.value = resultado.data.result.pacientes
      sectorConsulta.value = resultado.data.result.lugar
    })
    .catch((error) => {
      console.log('Error al traer las consultas: ', error)
    })
}

function selectPatient(id) {
  selectedRegistroId.value = id
  if (!IsShowRightPanel.value) {
    IsShowRightPanel.value = true
  }
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
