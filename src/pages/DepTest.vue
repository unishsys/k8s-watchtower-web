<template>
  <q-page class="flex flex-center">
    <q-form v-model="svcForm" @submit="onSubmit" @reset="onReset" class="q-gutter-md">

      <q-select v-model="svcForm.namespace" :options="optionsNs" @update:model-value="getDeployByNs"
        label="Select Namespace" />
      <q-select v-model="svcForm.deployName" :options="optionsDeploy" label="Select Deployment" />

      <q-input filled type="number" v-model="svcForm.servicePort" label="Service Port *" lazy-rules />
      <q-input filled type="number" v-model="svcForm.containerPort" label="Container Port *" lazy-rules />
      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'


const $q = useQuasar()
const optionsDeploy = ref([])
const optionsNs = ref([])
const svcForm = ref({
  namespace: null,
  deployName: null,
  servicePort: null,
  containerPort: null
})

function getNamespaces() {
  api.get(`/api/v1/get-namespaces`)
    .then((response) => {
      optionsNs.value = response.data.data
    })
}

function getDeployByNs() {
  api.get(`/api/v1/deploy/${svcForm.value.namespace}`)
    .then((response) => {
      optionsDeploy.value = response.data.data.map(item => item.name)
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

function onReset() {
  svcForm.value = {}
}
function onSubmit(evt) {
  console.log(evt)
  console.log(svcForm.value)
}

onMounted(getNamespaces)

</script>
