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
      <button class="btn-blue" @click="abrirModal">Indicar/Recetar</button>
      <button class="btn-blue">Solicitar estudios</button>
      <button class="btn-blue" @click="((modal = true), DerivacionInternaGet())">Derivar</button>
      <button class="btn-blue" @click="abrirModalSalida">Dar alta</button>
      <router-link :to="{ name: 'Index' }">
        <button
          class="btn-red"
          @click="datosGuardiaStore.LimpiarSeleccionGuardiaRegistroIdPaciente()"
        >
          Cerrar consulta
        </button>
      </router-link>
    </div>
  </div>

<!-- Modal de indicación médica -->
  <div v-if="mostrarModal" class="modal-backdrop">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h4 class="modal-title">💊 Indicación médica</h4>
        <button class="btn-close" @click="cerrarModal"></button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Médico -->
        <div class="mb-3">
          <label class="form-label fw-bold">Médico</label>
          <input type="text" class="form-control" v-model="medico" disabled />
        </div>
        <div class="row mb-3">
          <div class="autocomplete">
            <label class="form-label mr-3">Medicamento</label>
            <!-- Input -->
            <input
              type="text"
              v-model="medicamentoQuery"
              @input="buscarMedicamentos"
              placeholder="Buscar medicamento..."
              class="autocomplete-input"
            />
            <input type="hidden" v-model="medicamentoId" />
            <!-- Dropdown -->
            <ul v-if="sugerencias.length" class="autocomplete-list">
              <li
                v-for="item in sugerencias"
                :key="item.value"
                @click="seleccionarMedicamento(item)"
                class="autocomplete-item"
              >
                {{ item.label }}
              </li>
            </ul>
          </div>
        </div>
        <div class="row mb-3">
          <label class="form-label fw-bold mr-3">Vía</label>
          <select class="form-control" v-model="via">
            <option disabled value="" selected>Seleccione una vía</option>
            <option v-for="via in vias" :key="via.medicacionViaId" :value="via.medicacionViaId">
              {{ via.nombre }}
            </option>
          </select>
        </div>
        <!-- Cantidad + unidad -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label fw-bold mr-3">Cantidad</label>
            <input type="number" class="form-control" v-model="cantidad" placeholder="Ej: 2" />
          </div>
        </div>
        <!-- Indicación médica -->
        <div class="mb-3">
          <label class="form-label fw-bold">Indicación médica</label>
          <textarea
            class="form-control"
            rows="3"
            v-model="indicacion"
            placeholder="Ej.: Tomar cada 8 horas con agua"
          ></textarea>
        </div>

        <!-- Botón agregar -->
        <div class="mb-3 text-end">
          <button class="btn btn-success" @click="agregarIndicacion">➕ Agregar</button>
        </div>

        <!-- Tabla -->
        <table class="table table-bordered table-hover align-middle">
          <thead class="table-primary">
            <tr>
              <th class="mr-3">Medicamento</th>
              <th class="mr-3">Vía</th>
              <th class="text-center">Cantidad</th>
              <!-- <th class="text-center mr-3">Unidad</th> -->
              <th class="text-center">Indicación</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody v-if="indicaciones.length != 0">
            <!-- Si hay registros, los muestro -->
            <tr v-for="(item, i) in indicaciones" :key="i">
              <td class="text-center mr-3">{{ item.ArticuloDroga }}</td>
              <td class="text-center mr-3">{{ item.Tipo }}</td>
              <td class="text-center mr-3">{{ item.Cantidad }}</td>
              <!-- <td class="text-center mr-3">{{ item.unidad }}</td> -->
              <td class="text-center mr-3">{{ item.ObservacionMedico }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-danger" @click="confirmarEliminar(i)">
                  🗑 Eliminar
                </button>
              </td>
            </tr>

            <!-- Si no hay registros, muestro solo el mensaje -->
            <tr v-if="indicaciones.length === 0">
              <td colspan="6" class="text-center text-muted">Ningún dato disponible</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn btn-primary" @click="cerrarModal">Aceptar</button>
        <!-- <button class="btn btn-primary" @click="guardarIndicaciones">Guardar</button> -->
      </div>
    </div>
  </div>

  <!-- Modal de derivación -->
  <ModalDerivar :show="modal" @close="modal = false">
    <h2 class="text-xl font-bold mb-4">Derivación Interna</h2>
    <!-- <p class="mb-4">
      Este es el contenido de tu modal. Puedes poner formularios, texto, lo que quieras.
    </p> -->
    <form>
      <div class="mb-4">
        <label class="block mb-2">Desde:</label>
        <input
          type="text"
          class="w-full border p-2 rounded disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
          :value="DerivacionInternaGET.guardiaSectorActualNombre"
          disabled
        />
      </div>
      <div class="mb-4">
        <label class="block mb-2">Hacia:</label>
        <select
          class="w-full border p-2 rounded"
          v-model="DerivacionInternaDto.guardiaSectorHastaId"
        >
          <option>Seleccione un sector</option>
          <option
            v-for="sector in DerivacionInternaGET.sectoresDestino"
            :key="sector.guardiaSectorId"
            :value="sector.guardiaSectorId"
          >
            {{ sector.nombre }}
          </option>
        </select>
      </div>
      <div class="mb-4">
        <label class="block mb-2">Médico guardia:</label>
        <select
          v-model="guardiaSectorHastaId"
          class="w-full border p-2 rounded disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
        >
          <option
            v-for="prestador in DerivacionInternaGET.prestadores"
            :key="prestador"
            :value="prestador.value"
          >
            {{ prestador.text }}
          </option>
        </select>
      </div>
      <div class="mb-4">
        <label class="block mb-2">Fecha de derivación:</label>
        <input type="datetime-local" class="w-full border p-2 rounded" />
      </div>
    </form>
    <div class="flex justify-end">
      <button
        class="px-4 py-2 rounded bg-blue-600 text-white"
        @click="((modal = false), DerivacionInternaPost())"
      >
        Derivar
      </button>
    </div>
  </ModalDerivar>

<!--Modal alta-->
  <div v-if="mostrarModalSalida" class="modal-backdrop">
    <div class="modal-container">
      <!-- Encabezado -->
      <div class="modal-header">
        <h3>Alta Médica</h3>
      </div>

      <!-- Cuerpo -->
      <div class="modal-body">
        <form @submit.prevent="guardar">
          <!-- Tipo de salida -->
          <div class="row mb-3">
            <div class="form-group">
              <label for="tiposSalida" class="form-label fw-bold mr-3">Tipo de salida</label>
              <select v-model="TipoAltaID" class="form-control">
                <option value="0" selected disabled>Seleccione...</option>
                <option v-for="tipo in tiposSalida" :key="tipo.tipoAltaId" :value="tipo.tipoAltaId">
                  {{ tipo.nombre }}
                </option>
              </select>
            </div>
          </div>

          <!-- Médico deriva -->
          <div class="row mb-3">
            <div class="form-group">
              <label for="medico" class="form-label fw-bold mr-3">Médico deriva</label>
              <select v-model="prestadorSeleccionado" class="form-control">
                <option value="" disabled selected>Seleccione...</option>
                <option v-for="p in prestadores" :key="p.prestadorID" :value="p.prestadorId">
                  {{ p.nombre }}
                </option>
              </select>
            </div>
          </div>

          <!-- Fecha derivación -->
          <div class="row mb-3">
            <div class="form-group">
              <label for="fecha" class="form-label fw-bold mr-3">Fecha de derivación</label>
              <input
                type="datetime-local"
                v-model="fechaDerivacion"
                id="fecha"
                class="form-control"
              />
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="cerrarModalAlta">Cancelar</button>
        <button class="btn btn-primary" @click="guardarAlta">Grabar</button>
        <!-- <button class="btn btn-primary" @click="guardarAlta">Grabar</button> -->
      </div>
    </div>
  </div>

</template>

<script setup>
import DiagnosticoSearch from '../components/Guardia/DiagnosticoSearch.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'   // 👈 IMPORTARLOS SIEMPRE DE ACA
import Navigation from '@/components/NavBar.vue'
import ModalDerivar from '@/components/Guardia/ModalDerivar.vue'
import axiosFunction from '@/Functions/axios'
import { useDatosGuardiaStore } from '@/stores/DatosGuardia'
import Swal from 'sweetalert2'

const datosGuardiaStore = useDatosGuardiaStore()
const router = useRouter()
// Variables reactivas y de estado
const route = useRoute()
const pacienteId = route.params.pacienteId
const prestadorId = route.params.prestadorId
const guardiaRegistroId = route.params.guardiaRegistroId
const modal = ref(false)
let DerivacionInternaGET = ref({})

const DerivacionInternaDto = reactive({
  guardiaRegistroId: null,
  guardiaSectorDesdeId: null,
  guardiaSectorHastaId: null,
  guardiaCamaId: null,
  prestadorId: null,
})

const ParametrosDerivacionInterna = reactive({
  derivaOtraCama: 0,
  usuario: null,
  prestadorIdSeleccionado: null,
})
let guardiaSectorHastaId = ref(null) // Este es el v-model del select

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
const mostrarModal = ref(false)
// Opciones que se cargarían desde el backend
const tiposSalida = ref([])
const medico = ref('xxx - Yanet Villalba') // lo podés setear dinámico
const medicamento = ref('')
const via = ref('')
const cantidad = ref('')
const unidad = ref('')
const indicacion = ref('')
//const indicaciones = ref([])
const indicaciones = ref([])
const vias = ref([])
const medicamentoQuery = ref('')
const medicamentoId = ref(0)
const sugerencias = ref([])
const medicamentoSeleccionado = ref(null)
const prestadores = ref([])
const prestadorSeleccionado = ref(0)


// Props o estado global para mostrar modal
const mostrarModalSalida = ref(false)
// Función para cargar los datos del paciente al montar el componente
onMounted(async () => {
  ;((((axiosFunction
    .get(`Guardia/api/pacientes/${pacienteId}`)
    .then((resultado) => {
      if (!resultado || !resultado.data) {
        throw new Error('No se pudo cargar el paciente')
      }
      paciente.value = resultado.data
    })
    .catch((error) => {
      console.log(error)
      error.value = error.message
    })
    .finally(() => {
      cargando.value = false
    }),
  axiosFunction
    .get(`Guardia/GetMedicacionVias`)
    .then((resultado) => {
      vias.value = resultado.data
    })
    .catch((error) => {
      console.error('Error cargando vías:', error)
    })
    .finally(() => {
      cargando.value = false
    })),
  axiosFunction.get(`Guardia/GetPrestadoresAlta/${guardiaRegistroId}`).then((resp) => {
    if (resp.data.success) {
      prestadores.value = resp.data.prestadores
      prestadorSeleccionado.value = resp.data.selected
    }
  })),
  axiosFunction.get('Guardia/GetTiposAlta').then((resp) => {
    if (resp.data.success) {
      tiposSalida.value = resp.data.tiposAlta
    }
  })),
    autoSaveInterval)
})

const autoSaveInterval = setInterval(
  () => {
    if (
      consulta.value.diagnosticoPrincipalId != null &&
      consulta.value.diagnosticoPrincipalId != 0
    ) {
      guardarConsulta(false)
      mostrarToast()
    }
  },
  1 * 60 * 1000,
)
const mostrarToast = () => {
  Swal.fire({
    toast: true,
    position: 'bottom-end', // abajo a la derecha
    icon: 'success',
    title: 'Se guardó de forma automática',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })
}
// Métodos
function guardarAlta() {
  // Aquí llamas al endpoint con axios

  axiosFunction
    .post('/Guardia/SalidaGuardiaGral', {
      GuardiaRegistroId: guardiaRegistroId,
      GuardiaSectorId: 35,
      PrestadorId: prestadorId,
      Fecha: fechaDerivacion.value,
      TipoAltaID: TipoAltaID.value,
      Motivo: Motivo.value,
    })
    .then((res) => {
      if (res.data.ok) {
        // redirigir a Index
        Swal.fire({
            icon: 'success',
            title: 'Guardado!',
            text: 'Se generó el alta correctamente.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#007bff',
          }).then(() => {
              router.push('/')
          })
        // window.location.href = 'http://localhost:5173/Zismed-Front-Vue/'

      } else {
        alert(res.data.message || 'Error al guardar')
      }
    })
    .catch((err) => {
      console.error(err)
      alert('Error en el servidor')
    })
}

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
  if (consulta.value.diagnosticoPrincipalId != null && consulta.value.diagnosticoPrincipalId != 0) {
    console.log(idConsulta.value)
    const dto = {
      ConsultaId: idConsulta.value,
      pacienteId: pacienteId,
      turnoId: null,
      guardiaRegistroId: guardiaRegistroId,
      guardiaSectorId: null,
      interconsultaId: null,
      camaId: null,
      prestadorId: prestadorId,
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
    console.log(dto)
    axiosFunction
      .post(`Guardia/consulta`, dto)
      .then((resultado) => {
        idConsulta.value = resultado.data.result.idConsulta
        //let jsonDetalles = JSON.stringify(indicaciones.value)
        //console.log(idConsulta.value)
        if (isAlert) {
          guardarIndicacionesMedicas()
        }
        if (isAlert) {
          Swal.fire({
            icon: 'success',
            title: 'Guardado!',
            text: 'La consulta se creó correctamente.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#007bff',
          })
          //alert('Consulta guardada con éxito')
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la consulta',
        })
        console.log('Error al guardar consulta: ', error)
      })
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Campo requerido',
      text: 'Debe ingresar un diagnóstico principal',
      confirmButtonText: 'OK',
      confirmButtonColor: '#007bff',
    })
    //alert('El Diagnóstico principal es obligatorio.')
  }
}
const guardarIndicacionesMedicas = () => {
  axiosFunction
    .post(`Guardia/GuardarIndicaciones`, {
      consultaId: idConsulta.value,
      jsonDetalle: JSON.stringify(indicaciones.value),
      vistaMedico: true,
      idEnfermero: 0,
      idPacinete: pacienteId.value,
      idPrestadorIndica: prestadorId.value,
      guardiaRegistroId: guardiaRegistroId.value,
      guardiaSectorId: 0,
    })
    .then((response) => {
      if (response.data.success) {
        return true
      } else {
        return false
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la consulta',
      })
      console.log('Error al guardar consulta: ', error)
    })
}

