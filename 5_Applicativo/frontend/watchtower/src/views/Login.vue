<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <Card class="w-full max-w-md">
            <CardHeader>
                <CardTitle class="text-2xl font-bold text-center">Login to WatchTower</CardTitle>
            </CardHeader>
            <CardContent>
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div class="space-y-2">
                        <div class="flex space-x-2">
                            <Label for="username">Username</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger><InformationCircleIcon class="h-4 w-4 text-gray-400" /></TooltipTrigger>
                                    <TooltipContent>
                                        <p>Login with school credentials</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            
                        </div>
                        <Input id="username" type="text" placeholder="name.surname" v-model="username" required />
                    </div>
                    <div class="space-y-2">
                        <Label for="password">Password</Label>
                        <Input id="password" type="password" placeholder="********" v-model="password" required />
                    </div>
                    <Button type="submit" class="w-full">
                        Log In
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InformationCircleIcon } from "@heroicons/vue/24/outline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import axios from "axios";

const username = ref("");
const password = ref("");
const router = useRouter();

const handleSubmit = async () => {
    try {
        const response = await axios.post('http://localhost:3000/login', {
            username: username.value,
            password: password.value,
        });

        localStorage.setItem('token', response.data.token);
        router.push('/');
    } catch (error) {
        alert('Login failed: ' + (error.response ? error.response.data.message : error.message));
    }
};
</script>
