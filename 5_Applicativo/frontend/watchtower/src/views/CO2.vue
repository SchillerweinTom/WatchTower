<template>
    <DashboardLayout>
      <Card class="w-full">
        <CardHeader>
          <CardTitle>CO₂ Levels Over Time (ppm)</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart :chartData="chartData" :options="chartOptions" />
        </CardContent>
      </Card>
    </DashboardLayout>
  </template>
  
  <script setup>
  import { ref } from "vue";
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
  
  const chartData = ref({
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"],
    datasets: [
      {
        label: "CO₂ (ppm)",
        data: [400, 420, 450, 500, 480, 430, 410],
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
  </script>