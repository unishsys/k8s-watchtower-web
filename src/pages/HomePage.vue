<template>
  <div style="margin-right: 15%;margin-left: 15%;">
    <q-page flex flex-center class="q-ma-lg">

      <p class="text-h5 q-pt-xl text-weight-light">Node Details</p>
      <div class="row no-wrap justify-around">
        <apexchart ref="chart" height="300" type="bar" :options="barChartOptions" :series="barChartOptions.series"
          class="col-grow">
        </apexchart>
        <apexchart type="pie" width="380" :options="piChartOptions.chartOptions" :series="piChartOptions.series"
          class="overflow-auto">
        </apexchart>
      </div>

      <q-dialog v-model="logdialog" persistent :maximized="maximizedToggle" transition-show="slide-up"
        transition-hide="slide-down">
        <q-card class="bg-primary--dark" @keyup.esc.prevent="closeLog" tabindex="0">
          <q-bar>
            <q-space />

            <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
              <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary">Maximize</q-tooltip>
            </q-btn>
            <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
              <q-tooltip v-if="maximizedToggle" class="bg-white text-primary">Minimize</q-tooltip>
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

      <div class="q-pt-xl">
        <p class="text-h5 q-pt-md text-weight-light">Pods Info</p>
        <q-table :rows="podTable" flat bordered row-key="name">

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="namespace" :props="props">
                {{ props.row.namespace }}
              </q-td>
              <q-td key="name" :props="props" @click.stop="getPodLogs(props.row)">
                <div class="neubutton"> {{ props.row.name }} </div>
              </q-td>
              <q-td key="restarts" :props="props">
                {{ props.row.restarts }}
              </q-td>
              <q-td key="cpu" :props="props">
                {{ parseInt(props.row.cpu / 1024) }}
              </q-td>
              <q-td key="memory" :props="props">
                {{ parseInt(props.row.memory / (1024 * 1024)) }} Mi
              </q-td>
              <q-td key="status" :props="props">
                <div v-if="props.row.status == 'Running'">
                  <q-icon name="check_circle" size="2em" color="green-12" />
                </div>
                <div v-else>
                  <q-icon name="error" size="2em" color="red-12" />
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <div class="q-pt-xl">
        <p class="text-h5 q-pt-xl text-weight-light">Nodes Info</p>
        <q-table flat bordered title="" :rows="nodeTable" row-key="nodeName" binary-state-sort>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="nodeName" :props="props">
                {{ props.row.nodeName }}
              </q-td>
              <q-td key="cpuQuantity" :props="props">
                {{ props.row.cpuQuantity }}
              </q-td>
              <q-td key="memoryQuantity" :props="props">
                {{ props.row.memoryQuantity }}
              </q-td>
              <q-td key="cpuUsage" :props="props">
                {{ parseInt(props.row.cpuUsage / 1024) }}
              </q-td>
              <q-td key="memoryUsage" :props="props">
                {{ parseInt(props.row.memoryUsage / (1024 * 1024)) }} Mi
              </q-td>
              <q-td key="podQuantity" :props="props">
                {{ props.row.podQuantity }}
              </q-td>
              <q-td key="containerCount" :props="props">
                {{ props.row.containerCount }}
              </q-td>
              <q-td key="ready" :props="props">
                <div v-if="props.row.ready">
                  <q-icon name="check_circle" size="2em" color="green-12" />
                </div>
                <div v-else>
                  <q-icon name="error" size="2em" color="red-12" />
                </div>
              </q-td>

              <q-td key="conditions" :props="props">
                <span v-for="condition in props.row.conditions" :key="condition.type">
                  {{ condition.message }} <br />
                </span>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </q-page>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import VueApexCharts from "vue3-apexcharts";

const $q = useQuasar();
const logdialog = ref(false);
const log = ref('')
const maximizedToggle = ref(false);
const nodeTable = ref([])
const podTable = ref([])
const socket = ref(null)
const apexchart = VueApexCharts
const piChartLabel = ref([])
const piChartOptions = ref({
  series: [],
  chartOptions: {
    labels: ["demo-control-plane", "demo-worker", "demo-worker2"],
    theme: {
      palette: 'palette4'
    },
    tooltip: {
      enabled: true,
      theme: "dark",
    },
    chart: {
      width: 380,
      type: 'pie',
    },
  }
})
const barChartOptions = ref({
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: "vertical",
      shadeIntensity: 0.5,
      gradientToColors: undefined,
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 0.7,
      stops: [0, 90, 100],
      colorStops: []
    }
  },
  dropShadow: {
    enabled: true,
    top: 0,
    left: 0,
    blur: 3,
    opacity: 0.5
  },
  theme: {
    palette: 'palette4'
  },
  tooltip: {
    enabled: true,
    theme: "dark",
  },
  chart: {
    type: 'bar'
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 4,
    }
  },
  series: [{
    name: "Total Containers",
    data: []
  }, {
    name: "Total CPU Usage",
    data: []
  }, {
    name: "Total Memory Usage",
    data: []
  }]
})


function getNodeInfo() {
  api.get(`/api/v1/nodes/`)
    .then((response) => {
      nodeTable.value = response.data.data
      barChartOptions.value.series[0].data = response.data.data.map(item => ({ x: item.nodeName, y: item.containerCount }));
      barChartOptions.value.series[1].data = response.data.data.map(item => ({ x: item.nodeName, y: parseInt(item.cpuUsage / (1024 * 1024)) }));
      // barChartOptions.value.series[2].data = response.data.data.map(item => ({ x: item.nodeName, y: parseInt(item.memoryUsage / (1024 * 1024 * 1024)) }));
      piChartOptions.value.series = response.data.data.map(item => (item.memoryUsage / (1024 * 1024)));
      piChartOptions.value.chartOptions.labels = response.data.data.map(item => item.nodeName);
    })
}


function getPodInfo() {
  api.get(`/api/v1/pods/`)
    .then((response) => {
      podTable.value = response.data.data
    })
}

function closeLog() {
  logdialog.value = false
  log.value = ''
  socket.value.close()
}

function getPodLogs(rowData) {
  let uri = `ws://${window.location.host}/api/v1/logs/pod/${rowData.namespace}/${rowData.name}`

  socket.value = new WebSocket(uri)

  logdialog.value = true
  log.value = ''

  socket.value.onmessage = (ev) => {
    log.value += `<p class="text text-body1">${ev.data}</p></br>`

    setTimeout(() => {
      let scrollableDiv = document.getElementById("logdata")
      var bottomElement = scrollableDiv.lastElementChild;
      bottomElement
        .scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  }

  socket.value.onerror = (err) => {
    socket.value.close()
    $q.notify({
      color: 'error',
      position: 'top-right',
      message: err.message,
      icon: 'report_problem'
    })
  }

}

onMounted(() => {
  getNodeInfo()
  getPodInfo()
})

</script>
