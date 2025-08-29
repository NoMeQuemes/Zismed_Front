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
              <td>{{ index + 1 }}</td>
              <td>{{ item.pacienteNombre }}</td>
              <td>{{ item.fechaIngreso }}</td>
              <td>{{ item.prestadorRecibe.trim() }}</td>
              <td>{{ item.estado == null ? 'Sin Estado' : item.estado }}</td>
              <td>
                <button class="bg-blue-500 text-white px-2 py-1 rounded">Atender</button>
              </td>
            </tr>
          </template>
        </PatientSearch>

        <RightPanel />
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
</script>
