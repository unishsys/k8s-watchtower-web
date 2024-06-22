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
        <q-btn
          flat
          label="Ask AI?"
          color="secondary"
          @click="askAIError(errMsg)"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="dialog"
    persistent
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-primary--dark">
      <q-bar>
        <q-space />

        <q-btn
          dense
          flat
          icon="minimize"
          @click="maximizedToggle = false"
          :disable="!maximizedToggle"
        >
          <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary"
            >Maximize</q-tooltip
          >
        </q-btn>
        <q-btn
          dense
          flat
          icon="crop_square"
          @click="maximizedToggle = true"
          :disable="maximizedToggle"
        >
          <q-tooltip v-if="maximizedToggle" class="bg-white text-primary"
            >Minimize</q-tooltip
          >
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup @click="clearResp">
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div class="text-h6">Response</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div v-html="airesp"></div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="logdialog"
    persistent
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-primary--dark" @keyup.esc.prevent="closeLog" tabindex="0">
      <q-bar>
        <q-space />

        <q-btn
          dense
          flat
          icon="minimize"
          @click="maximizedToggle = false"
          :disable="!maximizedToggle"
        >
          <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary"
            >Maximize</q-tooltip
          >
        </q-btn>
        <q-btn
          dense
          flat
          icon="crop_square"
          @click="maximizedToggle = true"
          :disable="maximizedToggle"
        >
          <q-tooltip v-if="maximizedToggle" class="bg-white text-primary"
            >Minimize</q-tooltip
          >
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup @click="closeLog">
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div class="text-h6">Logs Streaming</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div id="logdata">
          <div v-html="log"></div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-page>
    <div style="margin-left: 4%; margin-right: 4%; margin-top: 2%">
      <div
        class="full-width row wrap justify-start items-start content-stretch"
      >
        <div class="col-6">
          <div class="q-mb-md q-pr-xl q-pt-xl">
            <q-select
              v-model="modelNs"
              :options="options"
              @update:model-value="getDeployByNs"
              label="Select Namespace"
            />
          </div>
          <q-table flat bordered title="Deploy" :rows="data" row-key="name">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td
                  key="name"
                  :props="props"
                  @click.stop="getDeploymentLogs(props.row)"
                >
                  <div class="neubutton">{{ props.row.name }}</div>
                </q-td>
                <q-td key="replicas" :props="props">
                  <div class="neubutton">{{ props.row.replicas }}</div>

                  <q-popup-edit
                    v-model="props.row.replicas"
                    title="Update Replica"
                    v-slot="scope"
                  >
                    <q-input
                      v-model="scope.value"
                      dense
                      autofocus
                      @keyup.enter="scope.set"
                      hint="Replica Count"
                    >
                      <template v-slot:after>
                        <q-btn
                          flat
                          dense
                          color="negative"
                          icon="cancel"
                          @click.stop.prevent="scope.cancel"
                        />

                        <q-btn
                          flat
                          dense
                          color="positive"
                          icon="check_circle"
                          @click.stop.prevent="scope.set"
                          @click="setScale(props.row)"
                          :disable="
                            scope.validate(scope.value) === false ||
                            scope.initialValue === scope.value
                          "
                        />
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

                <q-td
                  key="status"
                  :props="props"
                  :class="props.row.status"
                  style="align-content: center"
                >
                  <div v-if="props.row.status === 'success'">
                    <q-icon
                      name="check_circle"
                      size="2em"
                      color="green-12"
                      @click.stop="getDeployStatus(props.row)"
                    />
                  </div>
                  <div v-else>
                    <q-icon
                      name="error"
                      size="2em"
                      color="red-12"
                      clickable
                      @click.stop="getDeployStatus(props.row)"
                    />
                  </div>
                </q-td>

                <q-td
                  key="createdAt"
                  :props="props"
                  :class="props.row.createdAt"
                >
                  <div class="row">
                    <div class="text-center">
                      {{ props.row.createdAt.split("T")[0] }}
                    </div>
                    <q-icon
                      name="edit_square"
                      size="2em"
                      color="yellow-2"
                      @click.stop="getDeployYaml(props.row)"
                    />
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>

        <div class="q-ma-xl col-6 absolute-right">
          <div>
            <div
              class="row text-h5 text-weight-light q-mb-md"
              style="margin-left: 15%"
            >
              Editing
              <span class="q-ml-md text-weight-bold">{{ editTitle }}</span>
            </div>
            <VAceEditor
              style="margin-left: 15%"
              v-model:value="content"
              lang="yaml"
              theme="tomorrow_night"
              :options="{
                autoScrollEditorIntoView: true,
                copyWithEmptySelection: true,
                fontSize: 15,
                minLines: 30,
                maxLines: 50,
              }"
            />
          </div>
          <div class="row q-pa-md q-gutter-sm">
            <q-btn
              style="margin-left: 15%"
              color="secondary"
              label="Update Deployment"
              clickable
              @click="updateDeploy()"
            />
            <q-btn
              v-if="content && editTitle"
              style="margin-left: 15%"
              color="blue-14"
              label="Ask AI?"
              clickable
              @click="askAI()"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-tomorrow_night";

const $q = useQuasar();
const data = ref([]);
const modelNs = ref(null);
const editTitle = ref(null);
const options = ref([]);
const alert = ref(false);
const content = ref("");
const airesp = ref(null);
const dialog = ref(false);
const logdialog = ref(false);
const log = ref("");
const maximizedToggle = ref(false);
const socket = ref(null);
let errMsg = "";
let podName = "";

function getNamespaces() {
  api.get(`/api/v1/get-namespaces`).then((response) => {
    options.value = response.data.data;
  });
}

