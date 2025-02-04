<template>
    <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">{{ title }}</CardTitle>
            <slot name="icon"></slot>
        </CardHeader>
        <CardContent>
            <div class="text-2xl font-bold">{{ value }}</div>
            <p class="text-xs text-muted-foreground">{{ description }}</p>
        </CardContent>
    </Card>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

defineProps({
    title: String,
    value: String,
    description: String
});
</script>