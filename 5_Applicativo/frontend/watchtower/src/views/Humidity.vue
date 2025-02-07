<template>
  <DashboardLayout>
    <Card class="w-full">
      <CardHeader>
        <CardTitle>Humidity Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart v-if="loaded" :chartData="chartData" :options="chartOptions" />
      </CardContent>
    </Card>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { LineChart } from "vue-chart-3";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LineController,
  Filler
} from "chart.js";
import DashboardLayout from "@/components/layout.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/router/axios";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LineController,
  Filler
);

const loaded = ref(false);
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Humidity (%)",
      data: [],
      borderColor: "#334dd4",
      backgroundColor: "rgba(51, 77, 212, 0.2)",
      fill: true,
      tension: 0.3,
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      suggestedMin: 30,
      suggestedMax: 70,
      ticks: {
        stepSize: 5,
      },
    },
  },
});

const fetchHumidityData = async () => {
  try {
    const response = await api.get("/humidity/g1");
    const data = response.data;

    chartData.value.labels = data.map(entry => entry.time);
    chartData.value.datasets[0].data = data.map(entry => entry.value);
    loaded.value = true;
  } catch (error) {
    console.error("Failed to fetch humidity data:", error);
  }
};

onMounted(() => {
  fetchHumidityData();
});
</script>