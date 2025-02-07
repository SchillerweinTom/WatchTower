<template>
    <DashboardLayout>
        <Card class="w-full">
            <CardHeader>
                <div class="flex justify-between">
                    <CardTitle>Notifications</CardTitle>
                    <Button variant="outline" @click="goSettings">
                        <Settings class="w-4 h-4" /> Settings
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs v-model="activeTab" class="w-full">
                    <TabsList class="grid w-full grid-cols-5">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="temperature">Temperature</TabsTrigger>
                        <TabsTrigger value="access">Access</TabsTrigger>
                        <TabsTrigger value="humidity">Humidity</TabsTrigger>
                        <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>
                    <TabsContent class="mt-6" :value="activeTab">
                        <ul class="space-y-4">
                            <li v-for="notification in filteredNotifications" :key="notification.id"
                                @click="openDialog(notification)"
                                class="flex items-start space-x-4 bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100 transition">
                                <div class="flex-shrink-0 rounded-full p-2"
                                    :class="getSeverityColor(notification.severity)">
                                    <component :is="getIcon(notification.type)" class="w-5 h-5" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 truncate">
                                        {{ notification.message }}
                                    </p>
                                    <p class="text-sm text-gray-500">{{ notification.timestamp }}</p>
                                </div>
                                <Badge :class="getSeverityColor(notification.severity)" variant="outline">
                                    {{ notification.severity }}
                                </Badge>
                            </li>
                        </ul>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
        
        <SettingsDialog v-if="showSettingDialog" @close="showSettingDialog = false" />

        <Dialog v-model:open="isDialogOpen">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Notification Details</DialogTitle>
                    <DialogDescription>
                        Full details of the selected notification. (some text)
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4">
                    <div class="flex items-center space-x-4">
                        <div class="rounded-full p-2" :class="getSeverityColor(selectedNotification?.severity)">
                            <component :is="getIcon(selectedNotification?.type)" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-lg font-medium">{{ selectedNotification?.message }}</p>
                            <p class="text-sm text-gray-500">{{ selectedNotification?.timestamp }}</p>
                        </div>
                    </div>
                    <Badge :class="getSeverityColor(selectedNotification?.severity)" variant="outline">
                        {{ selectedNotification?.severity }}
                    </Badge>
                </div>
                <DialogFooter>
                    <Button @click="isDialogOpen = false">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </DashboardLayout>
</template>

<script setup>
import { ref, computed } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout.vue";
import { Settings, Thermometer, Lock, Droplets, AlertTriangle } from "lucide-vue-next";
import { useRouter } from "vue-router";
import SettingsDialog from "@/components/settingDialog.vue";

const showSettingDialog = ref(false);

const activeTab = ref("all");
const isDialogOpen = ref(false);
const selectedNotification = ref(null);
const router = useRouter();

const mockNotifications = ref([
    { id: 1, type: "temperature", message: "Server room temperature exceeds 30°C", timestamp: "2023-06-15 14:30", severity: "high" },
    { id: 2, type: "access", message: "Unauthorized access attempt detected", timestamp: "2023-06-15 12:45", severity: "high" },
    { id: 3, type: "humidity", message: "Humidity levels below 30%", timestamp: "2023-06-15 10:15", severity: "medium" },
    { id: 4, type: "other", message: "UPS battery needs replacement", timestamp: "2023-06-14 09:00", severity: "low" },
    { id: 5, type: "temperature", message: "Temperature normalized", timestamp: "2023-06-14 15:30", severity: "low" },
]);

const filteredNotifications = computed(() => {
    return activeTab.value === "all"
        ? mockNotifications.value
        : mockNotifications.value.filter((n) => n.type === activeTab.value);
});

const openDialog = (notification) => {
    selectedNotification.value = notification;
    isDialogOpen.value = true;
};

const getIcon = (type) => {
    switch (type) {
        case "temperature": return Thermometer;
        case "access": return Lock;
        case "humidity": return Droplets;
        default: return AlertTriangle;
    }
};

const getSeverityColor = (severity) => {
    switch (severity) {
        case "low": return "bg-green-100 text-green-800";
        case "medium": return "bg-yellow-100 text-yellow-800";
        case "high": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
    }
};
const goSettings = () => {
    showSettingDialog.value = true;
};
</script>
