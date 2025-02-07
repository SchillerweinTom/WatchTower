<template>
    <DashboardLayout>
        <Card class="w-full">
            <CardHeader>
                <div class="flex justify-between">
                    <CardTitle>Temperature Over Time</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <Button variant="outline">{{ selectedLabel }}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem @click="changeChart('hour')">Last Hour</DropdownMenuItem>
                            <DropdownMenuItem @click="changeChart('day')">Last 24 Hours</DropdownMenuItem>
                            <DropdownMenuItem @click="changeChart('week')">Last 7 Days Max</DropdownMenuItem>
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
import DashboardLayout from "@/components/layout.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { LineChart } from "vue-chart-3";
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, CategoryScale } from "chart.js";
import api from "@/router/axios";

ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip);

const loaded = ref(false);
const selectedChart = ref("hour");

const chartData = ref({
    labels: [],
    datasets: [
        {
            label: "Temperature (°C)",
            data: [],
            borderColor: "rgb(255, 65, 74)",
            backgroundColor: "rgba(255, 65, 74, 0.5)",
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
            suggestedMin: 15,
            suggestedMax: 40,
            ticks: {
                stepSize: 5,
            },
        },
    },
    plugins: {
        legend: { display: true },
    },
});

const selectedLabel = computed(() => {
    return {
        hour: "Last Hour",
        day: "Last 24 Hours",
        week: "Last 7 Days Max",
    }[selectedChart.value];
});

const fetchTemperatureData = async (type) => {
    try {
        const endpoint = {
            hour: "/temperature/lastHour",
            day: "/temperature/lastDay",
            week: "/temperature/lastWeek",
        }[type];

        const response = await api.get(endpoint);
        const data = response.data;

        chartData.value.labels = data.map(entry => entry.time);
        chartData.value.datasets[0].data = data.map(entry => entry.value);
        loaded.value = true;
    } catch (error) {
        console.error(`Failed to fetch ${type} temperature data:`, error);
    }
};

const changeChart = (type) => {
    selectedChart.value = type;
    loaded.value = false;
    fetchTemperatureData(type);
};

onMounted(() => {
    fetchTemperatureData(selectedChart.value);
});
</script>