function abrirModal() {
  mostrarModal.value = true
}
function abrirModalSalida() {
  mostrarModalSalida.value = true
}
function cerrarModal() {
  mostrarModal.value = false
}

function agregarIndicacion() {
  //console.log(medicamentoQuery.value)
  if (!medicamentoQuery.value || !via.value || !cantidad.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Complete lo campos',
      text: 'Complete los datos',
    })
    return //alert('Complete los datos')
  }
  const viaSelec = vias.value.find((v) => v.medicacionViaId === via.value)

  indicaciones.value.push({
    MedicacionPacienteDetalleID: 0,
    MedicacionPacienteID: pacienteId,
    FarmaciaArticuloID: medicamentoId.value,
    NuevaDro: null,
    MultiDro: null,
    TipoEstadoMedicacionPacienteDetalleID: 0,
    ArticuloNombre: medicamentoQuery.value,
    ArticuloPresentacion: medicamentoQuery.value,
    ArticuloDroga: medicamentoQuery.value,
    Cantidad: cantidad.value,
    Nuevo: 0,
    Editado: 0,
    Anulado: 0,
    ViaTipoID: viaSelec.medicacionViaId,
    Tipo: via.value,
    ObservacionMedico: indicacion.value,
    ObservacionEnfermero: '',
    ObservacionRevierte: '',
  })

  //console.log(indicaciones.value)
  // limpiar campos
  medicamento.value = ''
  via.value = ''
  cantidad.value = ''
  unidad.value = ''
  indicacion.value = ''
  medicamentoQuery.value = ''
  medicamentoId.value = 0
}
function confirmarEliminar(index) {
  Swal.fire({
    title: '¿Está seguro?',
    text: 'Esta indicación se eliminará permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6', // azul
    cancelButtonColor: '#d33', // rojo
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      this.eliminarIndicacion(index)

      Swal.fire('Eliminado', 'La indicación fue eliminada correctamente.', 'success')
    }
  })
}

