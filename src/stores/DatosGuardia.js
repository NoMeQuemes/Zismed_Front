import { defineStore } from 'pinia'
import axiosFunction from '@/Functions/axios'
import { ref } from 'vue'

export const useDatosGuardiaStore = defineStore(
  'datosGuardia',
  () => {
    // Acá van los datos de la url que vienen desde Zismed
    const URL = window.location.pathname
    const UrlSegmentada = URL.split('/').filter(Boolean)
    let UsuarioLogueado = UrlSegmentada[UrlSegmentada.length - 1]
    let GuardiaSectorID = UrlSegmentada[UrlSegmentada.length - 2]

    let InformacionUsuario = ref({})
    let GuardiaRegistroID = ref(null)
    // Función para traer la información del usuario logueado en Zismed
    function TraerInformacionUsuario() {
      axiosFunction
        .get(`Admin/GetInformacionUsuario/${UsuarioLogueado}`)
        .then((resultado) => {
          InformacionUsuario.value = resultado.data.result
          console.log('Información del usuario logueado en Zismed: ', InformacionUsuario.value)
        })
        .catch((error) => {
          console.log('Error al traer la información de el usuario logueado', error)
        })
    }

    // Persistencia del GuardiaRegistroID
    function SeleccionarGuardiaRegistroIdPaciente(id) {
      GuardiaRegistroID.value = id
      console.log('GuardiaRegistroID seleccionado: ', GuardiaRegistroID.value)
    }

    function LimpiarSeleccionGuardiaRegistroIdPaciente() {
      GuardiaRegistroID.value = null
    }

    return {
      TraerInformacionUsuario,
      SeleccionarGuardiaRegistroIdPaciente,
      LimpiarSeleccionGuardiaRegistroIdPaciente,
      InformacionUsuario,
      GuardiaSectorID,
      UsuarioLogueado,
      GuardiaRegistroID,
    }
  },
  {
    persist: {
      paths: ['GuardiaRegistroID'], //Solo persisto esta propiedad
    },
  },
)
