<template>
  <!-- Header -->
  <div>
    <!-- <h3>Evolución de Guardia</h3>
    <small>Registro clínico y órdenes</small> -->
    <Navigation>
      <template #Sector> <p class="text-xl font-semibold">Evolución de Guardia</p></template>
      <template #Subtitulo><p>Registro clínico y órdenes</p></template>
    </Navigation>
  </div>
  <div class="guardia-container">
    <!-- Estado de carga -->
    <div v-if="cargando">Cargando datos del paciente...</div>

    <!-- Error -->
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- Datos del paciente -->
    <div v-else-if="paciente" class="paciente-info">
      <div class="paciente-datos">
        <!-- <span class="paciente-id">{{ paciente.pacienteId }}</span> -->
        <span class="paciente-nombre">{{ paciente.nombre }}</span>
      </div>
      <div class="paciente-nivel">
        <span class="nivel">N2 Urgente</span>
      </div>
    </div>

    <!-- Panel principal -->
    <div class="main-panel">
      <div class="textareas-container">
        <textarea
          v-model="consulta.evolucion"
          placeholder="Evolución"
          @input="guardarConsulta(false)"
        ></textarea>
        <textarea
          v-model="consulta.indicacion"
          placeholder="Indicación"
          @input="guardarConsulta(false)"
        ></textarea>
        <textarea
          v-model="consulta.presuntivo"
          placeholder="Diagnóstico Presuntivo"
          @input="guardarConsulta(false)"
        ></textarea>
      </div>
      <!-- Panel lateral -->
      <div class="side-panel">
        <!-- Diagnóstico -->
        <div class="card">
          <DiagnosticoSearch @seleccionado="setDiagnostico" />
        </div>

        <!-- Órdenes rápidas -->
        <div class="card">
          <label>Órdenes rápidas</label>
          <div class="ordenes">
            <button @click="agregarOrden('Hemograma')">Labo: Hemograma</button>
            <button @click="agregarOrden('Suero')">Suero terapia</button>
            <button @click="agregarOrden('Rx Abdomen')">Rx Abdomen</button>
            <button @click="agregarOrden('ORS + tto')">ORS + tto</button>
          </div>
        </div>

        <!-- Checklist -->
        <div class="card">
          <label>Checklists</label>
          <ul>
            <li><input type="checkbox" /> Vómitos en pediatría</li>
            <li><input type="checkbox" /> Abdomen agudo</li>
            <li><input type="checkbox" /> Deshidratación</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer con acciones -->
    <div class="footer">
      <button class="btn-blue" @click="guardarConsulta(true)">Guardar</button>
      <button class="btn-blue">Indicar/Recetar</button>
      <button class="btn-blue">Solicitar estudios</button>
      <button class="btn-blue">Derivar</button>
      <button class="btn-blue">Dar alta</button>
      <router-link :to="{ name: 'Index' }">
        <button class="btn-red">Cerrar consulta</button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import DiagnosticoSearch from '../components/Guardia/DiagnosticoSearch.vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Navigation from '@/components/NavBar.vue'

// Variables reactivas y de estado
const route = useRoute()
const pacienteId = route.params.pacienteId

const paciente = ref(null)
const cargando = ref(true)
const error = ref(null)
const consulta = ref({
  evolucion: '',
  diagnostico: '',
  indicacion: '',
  presuntivo: '',
  ordenes: [],
  diagnosticoPrincipalId: 0,
  diagnosticoDescripcion: null,
})
const idConsulta = ref(0)

