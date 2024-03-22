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
          <div class="q-mb-md q-pr-xl">
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
                    <q-icon name="check_circle" size="2em" color="green-12" @click="getDeployStatus(props.row)" />
                  </div>
                  <div v-else>
                    <q-icon name="error" size="2rem" color="red-12" clickable @click="getDeployStatus(props.row)" />
                  </div>
                </q-td>

                <q-td key="createdAt" :props="props" :class="props.row.createdAt">
                  {{ props.row.createdAt }}
                </q-td>

              </q-tr>
            </template>
          </q-table>
        </div>

        <div class="q-ma-xl col-6 absolute-right">
          <VAceEditor style="margin-left: 15%;" v-model:value="content" lang="yaml" theme="tomorrow_night" :options="{
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
    fontSize: 15,
    minLines: 30,
    maxLines: 50,
  }" />

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
const options = ref([])
const alert = ref(false)
let errMsg = ''
let podName = ''


const content = ref('metadata:\n  annotations:\n    deployment.kubernetes.io/revision: \"2\"\n  creationTimestamp: \"2024-03-21T15:59:57Z\"\n  generation: 8\n  labels:\n    app: test1\n  managedFields:\n  - apiVersion: apps/v1\n    fieldsType: FieldsV1\n    fieldsV1:\n      f:metadata:\n        f:labels:\n          .: {}\n          f:app: {}\n      f:spec:\n        f:progressDeadlineSeconds: {}\n        f:revisionHistoryLimit: {}\n        f:selector: {}\n        f:strategy:\n          f:rollingUpdate:\n            .: {}\n            f:maxSurge: {}\n            f:maxUnavailable: {}\n          f:type: {}\n        f:template:\n          f:metadata:\n            f:labels:\n              .: {}\n              f:app: {}\n          f:spec:\n            f:containers:\n              k:{\"name\":\"nginx\"}:\n                .: {}\n                f:image: {}\n                f:imagePullPolicy: {}\n                f:name: {}\n                f:resources: {}\n                f:terminationMessagePath: {}\n                f:terminationMessagePolicy: {}\n            f:dnsPolicy: {}\n            f:restartPolicy: {}\n            f:schedulerName: {}\n            f:securityContext: {}\n            f:terminationGracePeriodSeconds: {}\n    manager: kubectl-create\n    operation: Update\n    time: \"2024-03-21T15:59:57Z\"\n  - apiVersion: apps/v1\n    fieldsType: FieldsV1\n    fieldsV1:\n      f:spec:\n        f:template:\n          f:spec:\n            f:containers:\n              k:{\"name\":\"nginx\"}:\n                f:resources:\n                  f:limits:\n                    .: {}\n                    f:cpu: {}\n                    f:memory: {}\n                  f:requests:\n                    .: {}\n                    f:cpu: {}\n                    f:memory: {}\n    manager: kubectl-edit\n    operation: Update\n    time: \"2024-03-22T00:51:27Z\"\n  - apiVersion: apps/v1\n    fieldsType: FieldsV1\n    fieldsV1:\n      f:metadata:\n        f:annotations:\n          .: {}\n          f:deployment.kubernetes.io/revision: {}\n      f:status:\n        f:availableReplicas: {}\n        f:conditions:\n          .: {}\n          k:{\"type\":\"Available\"}:\n            .: {}\n            f:lastTransitionTime: {}\n            f:lastUpdateTime: {}\n            f:message: {}\n            f:reason: {}\n            f:status: {}\n            f:type: {}\n          k:{\"type\":\"Progressing\"}:\n            .: {}\n            f:lastTransitionTime: {}\n            f:lastUpdateTime: {}\n            f:message: {}\n            f:reason: {}\n            f:status: {}\n            f:type: {}\n        f:observedGeneration: {}\n        f:readyReplicas: {}\n        f:replicas: {}\n        f:updatedReplicas: {}\n    manager: kube-controller-manager\n    operation: Update\n    subresource: status\n    time: \"2024-03-22T04:58:51Z\"\n  - apiVersion: apps/v1\n    fieldsType: FieldsV1\n    fieldsV1:\n      f:spec:\n        f:replicas: {}\n    manager: main\n    operation: Update\n    time: \"2024-03-22T04:58:51Z\"\n  name: test1\n  namespace: default\n  resourceVersion: \"71425\"\n  uid: b27164e2-c123-4264-8749-4762e4f0fb24\nspec:\n  progressDeadlineSeconds: 600\n  replicas: 1\n  revisionHistoryLimit: 10\n  selector:\n    matchLabels:\n      app: test1\n  strategy:\n    rollingUpdate:\n      maxSurge: 25%\n      maxUnavailable: 25%\n    type: RollingUpdate\n  template:\n    metadata:\n      creationTimestamp: null\n      labels:\n        app: test1\n    spec:\n      containers:\n      - image: nginx\n        imagePullPolicy: Always\n        name: nginx\n        resources:\n          limits:\n            cpu: 500m\n            memory: 128Mi\n          requests:\n            cpu: 250m\n            memory: 64Mi\n        terminationMessagePath: /dev/termination-log\n        terminationMessagePolicy: File\n      dnsPolicy: ClusterFirst\n      restartPolicy: Always\n      schedulerName: default-scheduler\n      securityContext: {}\n      terminationGracePeriodSeconds: 30\nstatus:\n  availableReplicas: 1\n  conditions:\n  - lastTransitionTime: \"2024-03-21T15:59:57Z\"\n    lastUpdateTime: \"2024-03-22T00:51:30Z\"\n    message: ReplicaSet \"test1-9b49fc5ff\" has successfully progressed.\n    reason: NewReplicaSetAvailable\n    status: \"True\"\n    type: Progressing\n  - lastTransitionTime: \"2024-03-22T04:01:53Z\"\n    lastUpdateTime: \"2024-03-22T04:01:53Z\"\n    message: Deployment has minimum availability.\n    reason: MinimumReplicasAvailable\n    status: \"True\"\n    type: Available\n  observedGeneration: 8\n  readyReplicas: 1\n  replicas: 1\n  updatedReplicas: 1\n');
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
