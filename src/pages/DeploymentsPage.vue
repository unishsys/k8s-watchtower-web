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
  <q-page>
    <div style="margin-left: 4%;margin-right: 4%; margin-top: 2%">
      <div class="full-width row wrap justify-start items-start content-stretch">

        <div class="col-6">
          <div class="q-mb-md q-pr-xl q-pt-xl">
            <q-select v-model="modelNs" :options="options" @update:model-value="getDeployByNs"
              label="Select Namespace" />
          </div>
          <q-table flat bordered title="Deploy" :rows="data" row-key="name">
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
                    <q-icon name="check_circle" size="2em" color="green-12" @click.stop="getDeployStatus(props.row)" />
                  </div>
                  <div v-else>
                    <q-icon name="error" size="2em" color="red-12" clickable @click.stop="getDeployStatus(props.row)" />
                  </div>
                </q-td>

                <q-td key="createdAt" :props="props" :class="props.row.createdAt">
                  <div class="row">
                    <div class="text-center"> {{ props.row.createdAt.split("T")[0] }} </div>
                    <q-icon name="edit_square" size="2em" color="yellow-2" @click.stop="getDeployYaml(props.row)" />
                  </div>

                </q-td>

              </q-tr>
            </template>
          </q-table>
        </div>

        <div class="q-ma-xl col-6 absolute-right">

          <div>
            <div class="row text-h5 text-weight-light q-mb-md" style="margin-left: 15%;">Editing <span
                class="q-ml-md text-weight-bold">{{ editTitle }}</span></div>
            <VAceEditor style="margin-left: 15%;" v-model:value="content" lang="yaml" theme="tomorrow_night" :options="{
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
    fontSize: 15,
    minLines: 30,
    maxLines: 50,
  }" />

          </div>
          <div class="q-pa-md q-gutter-sm">
            <q-btn style="margin-left: 15%;" color="secondary" label="Update Deployment" clickable
              @click="updateDeploy()" />
          </div>
        </div>

      </div>



    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-tomorrow_night';


const $q = useQuasar()
const data = ref([])
const modelNs = ref(null)
const editTitle = ref("")
const options = ref([])
const alert = ref(false)
let errMsg = ''
let podName = ''


const content = ref("");
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
      setInterval(() => {
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

function getDeployYaml(rowData) {
  api.get(`/api/v1/deploy/${modelNs.value}/${rowData.name}/yaml`)
    .then((response) => {
      content.value = response.data.data
      editTitle.value = rowData.name
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


function updateDeploy() {
  console.log(content.value)
  api.post(`/api/v1/deploy/${modelNs.value}/${editTitle.value}/yaml`, { "data": content.value }, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((response) => {
      content.value = response.data.data
      $q.notify({
        progress: true,
        color: response.data.status,
        position: 'top-right',
        message: response.data.msg,
        icon: 'done'
      })
      setInterval(() => {
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

function getDeployStatus(rowData) {
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