function eliminarIndicacion(i) {
  indicaciones.value.splice(i, 1)
}
function guardarIndicaciones() {
  console.log('Indicaciones guardadas:', indicaciones)
  this.cerrarModal()
}
function buscarMedicamentos() {
  if (medicamentoQuery.value.length < 2) {
    sugerencias.value = []
    return
  }
  axiosFunction
    .get(`Guardia/BuscarMedicamentos?query=${medicamentoQuery.value}`)
    .then((resultado) => {
      sugerencias.value = resultado.data
      console.log(sugerencias.value)
    })
    .catch((error) => {
      console.error('Error cargando vías:', error)
    })
    .finally(() => {
      cargando.value = false
    })
}
function seleccionarMedicamento(item) {
  medicamentoSeleccionado.value = item
  medicamentoQuery.value = item.label
  medicamentoId.value = item.value
  sugerencias.value = []
}
// Modelo de formulario

const TipoAltaID = ref(0)
const medicoId = ref('')
const fechaDerivacion = ref(new Date().toISOString().slice(0, 16))
const Motivo = ref('')
// Métodos
const cerrarModalAlta = () => {
  mostrarModalSalida.value = false
}

//-------------------------------------------------------------------------
function DerivacionInternaGet() {
  // Trae los datos para llenar el formulario de derivación
  let usuarioID = datosGuardiaStore.InformacionUsuario.userName
  axiosFunction
    .get(`Guardia/DerivacionInternaGet/${guardiaRegistroId}/${usuarioID}`)
    .then((resultado) => {
      DerivacionInternaGET.value = resultado.data

      DerivacionInternaDto.guardiaRegistroId = datosGuardiaStore.GuardiaRegistroID
      DerivacionInternaDto.guardiaSectorDesdeId = parseInt(datosGuardiaStore.GuardiaSectorID)
      DerivacionInternaDto.guardiaSectorHastaId = 0
      // DerivacionInternaDto.guardiaCamaId = 0
      DerivacionInternaDto.prestadorId = parseInt(resultado.data.prestadorIdUsuarioActual) ?? null

      ParametrosDerivacionInterna.usuario = usuarioID
      ParametrosDerivacionInterna.prestadorIdSeleccionado = parseInt(resultado.data.prestadorIdUsuarioActual) ?? null

      let prestadorPorDefecto =
        resultado.data.prestadorIdUsuarioActual == null
          ? null
          : resultado.data.prestadorIdUsuarioActual

      guardiaSectorHastaId.value = prestadorPorDefecto // Preselecciona el recomendado
    })
    .catch((error) => {
      console.log('Error al traer las derivaciones: ', error)
    })
}

