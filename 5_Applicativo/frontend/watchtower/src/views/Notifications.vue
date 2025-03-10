<template>
    <DashboardLayout>
        <Card class="w-full">
            <CardHeader>
                <div class="flex justify-between">
                    <CardTitle>Notifications</CardTitle>
                    <div class="flex">
                        <Button variant="outline" @click="goSettings" class="ml-2">
                            <Settings class="w-4 h-4" /> <span v-if="!isMobile">Settings</span>
                        </Button>
                        <Button @click="confirmResolveAll = true" variant="destructive" class="ml-2">
                            <Trash2 class="w-4 h-4" /><span v-if="!isMobile">Resolve All</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs v-model="activeTab" class="w-full">
                    <TabsList class="grid w-full grid-cols-5">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="temperature"><span v-if="isMobile"><Thermometer class="w-4 h-4" /></span><span v-else>Temperature</span></TabsTrigger>
                        <TabsTrigger value="access"><span v-if="isMobile"><Unlock class="w-4 h-4" /></span><span v-else>Access</span></TabsTrigger>
                        <TabsTrigger value="humidity"><span v-if="isMobile"><Droplets class="w-4 h-4" /></span><span v-else>Humidity</span></TabsTrigger>
                        <TabsTrigger value="other"><span v-if="isMobile"><MoreHorizontal class="w-4 h-4" /></span><span v-else>Other</span></TabsTrigger>
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
                    <Button @click="confirmResolve = true" variant="destructive">Resolved</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog v-model:open="confirmResolve">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Resolution</DialogTitle>
                    <DialogDescription>Are you sure you want to mark this notification as resolved?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button @click="confirmResolve = false">Cancel</Button><div v-if="isMobile" class="mt-3"></div>
                    <Button variant="destructive" @click="resolve(selectedNotification.id)">Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog v-model:open="confirmResolveAll">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Resolution</DialogTitle>
                    <DialogDescription>Are you sure you want to mark <b>ALL</b> notification as resolved?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button @click="confirmResolveAll = false">Cancel</Button><div v-if="isMobile" class="mt-3"></div>
                    <Button variant="destructive" @click="resolveAll()">Confirm</Button>
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
import { Settings, Thermometer, Lock, Unlock, Droplets, AlertTriangle, Trash2, MoreHorizontal } from "lucide-vue-next";
import SettingsDialog from "@/components/settingDialog.vue";
import api from "@/router/axios";

const showSettingDialog = ref(false);
const isMobile = ref(false);
const activeTab = ref("all");
const isDialogOpen = ref(false);
const selectedNotification = ref(null);
const confirmResolve = ref(false);
const confirmResolveAll = ref(false);

const notifications = ref([]);

onMounted(() => {
    const checkScreenSize = () => {
        isMobile.value = window.innerWidth < 768;
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    fetchNotifications();

    return () => window.removeEventListener("resize", checkScreenSize);
});

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
        : notifications.value.filter((n) => {
            const normalizedType = n.type.toLowerCase() === "co2" ? "other" : n.type;
            return normalizedType === activeTab.value;
        });
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
const resolveAll = async () => {
    try {
        const token = localStorage.getItem("token");

        await api.put(`/alert-all-resolved`, {}, {
            headers: {
                Authorization: token,
            },
        });

        confirmResolveAll.value = false;
        fetchNotifications();

    } catch (error) {
        console.error("Error resolving alert:", error);
    }
};
</script>
