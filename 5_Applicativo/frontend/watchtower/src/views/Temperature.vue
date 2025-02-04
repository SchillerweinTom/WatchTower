<template>
    <DashboardLayout>
        <Card class="w-full">
            <CardHeader>
                <CardTitle>Temperature Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <LineChart v-if="loaded" :chartData="chartData" :options="chartOptions" />
            </CardContent>
        </Card>
    </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import DashboardLayout from "@/components/layout.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "vue-chart-3";
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, CategoryScale } from "chart.js";

ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip);

const loaded = ref(false);
const chartData = ref({
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"],
    datasets: [
        {
            label: "Temperature (°C)",
            data: [22, 21, 23, 26, 28, 25, 23],
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


onMounted(() => {
    loaded.value = true;
});
</script>