// Función para cargar los datos del paciente al montar el componente
onMounted(async () => {
  try {
    if (!pacienteId) {
      throw new Error('No se recibió pacienteId en la URL')
    }
    const res = await fetch(
      `http://168.226.219.57:3004/Zismed_APIs/api/Guardia/api/pacientes/${pacienteId}`,
    )
    if (!res.ok) throw new Error('No se pudo cargar el paciente')
    paciente.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
})

// Métodos
function agregarOrden(orden) {
  if (!consulta.value.ordenes.includes(orden)) {
    consulta.value.ordenes.push(orden)
  }
}

function setDiagnostico(diag) {
  consulta.value.diagnosticoPrincipalId = diag.diagnosticosConsultasId ?? diag.id ?? 0
  consulta.value.diagnosticoDescripcion =
    diag.nombre ?? `${diag.codigo} - ${diag.descripcion}` ?? null
  console.log('Diagnóstico seleccionado:', consulta.value)
}

async function guardarConsulta(isAlert = false) {
  const dto = {
    ConsultaId: idConsulta.value,
    pacienteId: pacienteId,
    turnoId: null,
    guardiaRegistroId: null,
    guardiaSectorId: null,
    interconsultaId: null,
    camaId: null,
    prestadorId: 5303,
    servicioId: null,
    diagnosticoPrincipalId: consulta.value.diagnosticoPrincipalId,
    diagnosticoSecundarioId: 0,
    evolucion: consulta.value.evolucion,
    obraSocialId: 0,
    presuntivo: consulta.value.presuntivo,
    prescripcion: consulta.value.ordenes.join(', '),
    visible: true,
    institucionId: 3,
    indicacion: consulta.value.indicacion,
    consultaIdoriginal: null,
    psiquiatrico: false,
    migradoJardin: false,
    diagnosticoSnomed: null,
    informe: null,
    diagnosticoPrincipalVar: consulta.value.diagnosticoDescripcion,
  }

  try {
    const response = await fetch('http://168.226.219.57:3004/Zismed_APIs/api/Guardia/consulta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    idConsulta.value = data.result.idConsulta
    console.log('Respuesta:', data.result.idConsulta)
    if (isAlert) {
      alert('Consulta guardada con éxito')
    }
  } catch (error) {
    console.error('Error al guardar consulta:', error)
    alert('Error al guardar consulta')
  }
}
</script>

<style scoped>
.guardia-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: 'Segoe UI', sans-serif;

  /* 👇 Hace que use toda la pantalla */
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}

/* Header */
.header {
  background: #003d80;
  color: white;
  padding: 0.5rem 1rem;
}
.header small {
  display: block;
  font-size: 0.8rem;
}

/* Paciente info */
.paciente-info {
  display: flex;
  justify-content: space-between;
  background: #f8f8f8;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.paciente-datos {
  font-weight: bold;
}
.paciente-nivel {
  background: #ffe8c6;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
}

/* Main panel */
.main-panel {
  display: flex;
  flex-direction: row; /* mantiene el panel lateral a la derecha */
  gap: 1rem;
  width: 100%;
}

.textareas-container {
  display: flex;
  flex-direction: column; /* 👈 fuerza apilado */
  gap: 1rem;
  flex: 2; /* ocupa más espacio que el lateral */
}

.textareas-container textarea {
  width: 100%;
  min-height: 150px;
  resize: none;
  padding: 0.5rem;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.side-panel {
  flex: 1; /* ocupa menos espacio */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  border: 1px solid #ddd;
  padding: 0.8rem;
  border-radius: 6px;
  background: #fafafa;
}
.card label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
}
.card input {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

/* Órdenes rápidas */
.ordenes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.ordenes button {
  background: #f0f7ff;
  border: 1px solid #007bff;
  color: #007bff;
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  font-size: 0.85rem;
  cursor: pointer;
}
.ordenes button:hover {
  background: #007bff;
  color: white;
}

/* Footer botones */
.footer {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
button {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-gray {
  background: #6c757d;
  color: white;
}
.btn-blue {
  background: #007bff;
  color: white;
}
.btn-red {
  background: #dc3545;
  color: white;
}
button:hover {
  opacity: 0.9;
}
.main-panel {
  display: flex;
  gap: 1rem;
  flex: 1; /* 👈 se estira para ocupar toda la altura restante */
}
/* textarea {
  flex: 2;
  min-height: 100%;
} */
textarea {
  width: 100%;
  display: block;
  margin-bottom: 1rem; /* espacio entre ellos */
  height: 40px;
}

.side-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
