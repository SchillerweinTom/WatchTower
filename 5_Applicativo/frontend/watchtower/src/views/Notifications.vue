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
                        {{ selectedNotification.description }}
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4">
                    <div class="flex items-center space-x-4">
                        <div class="rounded-full p-2" :class="getSeverityColor(selectedNotification?.severity)">
                            <component :is="getIcon(selectedNotification.type)" class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-lg font-medium">{{ selectedNotification.message }}</p>
                            <p class="text-sm text-gray-500">{{ selectedNotification.timestamp }}</p>
                        </div>

                    </div>
                    <Badge :class="getSeverityColor(selectedNotification.severity)" variant="outline">
                        {{ selectedNotification.severity }}
                    </Badge>
                </div>
                <DialogFooter>
                    <!--<Button @click="isDialogOpen = false">Close</Button>-->
                    <Button @click="confirmResolve = true" variant="destructive">Resolved</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <!-- Confirmation Dialog -->
        <Dialog v-model:open="confirmResolve">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Resolution</DialogTitle>
                    <DialogDescription>Are you sure you want to mark this notification as resolved?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button @click="confirmResolve = false">Cancel</Button>
                    <Button variant="destructive" @click="resolve(selectedNotification.id)">Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout.vue";
import { Settings, Thermometer, Lock, Droplets, AlertTriangle } from "lucide-vue-next";
import SettingsDialog from "@/components/settingDialog.vue";
import api from "@/router/axios";

const showSettingDialog = ref(false);

const activeTab = ref("all");
const isDialogOpen = ref(false);
const selectedNotification = ref(null);
const confirmResolve = ref(false);

const notifications = ref([]);

const fetchNotifications = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await api.get("/alerts", {
            headers: {
                Authorization: token,
            },
        });

        notifications.value = response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
};

const filteredNotifications = computed(() => {
    return activeTab.value === "all"
        ? notifications.value
        : notifications.value.filter((n) => n.type === activeTab.value);
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
const resolve = async (id) => {
    try {
        const token = localStorage.getItem("token");

        await api.put(`/alert-resolved/${id}`, {}, {
            headers: {
                Authorization: token,
            },
        });

        confirmResolve.value = false; 
        isDialogOpen.value = false;

        fetchNotifications();

    } catch (error) {
        console.error("Error resolving alert:", error);
    }
};
onMounted(fetchNotifications);
</script>
