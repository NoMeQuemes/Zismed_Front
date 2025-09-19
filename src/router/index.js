import { createRouter, createWebHistory } from 'vue-router'
import index from '@/views/IndexGuardiaView.vue'
import HistoriaClinicaView from '@/views/HistoriaClinicaView.vue'

// Detecta automáticamente la base según la URL actual del navegador
function getBasePath() {
  const parts = window.location.pathname.split('/')
  // ['', 'GuardiaRegistro', 'Guardia', '35'] → base debe ser '/GuardiaRegistro/Guardia/35/'
  const base = parts.slice(0, 4).join('/')
  return base.endsWith('/') ? base : base + '/'
}

const base = getBasePath()

const router = createRouter({
  history: createWebHistory(base),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: index,
    },
    {
      path: '/CreateConsulta/:pacienteId/:prestadorId/:guardiaRegistroId',
      name: 'CreateConsulta',
      component: () => import('../views/EvolucionGuardiaView.vue'),
    },
    {
      path: '/HistoriaClinica/:guardiaRegistroId',
      name: 'HistoriaClinica',
      component: HistoriaClinicaView,
    },
  ],
})

export default router
