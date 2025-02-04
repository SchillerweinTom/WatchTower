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

                <Table>
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
            </div>
        </div>
    </DashboardLayout>
</template>

<script setup>
import { ref } from "vue";
import { Chart as ChartJS, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { BarChart } from "vue-chart-3";
import DashboardLayout from "@/components/layout.vue";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge'

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const chartData = ref({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
        {
            label: "Authorized",
            data: [3, 7, 9, 2, 12, 0, 2],
            backgroundColor: "#8884d8",
        },
        {
            label: "Unauthorized",
            data: [3, 0, 1, 2, 0, 1, 0],
            backgroundColor: "#82ca9d",
        },
    ],
});

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

const accessList = ref([
    { id: 1, name: "John Doe", time: "2023-06-15 09:30", motive: "Regular maintenance", authorized: true },
    { id: 2, name: "Jane Smith", time: "2023-06-15 11:45", motive: "Emergency repair", authorized: true },
    { id: 3, name: "Unknown", time: "2023-06-15 14:20", motive: "Attempted access", authorized: false },
    { id: 4, name: "Mike Johnson", time: "2023-06-15 16:00", motive: "Equipment installation", authorized: true },
    { id: 5, name: "Sarah Brown", time: "2023-06-15 17:30", motive: "Regular check", authorized: true },
]);
</script>