function DerivacionInternaPost() {
  // Envía los datos del formulario de derivación
  console.log('Datos a enviar:', DerivacionInternaDto, ParametrosDerivacionInterna)
  axiosFunction.post('Guardia/create', DerivacionInternaDto,
  {
    params: ParametrosDerivacionInterna
  })
    .then((resultado) => {
      console.log('Derivación realizada con éxito:', resultado.data)
      alert('Derivación realizada con éxito')
    })
    .catch((error) => {
      console.log('Error al realizar la derivación: ', error)
      alert('Error al realizar la derivación')
    })
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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-contenido {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 600px;
  max-width: 90%;
}
.modal {
  background: rgba(0, 0, 0, 0.5);
}
.modal {
  display: none;
  background: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block;
}
/* Fondo modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
/* Contenedor modal */
.modal-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}
/* Fondo modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

/* Contenedor modal */
.modal-container {
  background: white;
  border-radius: 10px;
  width: 85%;
  max-width: 950px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.modal-header {
  background: #0d6efd;
  color: white;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  margin: 0;
}
.btn-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: white;
  cursor: pointer;
}

/* Body */
.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* Footer */
.modal-footer {
  background: #f8f9fa;
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #dee2e6;
}

/* Botones */
.btn {
  border-radius: 6px;
  padding: 6px 14px;
}
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px 15px; /* Espaciado interno */
  border-bottom: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}
.autocomplete {
  position: relative;
  width: 300px;
}

.autocomplete-input {
  width: 100%;
}
/*
.autocomplete-input:focus {
  border-color: #0a0a0a;
} */

.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.autocomplete-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* evita desborde */
}

.autocomplete-item:hover {
  background-color: #f1f5ff;
  color: #007bff;
}
</style>
