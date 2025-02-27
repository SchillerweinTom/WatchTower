<template>
  <DashboardLayout>
    <div class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard v-if="temperatureData" :title="'Temperature'" :value="temperatureData.value + '°C'" :description="temperatureData.description" link="/temperature">
          <template #icon>
            <Thermometer class="size-4 text-gray-500" />
          </template>
        </MetricCard>

        <MetricCard v-if="humidityData" :title="'Humidity'" :value="humidityData.value + '%'" :description="humidityData.description" link="/humidity">
          <template #icon>
            <Droplets class="size-4 text-gray-500" />
          </template>
        </MetricCard>

        <MetricCard v-if="accessAttemptsData" :title="'Access Attempts'" :value="accessAttemptsData.value" :description="accessAttemptsData.description" link="/access">
          <template #icon>
            <LockClosedIcon class="size-4 text-gray-500" />
          </template>
        </MetricCard>

        <MetricCard v-if="co2Data" :title="'CO₂'" :value="co2Data.value + ' ppm'" :description="co2Data.description" link="/co2">
          <template #icon>
            <CloudIcon class="size-4 text-gray-500" />
          </template>
        </MetricCard>

        <Dialog v-if="code">
          <DialogTrigger as-child>
            <Card class="cursor-pointer hover:shadow-lg transition">
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">Link Your Badge</CardTitle>
                  <AlertTriangle class="size-4 text-red-500" />
              </CardHeader>
              <CardContent>
                  <div class="text-2xl font-bold"></div>
                  <p class="text-xs text-muted-foreground">Click here to get your access code!</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader class="space-y-2">
              <DialogTitle class="text-lg font-semibold text-center">Link Your Account to Your Badge</DialogTitle>
              <DialogDescription class="text-sm text-muted-foreground">
                To ensure secure access to the server room, your badge must be linked to your account. This allows us to track access in case of an incident.
                <br><br>
                <strong>Instructions:</strong><br>
                 1. Go to the server room. <br>
                 2. Place your badge on the RFID sensor. <br>
                 3. Enter your code using the mini keyboard.
                <br><br>
                Once completed, your badge will be successfully linked to your account.
              </DialogDescription>
            </DialogHeader>
            <div class="flex items-center justify-center bg-gray-100 p-3 rounded-md mt-4">
              <span class="text-lg font-bold text-gray-900">🔑 Code: <span class="text-blue-600">{{ code }}</span></span>
            </div>
            <DialogFooter class="mt-4">
              <DialogClose as-child>
                <Button variant="default">Got it</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Thermometer, Droplets, AlertTriangle } from "lucide-vue-next";
import { CloudIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/components/layout.vue";
import MetricCard from "@/components/metricCard.vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Button } from "@/components/ui/button";
import api from "@/router/axios";

const temperatureData = ref(null);
const humidityData = ref(null);
const accessAttemptsData = ref(null);
const co2Data = ref(null);
const code = ref(null);

const fetchMetricsData = async () => {
  try {
    const token = localStorage.getItem("token");

    const temperatureResponse = await api.get("/temperature",{
            headers: {
                Authorization: token,
            },
        }
    );
    temperatureData.value = temperatureResponse.data;

    const humidityResponse = await api.get("/humidity",{
            headers: {
                Authorization: token,
            },
        }
    );
    humidityData.value = humidityResponse.data;

    const accessAttemptsResponse = await api.get("/access-attempts",{
            headers: {
                Authorization: token,
            },
        }
    );
    accessAttemptsData.value = accessAttemptsResponse.data;

    const co2Response = await api.get("/co2",{
            headers: {
                Authorization: token,
            },
        }
    );
    co2Data.value = co2Response.data;

    const linkResponse = await api.get("/badge",{
            headers: {
                Authorization: token,
            },
        }
    );
    code.value = linkResponse.data.code;
    
  } catch (error) {
    console.error("Error fetching metric data:", error);
  }
};

onMounted(() => {
  fetchMetricsData();
});
</script>