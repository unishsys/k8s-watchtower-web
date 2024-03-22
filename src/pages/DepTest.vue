<template>
  <div>
    <apexchart ref="chart" height="300" type="bar" :options="options" :series="series"></apexchart>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { getCssVar } from 'quasar'
import VueApexCharts from "vue3-apexcharts";

export default defineComponent({
  name: 'ApexBar',
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      options: {
        chart: {
          id: 'apex-bar'
        },
        colors: [getCssVar('primary'), getCssVar('secondary'), getCssVar('negative')],
        xaxis: {
          categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
        },
        plotOptions: {
          bar: {
            horizontal: true,
            columnWidth: '55%',
            endingShape: 'rounded'
          }
        }
      },
      series: [{
        name: 'series-1',
        data: [30, 40, 45, 50, 49, 60, 70, 91]
      }]
    }
  },
  mounted() {
    this.renderChart()
  },
  methods: {
    renderChart() {
      const chart = new ApexCharts(this.$refs.chart, this.options)
      chart.render()
    }
  }
})
</script>
