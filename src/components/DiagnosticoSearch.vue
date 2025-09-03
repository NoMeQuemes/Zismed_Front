<template>
  <div class="diagnostico-search mb-3 w-100">
    <label class="form-label fw-bold d-block mb-1">Diagnóstico principal</label>

    <input
      v-model="query"
      @input="buscarDiagnosticos"
      type="text"
      class="form-control w-100"
      placeholder="Buscar CIE-10 / SNOMED..."
    />

    <!-- Dropdown resultados -->
    <ul
      v-if="resultados.length > 0"
      class="list-group position-absolute mt-1 shadow-sm w-100"
      style="z-index: 1050; max-height: 220px; overflow-y: auto"
    >
      <li
        v-for="diag in resultados"
        :key="diag.diagnosticosConsultasId"
        class="list-group-item list-group-item-action"
        @click="seleccionarDiagnostico(diag)"
      >
        <strong>{{ diag.diagnosticosConsultasId }}</strong> - {{ diag.nombre }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'DiagnosticoSearch',
  data() {
    return {
      query: '',
      resultados: [],
      timeout: null,
    }
  },
  methods: {
    async buscarDiagnosticos() {
      clearTimeout(this.timeout)

      if (this.query.length < 3) {
        this.resultados = []
        return
      }

      this.timeout = setTimeout(async () => {
        try {
          const url = new URL('https://localhost:7296/api/Guardia/diagnosticos/search')
          url.searchParams.set('query', this.query)
          url.searchParams.set('iosep', 'false')

          const res = await fetch(url.toString())
          const data = await res.json()
          console.log('Diagnósticos recibidos:', data)
          this.resultados = data.result || []
        } catch (err) {
          console.error('Error buscando diagnósticos:', err)
          this.resultados = []
        }
      }, 400)
    },

    seleccionarDiagnostico(diag) {
      this.query = `${diag.diagnosticosConsultasId} - ${diag.nombre}`
      this.resultados = []
      this.$emit('seleccionado', diag)
    },
  },
}
</script>
<style scoped>
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
</style>
