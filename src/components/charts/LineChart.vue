<template>
  <div ref="chartRef" class="line-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{
  data: { x: string; y: number }[];
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    renderChart();
  }
});

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true }
);

const renderChart = () => {
  if (chartInstance) {
    const option = {
      xAxis: {
        type: 'category',
        data: props.data.map((item) => item.x),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: props.data.map((item) => item.y),
          type: 'line',
        },
      ],
    };
    chartInstance.setOption(option);
  }
};
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 400px;
}
</style>
