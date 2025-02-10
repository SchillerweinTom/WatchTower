<template>
    <DashboardLayout>
        <div class="space-y-4">
            <div class="bg-white shadow-lg rounded-lg p-6">
                <h2 class="text-xl font-bold mb-4">Access Control - Weekly Overview</h2>
                <div class="w-full h-96">
                    <BarChart :chartData="chartData" :options="chartOptions" />
                </div>
            </div>

            <div class="bg-white shadow-lg rounded-lg p-6">
                <h2 class="text-xl font-bold mb-4">Recent Access</h2>

                <Table v-if="accessList.length">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Motive</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="event in accessList" :key="event.id">
                            <TableCell class="font-medium">{{ event.name }}</TableCell>
                            <TableCell>{{ event.time }}</TableCell>
                            <TableCell>{{ event.motive }}</TableCell>
                            <TableCell>
                                <Badge
                                    :class="event.authorized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                                    variant="outline">
                                    {{ event.authorized ? "Authorized" : "Unauthorized" }}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <p v-else>No access data</p>
            </div>
        </div>
    </DashboardLayout>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { Chart as ChartJS, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { BarChart } from "vue-chart-3";
import DashboardLayout from "@/components/layout.vue";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'
import api from "@/router/axios";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const accessList = ref([]);

const chartData = ref([]);

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            suggestedMin: 0,
            suggestedMax: 20,
        },
    },
});


const fetchAccessChart = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await api.get("/access/chart", {
            headers: {
                Authorization: token,
            },
        });
        chartData.value = response.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
    }
};

const fetchAccessList = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await api.get("/access/table", {
            headers: {
                Authorization: token,
            },
        });
        accessList.value = response.data;
    } catch (error) {
        console.error("Error fetching recent access list:", error);
    }
};

onMounted(() => {
    fetchAccessChart();
    fetchAccessList();
});
</script>