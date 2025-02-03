<template>
    <div class="flex h-screen bg-gray-100">
        <div v-if="isMobile">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" class="md:hidden fixed top-4 left-4 z-50">
                        <Menu class="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" class="w-64">
                    <div class="mt-8">
                        <SidebarContent />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
        <div v-else>
            <aside class="w-64 bg-white shadow-md">
                <div class="mt-5 px-2">
                    <SidebarContent />
                </div>
            </aside>
        </div>
        <main class="flex-1 overflow-y-auto p-8">
            <slot></slot>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, Bell, Thermometer, Lock, Droplets, BarChart3, Menu, Wind } from "lucide-vue";

// Defining the sidebar navigation items
const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Temperature", href: "/temperature", icon: Thermometer },
    { name: "Humidity", href: "/humidity", icon: Droplets },
    { name: "CO2", href: "/co2", icon: Wind },
    { name: "Access Control", href: "/access", icon: Lock },
    { name: "Other Data", href: "/other-data", icon: BarChart3 },
];

// Managing screen size for mobile responsiveness
const isMobile = ref(false);

onMounted(() => {
    const checkScreenSize = () => {
        isMobile.value = window.innerWidth < 768;
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
});

const SidebarContent = () => (
  <nav class="space-y-2">
    {navItems.map((item) => (
      <RouterLink :key="item.name" :to="item.href">
        <Button variant="ghost" :class="['w-full justify-start', pathname === item.href ? 'bg-gray-100' : '']">
          <item.icon class="mr-2 h-4 w-4" />
          {item.name}
        </Button>
      </RouterLink>
    ))}
  </nav>
);

</script>

<style scoped></style>