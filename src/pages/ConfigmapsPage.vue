<template>
  <q-page class="">
    <div>
      <div class="q-pa-md">
        <q-select v-model="model" :options="optionsNs" @update:model-value="getCMByNS" label="Select Namespace" />
      </div>

      <div class="q-pa-md q-pb-xl">
        <q-select v-model="modelCm" :options="optionsCm" @update:model-value="getCmByName" label="Select ConfigMap" />
      </div>
    </div>

    <div>
      <VAceEditor ref="aceRef" v-model:value="content" theme="dracula" style="height: 400px;" :options="{
          useWorker: true,
          enableBasicAutocompletion: true,
          enableSnippets: true,
          enableLiveAutocompletion: true,
        }" />
    </div>

  </q-page>

</template>

<script setup>

import { onMounted, ref } from 'vue';
import { api } from 'boot/axios'

// ace imports
import { VAceEditor } from 'vue3-ace-editor';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-dracula';
import modeYamlUrl from 'ace-builds/src-noconflict/mode-yaml?url';
ace.config.setModuleUrl('ace/mode/yaml', modeYamlUrl);

import workerYamlUrl from 'ace-builds/src-noconflict/worker-yaml?url';
ace.config.setModuleUrl('ace/mode/yaml_worker', workerYamlUrl);

import snippetsYamlUrl from 'ace-builds/src-noconflict/snippets/yaml?url';
ace.config.setModuleUrl('ace/snippets/yaml', snippetsYamlUrl);

const content = ref('');
const optionsCm = ref([])
const optionsNs = ref([])
const model = ref([])
const modelCm = ref([])


function getCMByNS() {
  api.get(`/api/v1/cm/${model.value}`)
    .then((response) => {
      optionsCm.value = response.data.data
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

function getCmByName() {
  api.get(`/api/v1/cm/${model.value}/${modelCm.value}`)
    .then((response) => {
      content.value = response.data.data
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

onMounted(async () => { // onMounted is a client-only lifecycle hook

  api.get("/api/v1/get-namespaces")
    .then((response) => {
      optionsNs.value = response.data.data
    })
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem'
      })
    })
});

</script>
