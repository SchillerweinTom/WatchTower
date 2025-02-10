<template>
  <DashboardLayout>
    <Card class="w-full">
      <CardHeader>
        <div class="flex justify-between">
          <CardTitle>CO₂ Levels Over Time (ppm)</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline">{{ selectedLabel }}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="changeChart('hour')">Last Hour</DropdownMenuItem>
              <DropdownMenuItem @click="changeChart('day')">Last 24 Hours</DropdownMenuItem>
              <DropdownMenuItem @click="changeChart('week')">Last 7 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <LineChart v-if="loaded" :chartData="chartData" :options="chartOptions" />
      </CardContent>
    </Card>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
const selectedChart = ref("hour");


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

const selectedLabel = computed(() => {
  return {
    hour: "Last Hour",
    day: "Last 24 Hours",
    week: "Last 7 Days",
  }[selectedChart.value];
});


const fetchCo2Data = async (type) => {
  try {
    const endpoint = {
      hour: "/co2/lastHour",
      day: "/co2/lastDay",
      week: "/co2/lastWeek",
    }[type];

    const token = localStorage.getItem("token");

    const response = await api.get(endpoint, {
      headers: {
        Authorization: token,
      },
    });
    const data = response.data;

    chartData.value.labels = data.map(entry => entry.time);
    chartData.value.datasets[0].data = data.map(entry => entry.value);
    loaded.value = true;
  } catch (error) {
    console.error(`Failed to fetch ${type} humidity data:`, error);
  }
};

const changeChart = (type) => {
  selectedChart.value = type;
  loaded.value = false;
  fetchCo2Data(type);
};

onMounted(() => {
  fetchCo2Data(selectedChart.value);
});
</script>