function getDeployByNs() {
  if (modelNs.value) {
    api
      .get(`/api/v1/deploy/${modelNs.value}`)
      .then((response) => {
        let resp = response.data.data;
        resp.forEach((obj) => {
          delete obj["labels"];
        });
        data.value = resp;
      })
      .catch((error) => {
        $q.notify({
          color: "error",
          position: "top-right",
          message: error.message,
          icon: "report_problem",
        });
      });
  }
}

function setScale(rowData) {
  const scale = parseInt(rowData.replicas, 10);
  api
    .post(`/api/v1/deploy/`, {
      namespace: modelNs.value,
      name: rowData.name,
      replicas: scale,
    })
    .then((response) => {
      let d = response.data;
      $q.notify({
        color: d.status,
        position: "top-right",
        message: d.msg + " -> " + rowData.replicas,
        icon: "done",
      });
      setTimeout(() => {
        getDeployByNs();
      }, 3000);
    })
    .catch((error) => {
      $q.notify({
        color: "error",
        position: "top-right",
        message: error.message,
        icon: "report_problem",
      });
    });
}

function getDeployYaml(rowData) {
  api
    .get(`/api/v1/deploy/${modelNs.value}/${rowData.name}/yaml`)
    .then((response) => {
      content.value = response.data.data;
      editTitle.value = rowData.name;
    })
    .catch((error) => {
      $q.notify({
        color: "error",
        position: "top-right",
        message: error.message,
        icon: "report_problem",
      });
    });
}

function updateDeploy() {
  console.log(content.value);
  api
    .post(
      `/api/v1/deploy/${modelNs.value}/${editTitle.value}/yaml`,
      { data: content.value },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((response) => {
      content.value = response.data.data;
      $q.notify({
        progress: true,
        color: response.data.status,
        position: "top-right",
        message: response.data.msg,
        icon: "done",
      });
      setTimeout(() => {
        getDeployByNs();
      }, 3000);
    })
    .catch((error) => {
      $q.notify({
        color: "error",
        position: "top-right",
        message: error.message,
        icon: "report_problem",
      });
    });
}

function getDeployStatus(rowData) {
  api
    .get(`/api/v1/deploy/${modelNs.value}/${rowData.name}`)
    .then((response) => {
      const msg = response.data;
      errMsg = generateErrMsg(msg);
    })
    .catch((error) => {
      $q.notify({
        color: "error",
        position: "top-right",
        message: error.message,
        icon: "report_problem",
      });
    })
    .finally(() => {
      alert.value = true;
    });
}

function generateErrMsg(podDetails) {
  let errorMessage = "";
  for (const pod of podDetails.data) {
    podName = pod.name;
    for (const container of pod.status) {
      if (!container.ready) {
        errorMessage += `${container.name} container state is not ready because of ${container.state.waiting.reason}: ${container.state.waiting.message}.`;
      }
    }
  }
  if (errorMessage === "") {
    errorMessage = "All containers are in a ready state.";
  }
  return errorMessage.trim();
}

async function askAI() {
  let doc = `you are an kubernetes and devops expert. for a given kubernetes deployment manifest in YAML format, you will provide only the missing best practices in htlm format use for code use pre tag and for text use p tag :\n---\n${content.value}`;

  const response = await fetch(`http://192.168.1.101:11434/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral",
      prompt: doc,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  airesp.value = "";
  dialog.value = true;
  const reader = response.body.getReader();

  // Function to read data chunks
  const readChunk = async () => {
    const { done, value } = await reader.read();
    if (done) {
      console.log("stream done");
      return;
    }
    const decoder = new TextDecoder("utf-8");
    const stringData = decoder.decode(value);
    const respData = JSON.parse(stringData);

    console.log(respData.response);
    airesp.value += respData.response;
    readChunk(); // Call itself recursively to read next chunk
  };

  readChunk(); // Start reading chunks
}

function clearResp() {
  airesp.value = null;
  dialog.value = false;
}

async function askAIError(msg) {
  let doc = `you are an kubernetes and devops expert. for a given kubernetes error message, you will provide most possible debugging points try to keep them as concise as possible in htlm format use <pre></pre> tag for all your respose, do not use title or heading:\n---\n${msg}`;
  const response = await fetch(`http://192.168.1.101:11434/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral",
      prompt: doc,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  airesp.value = "";
  dialog.value = true;
  const reader = response.body.getReader();

  // Function to read data chunks
  const readChunk = async () => {
    const { done, value } = await reader.read();
    if (done) {
      console.log("stream done");
      return;
    }
    const decoder = new TextDecoder("utf-8");
    const stringData = decoder.decode(value);
    const respData = JSON.parse(stringData);

    console.log(respData.response);
    airesp.value += respData.response;
    readChunk(); // Call itself recursively to read next chunk
  };

  readChunk(); // Start reading chunks
}

function closeLog() {
  logdialog.value = false;
  log.value = "";
  socket.value.close();
}

function getDeploymentLogs(rowData) {
  let uri = `ws://${window.location.host}/api/v1/logs/deploy/${modelNs.value}/${rowData.name}`;

  socket.value = new WebSocket(uri);

  logdialog.value = true;
  log.value = "";

  socket.value.onmessage = (ev) => {
    log.value += `<p class="text text-body1">${ev.data}</p></br>`;

    setTimeout(() => {
      let scrollableDiv = document.getElementById("logdata");
      var bottomElement = scrollableDiv.lastElementChild;
      bottomElement.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 300);
  };

  socket.value.onerror = (err) => {
    socket.value.close();
    $q.notify({
      color: "error",
      position: "top-right",
      message: err.message,
      icon: "report_problem",
    });
  };
}

onMounted(getNamespaces);
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
