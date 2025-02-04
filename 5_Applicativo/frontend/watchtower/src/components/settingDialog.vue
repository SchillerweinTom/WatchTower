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
                            <Input id="minTemp" name="minTemp" type="number" v-model="settings.minTemp" required />
                        </div>
                        <div class="space-y-2">
                            <Label for="maxTemp">Maximum Temperature (°C)</Label>
                            <Input id="maxTemp" name="maxTemp" type="number" v-model="settings.maxTemp" required />
                        </div>

                        <div class="space-y-2">
                            <Label for="minHumidity">Minimum Humidity (%)</Label>
                            <Input id="minHumidity" name="minHumidity" type="number" v-model="settings.minHumidity"
                                required />
                        </div>
                        <div class="space-y-2">
                            <Label for="maxHumidity">Maximum Humidity (%)</Label>
                            <Input id="maxHumidity" name="maxHumidity" type="number" v-model="settings.maxHumidity"
                                required />
                        </div>
                        <div class="space-y-2">
                            <Label for="maxCO2">Maximum CO2 (ppm)</Label>
                            <Input id="maxCO2" name="maxCO2" type="number" v-model="settings.maxCO2" required />
                        </div>
                    </div>
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
import { ref, defineEmits } from "vue";
import { useToast } from '@/components/ui/toast/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";


const { toast } = useToast();
const emit = defineEmits(["close"]);

const settings = ref({
    maxTemp: "30",
    minTemp: "18",
    maxHumidity: "60",
    minHumidity: "30",
    maxCO2: "1000",
});

const handleSubmit = () => {
    console.log("Saving settings:", settings.value);
    toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
    });
    emit("close");
};
</script>
