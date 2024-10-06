<template>
    <div
        class="flex text-ellipsis overflow-hidden w-auto items-center text-sm font-light max-w-full p-1 rounded-md bg-gray-200 dark:text-gray-100 dark:bg-[#353740]">
        <p>{{ stopword }}</p>
        <button class="w-5 h-5 flex items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:dark:text-gray-100" @click="emits('removeStopWord')">
            <IconClose size="15"/>
        </button>
    </div>
</template>

<script setup>
const props = defineProps(['stopword'])
const emits = defineEmits(['removeStopWord'])
</script>