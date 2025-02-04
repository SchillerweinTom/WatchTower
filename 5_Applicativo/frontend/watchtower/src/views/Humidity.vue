<template>
    <DashboardLayout>
      <Card class="w-full">
        <CardHeader>
          <CardTitle>Humidity Over Time</CardTitle>
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
    Filler
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
    LineController,
    Filler
  );
  
  const chartData = ref({
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"],
    datasets: [
      {
        label: "Humidity (%)",
        data: [45, 42, 48, 50, 52, 48, 46],
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
  </script>
  