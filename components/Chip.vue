<template>
    <div
        class="flex text-ellipsis overflow-hidden w-auto items-center max-w-full p-1 rounded-md bg-gray-100">
        {{ stopword }}
        <button class="w-5 h-5 rounded-md hover:bg-white" @click="emits('removeStopWord')">x</button>
    </div>
</template>

<script setup>
const props = defineProps(['stopword'])
const emits = defineEmits(['removeStopWord'])
</script>