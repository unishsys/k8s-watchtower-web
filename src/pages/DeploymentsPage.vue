<template>
  <q-page class="flex flex-center">
    <div>
      <div class="col">
        <q-select v-model="model" :options="options" @update:model-value="getDeployByNs" label="Select Namespace" />
      </div>
      <div class="q-pa-md col">
        <q-table :rows="data" row-key="name" flat bordered />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

export default {
  setup() {
    const $q = useQuasar()
    const data = ref([])
    const model = ref(null)
    const options = ref([])

    function getNamespaces() {
      api.get("/api/v1/get-namespaces")
        .then((response) => {
          options.value = response.data.data
        })
    }

    function getDeployByNs() {
      if (model.value) {
        api.get(`/api/v1/deploy/${model.value}`)
          .then((response) => {
            data.value = response.data.data
          })
          .catch(() => {
            $q.notify({
              color: 'negative',
              position: 'top',
              message: 'Loading failed',
              icon: 'report_problem'
            })
          })
      }
    }

    onMounted(getNamespaces)

    return { data, model, options, getNamespaces, getDeployByNs }
  }
}
</script>
