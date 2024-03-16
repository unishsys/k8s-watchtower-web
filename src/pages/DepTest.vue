<template>
  <q-page class="flex flex-center">
    <div>
      <div class="col">
        <q-select v-model="modelNs" :options="options" @update:model-value="getDeployByNs" label="Select Namespace" />
      </div>
      <!-- <div class="q-pa-md col">
        <q-table :rows="data" row-key="name" flat bordered clickable title="Deployments" @row-click="getTable" />
      </div> -->

      <q-table flat bordered title="Deploy" :rows="data" :columns="columns" row-key="name" binary-state-sort>
        <template v-slot:body="props">
          <q-tr :props="props" :class="(props.row.status == 'success') ? 'bg-dark text-white' : 'bg-error text-black'">
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="replicas" :props="props">
              {{ props.row.replicas }}
              <q-popup-edit v-model="replicaCount" title="Update Replica" v-slot="scope">
                <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" hint="Replica Count">
                  <template v-slot:after>
                    <q-btn flat dense color="negative" icon="cancel" @click.stop.prevent="scope.cancel" />

                    <q-btn flat dense color="positive" icon="check_circle" @click.stop.prevent="scope.set"
                      @click="getValue"
                      :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value" />
                  </template>
                </q-input>

              </q-popup-edit>
            </q-td>

            <q-td key="availableReplicas" :props="props">
              {{ props.row.availableReplicas }}
            </q-td>

            <q-td key="readyReplicas" :props="props">
              {{ props.row.readyReplicas }}
            </q-td>

            <q-td key="status" :props="props" :class="props.row.status">
              {{ props.row.status }}
            </q-td>

            <q-td key="createdAt" :props="props" :class="props.row.createdAt">
              {{ props.row.createdAt }}
            </q-td>

          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'


const $q = useQuasar()
const data = ref([])
const modelNs = ref(null)
const options = ref([])
const replicaCount = ref()

function getNamespaces() {
  api.get(`/api/v1/get-namespaces`)
    .then((response) => {
      options.value = response.data.data
    })
}

function getDeployByNs() {
  if (modelNs.value) {
    api.get(`/api/v1/deploy/${modelNs.value}`)
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

function getValue() {
  console.log("called: ", replicaCount.value)
}

function getTable() {
  console.log("row", replicaCount.value)
  // const scale = parseInt(row.replicas, 10)
  // api.post(`/api/v1/deploy/`, {
  //   "namespace": modelNs.value,
  //   "name": row.name,
  //   "replicas": scale
  // })
  //   .then((response) => {
  //     let d = response.data
  //     $q.notify({
  //       color: d.status,
  //       position: 'top-right',
  //       message: d.msg,
  //       icon: 'done'
  //     })
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //     $q.notify({
  //       color: 'error',
  //       position: 'top-right',
  //       message: error.message,
  //       icon: 'report_problem'
  //     })
  //   })
}

onMounted(getNamespaces)





</script>
