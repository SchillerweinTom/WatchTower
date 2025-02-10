<template>
  <DashboardLayout>
    <Card class="w-full">
      <CardHeader>
        <div class="flex justify-between">
          <CardTitle>Humidity Over Time</CardTitle>
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
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
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
const selectedChart = ref("hour");

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

const selectedLabel = computed(() => {
    return {
        hour: "Last Hour",
        day: "Last 24 Hours",
        week: "Last 7 Days",
    }[selectedChart.value];
});


const fetchHumidityData = async (type) => {
    try {
        const endpoint = {
            hour: "/humidity/lastHour",
            day: "/humidity/lastDay",
            week: "/humidity/lastWeek",
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
    fetchHumidityData(type);
};

onMounted(() => {
  fetchHumidityData(selectedChart.value);
});
</script>