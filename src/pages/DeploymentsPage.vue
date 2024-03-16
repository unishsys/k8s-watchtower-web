<template>
  <q-page class="flex flex-center">
    <div>
      <div class="col">
        <q-select v-model="model" :options="options" @update:model-value="getDeployByNs" label="Select Namespace" />
      </div>
      <div class="q-pa-md col">
        <q-table :rows="data" row-key="name" flat bordered clickable title="Deployments" @row-click="getTable" />
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
      api.get(`/api/v1/get-namespaces`)
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
          .catch((error) => {
            $q.notify({
              color: 'error',
              position: 'top-right',
              message: error.message,
              icon: 'report_problem'
            })
          })
      }
    }

    function getTable(_, row) {
      $q.dialog({
        title: 'Update Replicas',
        message: 'Deployment: ' + row.name,
        prompt: {
          model: row.replicas,
          isValid: val => val != row.replicas,
          type: 'number'
        },
        cancel: true,
        persistent: true
      }).onOk(scaleStr => {
        const scale = parseInt(scaleStr, 10)
        api.post(`/api/v1/deploy/`, {
          "namespace": model.value,
          "name": row.name,
          "replicas": scale
        })
          .then((response) => {
            let d = response.data
            $q.notify({
              color: d.status,
              position: 'top-right',
              message: d.msg,
              icon: 'done'
            })
          })
          .catch((error) => {
            console.log(error)
            $q.notify({
              color: 'error',
              position: 'top-right',
              message: error.message,
              icon: 'report_problem'
            })
          })
      })
    }

    onMounted(getNamespaces)

    return { data, model, options, getNamespaces, getDeployByNs, getTable }
  }

}
</script>
