<template>
  <q-page flex flex-center class="q-ma-lg">

    <p class="text-h5 q-pt-xl text-weight-light">Node Details</p>
    <div class="full-width row no-wrap justify-around">
      <apexchart ref="chart" height="300" type="bar" :options="barChartOptions" :series="barChartOptions.series"
        class="col-grow">
      </apexchart>
      <apexchart type="pie" width="380" :options="piChartOptions.chartOptions" :series="piChartOptions.series"
        class="overflow-auto">
      </apexchart>
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

      <div class="q-pt-xl">
        <p class="text-h5 q-pt-md text-weight-light">Pods Info</p>
        <q-table :rows="podTable" flat bordered row-key="name">

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="namespace" :props="props">
                {{ props.row.namespace }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.name }}
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
                <div v-if="props.row.staus == Running">
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import VueApexCharts from "vue3-apexcharts";

const nodeTable = ref([])
const podTable = ref([])
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

onMounted(() => {
  getNodeInfo()
  getPodInfo()
})

</script>
