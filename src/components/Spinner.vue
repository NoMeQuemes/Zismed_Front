<template>
  <Loading
    :active="isLoading"
    :can-cancel="canCancel"
    :is-full-page="isFullPage"
    @update:active="updateLoadingState"
  />
</template>

<script>
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

export default {
  name: 'SpinnerComponent',
  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },
    canCancel: {
      type: Boolean,
      default: false,
    },
    isFullPage: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Loading,
  },
  methods: {
    updateLoadingState(newValue) {
      this.$emit('update:isLoading', newValue)
    },
  },
}
</script>
