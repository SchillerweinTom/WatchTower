<template>
    <DashboardLayout>
      <Card class="w-full">
        <CardHeader>
          <CardTitle>CO₂ Levels Over Time (ppm)</CardTitle>
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
    LineController
  );
  const loaded = ref(false);
  const chartData = ref({
    labels: [],
    datasets: [
      {
        label: "CO₂ (ppm)",
        data: [],
        borderColor: "#82ca9d",
        backgroundColor: "rgba(130, 202, 157, 0.2)",
        fill: false,
        tension: 0.3,
      },
    ],
  });
  
  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        suggestedMin: 350,
        suggestedMax: 550,
        ticks: {
          stepSize: 50,
        },
      },
    },
  });

  const fetchCo2Data = async () => {
  try {
    const response = await api.get("/co2/g1");
    const data = response.data;

    chartData.value.labels = data.map(entry => entry.time);
    chartData.value.datasets[0].data = data.map(entry => entry.value);
    loaded.value = true;
  } catch (error) {
    console.error("Failed to fetch CO2 data:", error);
  }
};

onMounted(() => {
  fetchCo2Data();
});
  </script>