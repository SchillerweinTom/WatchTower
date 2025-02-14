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
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Thermometer, Droplets } from "lucide-vue-next";
import { CloudIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/components/layout.vue";
import MetricCard from "@/components/metricCard.vue";
import api from "@/router/axios";

const temperatureData = ref(null);
const humidityData = ref(null);
const accessAttemptsData = ref(null);
const co2Data = ref(null);

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
    
  } catch (error) {
    console.error("Error fetching metric data:", error);
  }
};

onMounted(() => {
  fetchMetricsData();
});
</script>