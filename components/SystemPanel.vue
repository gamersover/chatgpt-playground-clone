<template>
    <div class="flex flex-col flex-1 h-full p-4 border-[1px] border-gray-300 rounded-md focus-within:border-blue-500">
        <p class="font-medium">SYSTEM</p>
        <UTextarea
            :ui="{'base': 'h-full font-light'}"
            size="xl"
            placeholder="You are a helpful assistant"
            class="h-full mt-4"
            :padded="false"
            variant="none"
            v-model="systemPrompt.content">
        </UTextarea>
    </div>
</template>

<script setup>
const props = defineProps(['systemPrompt'])
</script>