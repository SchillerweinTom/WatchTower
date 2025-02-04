<template>
    <RouterLink :to="href">
        <Button variant="ghost" :class="[
            'w-full justify-start pt-5 pb-5 mt-1',
            isActive ? 'bg-gray-100' : ''
        ]">
            <slot name="icon"></slot>
            {{ name }}
        </Button>
    </RouterLink>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Button } from '@/components/ui/button';

const props = defineProps({
    name: String,
    href: String
});

const route = useRoute();
const isActive = computed(() => route.path === props.href);
</script>