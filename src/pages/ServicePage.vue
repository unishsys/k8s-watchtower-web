<template>
  <q-page class="flex flex-center">
    <q-form v-model="svcForm" @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <div class="row q-gutter-md">
        <q-select v-model="svcForm.namespace" :options="optionsNs" @update:model-value="getDeployByNs"
          label="Select Namespace" filled style="width: 180px;" />
        <div v-if="svcForm.namespace">
          <q-select v-model="svcForm.name" :options="optionsDeploy" label="Select Deployment" filled
            style="width: 180px;" />
        </div>
      </div>
      <div v-if="svcForm.name" class="row q-gutter-md">
        <q-input filled type="number" v-model="svcForm.containerPort" label="Container Port *" lazy-rules
          style="width: 180px;" />
        <q-input filled type="number" v-model="svcForm.servicePort" label="Service Port *" lazy-rules
          style="width: 180px;" />
      </div>
      <div v-if="svcForm.containerPort && svcForm.servicePort" class="row q-gutter-md">
        <q-select :options="optionsProtocol" v-model="svcForm.protocol" label="Service Protocol" filled
          style="width: 180px;" />
        <q-select :options="optionsType" v-model="svcForm.type" label="Service Type" filled style="width: 180px;" />
      </div>

      <div v-if="svcForm.protocol && svcForm.type" class="row q-gutter-md">
        <q-btn label="Submit" type="submit" color="primary" class="q-pr-md" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>

      <div v-if="svcForm.namespace">
        <q-table title="Services" :rows="serviceTable" row-key="name" flat bordered>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="name" :props="props">
                {{ props.row.name }}
              </q-td>
              <q-td key="type" :props="props">
                {{ props.row.type }}
              </q-td>
              <q-td key="clusterIp" :props="props">
                {{ props.row.clusterIp }}
              </q-td>
              <q-td key="externalIp" :props="props">
                {{ props.row.externalIp }}
              </q-td>
              <q-td key="ports" :props="props">
                {{ props.row.ports }}
              </q-td>
              <q-td key="createdAt" :props="props">
                {{ props.row.createdAt }} <q-btn icon="delete" @click="onDelete(props.row)" color="red-12"
                  class="q-ml-lg"></q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
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
const deployResp = ref([])
const serviceTable = ref([])
const optionsProtocol = ["TCP", "UDP"]
const optionsType = ["NodePort", "LoadBalancer", "ClusterIP"]

const svcForm = ref({
  "name": null,
  "namespace": null,
  "labels": {
    "app": null
  },
  "containerPort": null,
  "servicePort": null,
  "protocol": "TCP",
  "selector": {
    "app": null
  },
  "type": null
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
      deployResp.value = response.data.data
    })
    .catch((error) => {
      $q.notify({
        color: 'error',
        position: 'top-right',
        message: error.message,
        icon: 'report_problem'
      })
    })

  api.get(`/api/v1/svc/${svcForm.value.namespace}`)
    .then((response) => {
      serviceTable.value = response.data.data
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

function onDelete(row) {
  // Implement deletion logic here
  console.log("Delete clicked for row:", row);
  api.delete(`/api/v1/svc/${svcForm.value.namespace}/${row.name}`)
    .then((_) => {
      $q.notify({
        color: 'success',
        position: 'top-right',
        message: "Service Deleted: " + row.name,
        icon: 'done'
      })
      setTimeout(() => {
        getDeployByNs()
      }, 3000)
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
function onSubmit() {

  const label = deployResp.value.find(item => item.name === svcForm.value.name)


  svcForm.value.labels = label.labels
  svcForm.value.selector = label.labels

  svcForm.value.containerPort = parseInt(svcForm.value.containerPort, 10)
  svcForm.value.servicePort = parseInt(svcForm.value.servicePort, 10)

  api.post(`/api/v1/svc/`, svcForm.value)
    .then((resp) => {
      $q.notify({
        color: resp.data.status,
        position: 'top-right',
        message: resp.data.msg + ": " + resp.data.data.metadata.name,
        icon: 'done'
      })
      setTimeout(() => {
        getDeployByNs()
      }, 3000)
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

onMounted(getNamespaces)

</script>
