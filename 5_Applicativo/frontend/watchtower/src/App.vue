<template>
  <DashboardLayout>
    <div class="space-y-4">
      <div class="flex justify-end">
        <RouterLink to="/login">
          <Button variant="outline">Login</Button>
        </RouterLink>
      </div>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Temperature</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" class="h-4 w-4 text-muted-foreground">
              <path
                d="M16 4c0-1.1.9-2 2-2s2 .9 2 2v3.5c0 .8-.7 1.5-1.5 1.5S17 8.3 17 7.5V7c0-.6-.4-1-1-1s-1 .4-1 1v1c0 1.7 1.3 3 3 3s3-1.3 3-3V4c0-2.2-1.8-4-4-4s-4 1.8-4 4v7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2h1V7c0-2.8-2.2-5-5-5S2 4.2 2 7v9c0 5 4 8 9 8 4.7 0 8.7-3.4 9-8 .3-4.5-3.2-8.3-7.7-8.7" />
            </svg>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">25.5°C</div>
            <p class="text-xs text-muted-foreground">+2.5°C from last hour</p>
          </CardContent>
        </Card>

        <!-- Repeat Card Component for other metrics -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Humidity</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" class="h-4 w-4 text-muted-foreground">
              <path
                d="M12 2v6m0 0l-4-4m4 4l4-4m-1.73 14.341c-1.525 1.145-3.714 1.309-5.774.433-2.311-.986-3.885-3.408-3.885-5.997 0-3.308 2.692-6 6-6s6 2.692 6 6c0 1.997-.839 3.843-2.341 5.226z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">45%</div>
            <p class="text-xs text-muted-foreground">-5% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Access Attempts</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" class="h-4 w-4 text-muted-foreground">
              <path d="M12 10v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
              <path d="M18 11v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
            </svg>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">+12</div>
            <p class="text-xs text-muted-foreground">+2 unauthorized attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Power Usage</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" class="h-4 w-4 text-muted-foreground">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">5.2 kWh</div>
            <p class="text-xs text-muted-foreground">+0.3 kWh from yesterday</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import DashboardLayout from "./components/layout.vue";
</script>
