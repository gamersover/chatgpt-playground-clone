<template>
    <div
        class="flex text-ellipsis overflow-hidden w-auto items-center max-w-full p-1 rounded-md bg-gray-100">
        {{ stopword }}
        <button class="w-5 h-5 flex items-center justify-center rounded-md hover:bg-white" @click="emits('removeStopWord')">
            <CloseIcon size="15"/>
        </button>
    </div>
</template>

<script setup>
import CloseIcon from './icon/CloseIcon.vue'


const props = defineProps(['stopword'])
const emits = defineEmits(['removeStopWord'])
</script>