<template>
    <DashboardLayout>
      <div class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Temperature" value="25.5°C" description="+2.5°C from last hour">
            <template #icon>
              <Thermometer class="size-4 text-gray-500" />
            </template>
          </MetricCard>
  
          <MetricCard title="Humidity" value="45%" description="-5% from last hour">
            <template #icon>
              <Droplets class="size-4 text-gray-500" />
            </template>
          </MetricCard>
  
          <MetricCard title="Access Attempts" value="+12" description="+2 unauthorized attempts">
            <template #icon>
              <LockClosedIcon class="size-4 text-gray-500" />
            </template>
          </MetricCard>
  
          <MetricCard title="CO₂" value="440 ppm" description="+15 ppm from yesterday">
            <template #icon>
              <CloudIcon class="size-4 text-gray-500" />
            </template>
          </MetricCard>
        </div>
      </div>
    </DashboardLayout>
  </template>
  
  <script setup>
  import { Thermometer, Droplets } from 'lucide-vue-next';
  import { CloudIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
  import DashboardLayout from "../components/layout.vue";
  import MetricCard from '../components/metricCard.vue';
  </script>
  