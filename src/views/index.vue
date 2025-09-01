<template>
  <!-- <div class="bg-gray-50 font-sans"> Con este cambio se quita el modo oscuro por defecto -->
  <div class="bg-gray-50 font-sans">
    <div class="min-h-screen flex flex-col">
      <Navigation />
      <div class="flex flex-1">
        <PatientSearch
          :columnas="['N°', 'Paciente', 'Ingreso', 'Médico que recibe', 'Estado', 'Acciones']"
          :datos="listaPacientes"
        >
          <template #row="{ item, index }">
            <tr>
              <td class="py-4">{{ index + 1 }}</td>
              <td class="py-4">{{ item.pacienteNombre }}</td>
              <td class="py-4">{{ item.fechaIngreso }}</td>
              <td class="py-4">{{ item.prestadorRecibe.trim() }}</td>
              <td class="py-4">{{ item.estado == null ? 'Sin Estado' : item.estado }}</td>
              <td class="py-4">
                <button class="bg-blue-500 text-white px-2 py-1 rounded" @click="selectPatient(item.guardiaRegistroID); mostrarRightPanel(true)">Atender</button>
              </td>
            </tr>
          </template>
        </PatientSearch>

        
        <RightPanel :registroId="selectedRegistroId"/>

      </div>
    </div>
  </div>
</template>

<script setup>
import Navigation from '@/components/navigation.vue'
import PatientSearch from '@/components/patientsearch.vue'
import RightPanel from '@/components/rightpanel.vue'
import { ref, onMounted } from 'vue'
import axiosFunction from '@/Functions/axios'

let listaPacientes = ref([])
let informacionPaciente = ref(null)
let consultasPaciente = ref({})
let evolucionPaciente = ref({})
let registroId = 1718482
let institucionId = null
let selectedRegistroId = ref(0)

onMounted(() => {
  listarPacientes(38)
})

function listarPacientes(id) {
  axiosFunction
    .get(`Guardia/pacientePorSector/${id}`)
    .then((resultado) => {
      // console.log('Resultado de traer las consultas de un paciente: ', resultado)
      listaPacientes.value = resultado.data.result
    })
    .catch((error) => {
      console.log('Error al traer las consultas: ', error)
    })
}

function selectPatient(id) {
  selectedRegistroId.value = id
}
</script>
