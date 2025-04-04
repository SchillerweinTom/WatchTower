<template>
    <!-- Dialog Overlay -->
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <Card class="w-full max-w-2xl bg-white rounded-lg shadow-lg">
            <CardHeader>
                <div class="flex justify-between items-center">
                    <CardTitle class="text-2xl font-bold">Notification Settings</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">

                        <div class="space-y-2">
                            <Label for="minTemp">Minimum Temperature (°C)</Label>
                            <Input id="minTemp" name="minTemp" type="number" v-model="settings.temp_limit_min" required />
                        </div>
                        <div class="space-y-2">
                            <Label for="maxTemp">Maximum Temperature (°C)</Label>
                            <Input id="maxTemp" name="maxTemp" type="number" v-model="settings.temp_limit_max" required />
                        </div>

                        <div class="space-y-2">
                            <Label for="minHumidity">Minimum Humidity (%)</Label>
                            <Input id="minHumidity" name="minHumidity" type="number" v-model="settings.hum_limit_min"
                                required />
                        </div>
                        <div class="space-y-2">
                            <Label for="maxHumidity">Maximum Humidity (%)</Label>
                            <Input id="maxHumidity" name="maxHumidity" type="number" v-model="settings.hum_limit_max"
                                required />
                        </div>
                        <div class="space-y-2">
                            <Label for="maxCO2">Maximum CO2 (ppm)</Label>
                            <Input id="maxCO2" name="maxCO2" type="number" v-model="settings.co2_limit_max" required />
                        </div>
                    </div>
                    <Alert variant="destructive" v-if="saveFailed">
                        <AlertCircle class="h-5 w-5" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {{ message }}
                        </AlertDescription>
                    </Alert>
                    <div class="flex justify-end gap-2">
                        <Button variant="outline" @click="emit('close')">Cancel</Button>
                        <Button type="submit">Save Settings</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
</template>


<script setup>
import { ref, defineEmits, onMounted } from "vue";
import { useToast } from '@/components/ui/toast/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-vue-next';
import api from "@/router/axios";

const { toast } = useToast();
const emit = defineEmits(["close"]);

const settings = ref({
    temp_limit_max: 30,
    temp_limit_min: 18,
    hum_limit_max: 65,
    hum_limit_min: 20,
    co2_limit_max: 1000,
});
const message = ref("Error saving settings!");
const saveFailed = ref(false);


const fetchSettings = async () => {
    try {
        const token = localStorage.getItem("token");
        const decoded = JSON.parse(atob(token.split(".")[1]));

        const response = await api.get("/alert-settings", {
            headers: {
                Authorization: token,
            }},
            {
                user: decoded.username
            }
        );
        if(response.data.temp_limit_min){
            settings.value = response.data;
        }
        
    } catch (error) {
        console.error("Failed to load settings:", error);
    }
};

const handleSubmit = async () => {
    try {
        const token = localStorage.getItem("token");
        const decoded = JSON.parse(atob(token.split(".")[1]));
        
        const response = await api.post("/alert-settings", 
            {
                user: decoded.username,
                ...settings.value,
            },
            {
                headers: {
                    Authorization: token,
                },
            }
        );

        if(response.data.message == "Success"){
            saveFailed.value = false;
            emit("close");
        }else{
            saveFailed.value = true;
            message.value = response.data.message;
        }

        
    } catch (error) {
        console.error("Failed to save settings:", error);
        toast({
            title: "Error",
            description: "Failed to save settings. Please try again.",
            variant: "destructive",
        });
        saveFailed.value = true;
    }
};

onMounted(() => {
    fetchSettings();
});
</script>
