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
      <VAceEditor v-model:value="content" lang="yaml" theme="tomorrow_night" :options="{
          autoScrollEditorIntoView: true,
          copyWithEmptySelection: true,
          fontSize: 15,
          minLines: 40,
          maxLines: 80,
        }" />
    </div>

    <div class="q-pa-md q-gutter-sm">
      <q-btn color="secondary" label="Update ConfigMap" clickable @click="updateCm()" />
    </div>
  </q-page>

</template>

<script setup>

import { useQuasar } from 'quasar'
import { onMounted, ref } from 'vue';
import { api } from 'boot/axios'

// ace imports
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-tomorrow_night';


const content = ref('');
const optionsCm = ref([])
const optionsNs = ref([])
const model = ref([])
const modelCm = ref([])
const $q = useQuasar()


function getCMByNS() {
  api.get(`/api/v1/cm/${model.value}`)
    .then((response) => {
      optionsCm.value = response.data.data
    })
    .catch((error) => {
      $q.notify({
        color: 'negative',
        position: 'top-right',
        message: error.message,
        icon: 'report_problem'
      })
    })
}

function getCmByName() {
  api.get(`/api/v1/cm/${model.value}/${modelCm.value}`)
    .then((response) => {
      content.value = response.data.data
    })
    .catch((error) => {
      $q.notify({
        color: 'positive',
        position: 'top-right',
        message: error.message,
        icon: 'report_problem'
      })
    })
}

function updateCm() {
  api.post(`/api/v1/cm/${model.value}/${modelCm.value}`, content.value, {
    headers: {
      "Content-Type": "text/plain"
    }
  })
    .then((response) => {
      $q.notify({
        color: response.data.status,
        position: 'top-right',
        message: response.data.msg,
        icon: 'done'
      })
    })
    .catch((error) => {
      $q.notify({
        color: "error",
        position: 'top-right',
        message: error.message,
        icon: 'report_problem'
      })
    })
}

onMounted(async () => { // onMounted is a client-only lifecycle hook

  api.get("/api/v1/get-namespaces")
    .then((response) => {
      optionsNs.value = response.data.data
    })
    .catch((error) => {
      $q.notify({
        color: 'negative',
        position: 'top-right',
        message: error.message,
        icon: 'report_problem'
      })
    })
});

</script>
