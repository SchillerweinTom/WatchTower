<template>
    <div class="flex h-screen bg-gray-100">
        <div v-if="isMobile">
            <Sheet v-model:open="isSheetOpen">
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" class="md:hidden fixed top-4 left-4 z-50">
                        <Bars3Icon class="h-6 w-6 text-gray-500" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" class="w-64">
                    <div class="mt-8 h-full">
                        <div class="flex flex-col h-full" @close-sheet="isSheetOpen = false">
                            <nav class="space-y-2">
                                <SidebarNavItem name="Dashboard" href="/">
                                    <template #icon>
                                        <HomeIcon class="size-6 text-black-500" />
                                    </template>
                                </SidebarNavItem>
                                <SidebarNavItem name="Temperature" href="/temperature">
                                    <template #icon>
                                        <SunIcon class="size-6 text-black-500" />
                                    </template>
                                </SidebarNavItem>
                                <SidebarNavItem name="Humidity" href="/humidity">
                                    <template #icon>
                                        <CloudIcon class="size-6 text-black-500" />
                                    </template>
                                </SidebarNavItem>
                                <SidebarNavItem name="CO₂" href="/co2">
                                    <template #icon>
                                        <HomeIcon class="size-6 text-black-500" />
                                    </template>
                                </SidebarNavItem>
                                <SidebarNavItem name="Access Control" href="/access">
                                    <template #icon>
                                        <LockClosedIcon class="size-6 text-black-500" />
                                    </template>
                                </SidebarNavItem>
                                <SidebarNavItem name="Notifications" href="/notifications">
                                    <template #icon>
                                        <BellIcon class="size-6 text-black-500" />
                                    </template>
                                </SidebarNavItem>
                            </nav>
                            <div class="mt-auto pt-4 border-t mb-5">
                                <div class="flex items-center justify-between px-4 py-2">
                                    <div class="flex items-center">
                                        <Avatar class="h-8 w-8 mr-2">
                                            <UserIcon class="h-4 w-4" />
                                        </Avatar>
                                        <div>
                                            <p class="text-sm font-medium">{{ user.name }}</p>
                                            <p class="text-xs text-gray-500">{{ user.email }}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" @click="handleClickOut">
                                        <ArrowRightStartOnRectangleIcon class="size-6 text-black-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
        <div v-else>
            <aside class="w-64 bg-white shadow-md h-screen mt-0">
                <div class="px-2 h-full">
                    <div class="flex flex-col justify-between h-full ">
                        <nav class="space-y-2">
                            <div class="mt-5"></div>
                            <SidebarNavItem name="Dashboard" href="/">
                                <template #icon>
                                    <HomeIcon class="size-6 text-black-500" />
                                </template>
                            </SidebarNavItem>
                            <SidebarNavItem name="Temperature" href="/temperature">
                                <template #icon>
                                    <Thermometer class="size-6 text-black-500" />
                                </template>
                            </SidebarNavItem>
                            <SidebarNavItem name="Humidity" href="/humidity">
                                <template #icon>
                                    <Droplets class="size-6 text-black-500" />
                                </template>
                            </SidebarNavItem>
                            <SidebarNavItem name="CO₂" href="/co2">
                                <template #icon>
                                    <CloudIcon class="size-6 text-black-500" />
                                </template>
                            </SidebarNavItem>
                            <SidebarNavItem name="Access Control" href="/access">
                                <template #icon>
                                    <LockClosedIcon class="size-6 text-black-500" />
                                </template>
                            </SidebarNavItem>
                            <SidebarNavItem name="Notifications" href="/notifications">
                                <template #icon>
                                    <BellIcon class="size-6 text-black-500" />
                                </template>
                            </SidebarNavItem>
                        </nav>
                        <div class="mt-auto pt-4 border-t mb-5">
                            <div class="flex items-center justify-between px-4 py-2">
                                <div class="flex items-center">
                                    <Avatar class="h-8 w-8 mr-2">
                                        <UserIcon class="h-4 w-4" />
                                    </Avatar>
                                    <div>
                                        <p class="text-sm font-medium">{{ user.name }}</p>
                                        <p class="text-xs text-gray-500">{{ user.email }}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" @click="isLogoutDialogOpen = true">
                                    <ArrowRightStartOnRectangleIcon class="size-6 text-black-500" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
        <main class="flex-1 overflow-y-auto p-8">
            <slot></slot>
        </main>
        <AlertDialog :open="isLogoutDialogOpen" @open-change="isLogoutDialogOpen = $event">
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>This action will end your current session.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel @click="isLogoutDialogOpen = false">Cancel</AlertDialogCancel>
                    <AlertDialogAction @click="handleLogout">Log out</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar } from '@/components/ui/avatar';
import { HomeIcon, BellIcon, SunIcon, CloudIcon, UserIcon, LockClosedIcon, Bars3Icon, ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/outline'
import SidebarNavItem from "@/components/navItem.vue";
import { Thermometer, Droplets } from 'lucide-vue-next';

const isMobile = ref(false);
const isSheetOpen = ref(false);
const route = useRoute();
const pathname = computed(() => route.path);
const isLogoutDialogOpen = ref(false);
const router = useRouter();

const user = {
    name: "John Doe",
    email: "john@example.com"
};

onMounted(() => {
    const checkScreenSize = () => {
        isMobile.value = window.innerWidth < 768;
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
});

const handleLogout = () => {
    //Logout
    router.push({ path: '/login' })
};

const handleClickOut = () => {
    isSheetOpen.value = false;
    isLogoutDialogOpen.value = true
}

</script>
