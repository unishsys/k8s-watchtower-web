<template>
  <q-page flex flex-center class="q-ma-lg">

    <div>
      <p class="text-h5 q-pt-xl text-weight-light">Containers Per Node</p>
      <apexchart ref="chart" height="300" type="bar" :options="chartOptions" :series="chartOptions.series"></apexchart>
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import VueApexCharts from "vue3-apexcharts";

const nodeTable = ref([])
const apexchart = VueApexCharts
const chartOptions = ref({
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
  }]
})


function getNodeInfo() {
  api.get(`/api/v1/node/`)
    .then((response) => {
      nodeTable.value = response.data.data
      chartOptions.value.series[0].data = response.data.data.map(item => ({ x: item.nodeName, y: item.containerCount }));
    })
}


onMounted(() => {
  getNodeInfo()
})

</script>
