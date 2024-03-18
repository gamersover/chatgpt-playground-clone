<template>
    <div class="flex flex-col flex-1 h-full p-4 border-[1px] border-gray-300 rounded-md hover:border-blue-500">
        <p class="font-medium">SYSTEM</p>
        <textarea class="mt-4 font-light w-full h-full focus:outline-none resize-none rounded" placeholder="You are a helpful assistant" :value="systemPrompt" @input="$emit('changeInput', $event.target.value)"></textarea>
    </div>
</template>

<script setup>
const props = defineProps(['systemPrompt'])
defineEmits(['changeInput'])
</script>