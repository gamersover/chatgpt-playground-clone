<template>
    <div class="flex flex-col flex-1 h-full border border-gray-300 dark:border-gray-500 rounded-md focus-within:border-blue-500 dark:focus-within:border-blue-600">
        <p class="font-medium px-4 py-4">SYSTEM</p>
        <UTextarea
            :ui="{base: 'h-full font-light', padding: {'xl': 'px-4 pt-0 pb-2'}}"
            size="xl"
            placeholder="You are a helpful assistant"
            class="h-full"
            variant="none"
            v-model="systemPrompt.content">
        </UTextarea>
    </div>
</template>

<script setup>
const props = defineProps(['systemPrompt'])
</script>