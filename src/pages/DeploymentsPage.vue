<template>
  <q-dialog v-model="alert">
    <q-card>
      <q-card-section>
        <div class="text-h6">Pod: {{ podName }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ errMsg }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-page class="flex flex-center">
    <div>
      <div class="col">
        <q-select v-model="modelNs" :options="options" @update:model-value="getDeployByNs" label="Select Namespace" />
      </div>

      <q-table flat bordered title="Deploy" :rows="data" row-key="name" binary-state-sort>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="replicas" :props="props">
              <div class="neubutton">{{ props.row.replicas }}</div>

              <q-popup-edit v-model="props.row.replicas" title="Update Replica" v-slot="scope">
                <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" hint="Replica Count">
                  <template v-slot:after>
                    <q-btn flat dense color="negative" icon="cancel" @click.stop.prevent="scope.cancel" />

                    <q-btn flat dense color="positive" icon="check_circle" @click.stop.prevent="scope.set"
                      @click="setScale(props.row)"
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

            <q-td key="status" :props="props" :class="props.row.status" style="align-content: center;">

              <div v-if="props.row.status === 'success'">
                <q-icon name="check_circle" size="2rem" color="green-7" />
              </div>
              <div v-else>
                <q-icon name="error" size="2rem" color="red-7" clickable @click="getErrorMessage(props.row)" />
              </div>
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
const alert = ref(false)
let errMsg = ''
let podName = ''

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
        let resp = response.data.data
        resp.forEach(obj => {
          delete obj["labels"];
        });
        console.log(resp)
        data.value = resp
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

function setScale(rowData) {
  const scale = parseInt(rowData.replicas, 10)
  api.post(`/api/v1/deploy/`, {
    "namespace": modelNs.value,
    "name": rowData.name,
    "replicas": scale
  })
    .then((response) => {
      let d = response.data
      $q.notify({
        color: d.status,
        position: 'top-right',
        message: d.msg + " -> " + rowData.replicas,
        icon: 'done'
      })
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

function getErrorMessage(rowData) {


  api.get(`/api/v1/deploy/${modelNs.value}/${rowData.name}`)
    .then((response) => {
      const msg = response.data
      errMsg = generateErrMsg(msg)
    })
    .catch((error) => {
      $q.notify({
        color: 'error',
        position: 'top-right',
        message: error.message,
        icon: 'report_problem'
      })
    })
    .finally(() => {
      alert.value = true
    })

}

function generateErrMsg(podDetails) {
  let errorMessage = '';
  for (const pod of podDetails.data) {
    podName = pod.name
    for (const container of pod.status) {
      if (!container.ready) {
        errorMessage += `${container.name} container state is not ready because of ${container.state.waiting.reason}: ${container.state.waiting.message}.`;
      }
    }
  }
  if (errorMessage === '') {
    errorMessage = 'All containers are in a ready state.';
  }
  return errorMessage.trim();
}

onMounted(getNamespaces)

</script>
