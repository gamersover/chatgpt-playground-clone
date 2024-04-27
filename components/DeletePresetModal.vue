<template>
    <div class="flex flex-col p-4 gap-6">
        <h1 class="text-lg font-medium">删除场景 "{{ props.presetName }}"？</h1>
        <p>该预设场景将被永久删除，无法恢复，确定继续吗？</p>
        <div class="flex justify-end gap-2">
        <UButton
            label="取消"
            color="gray"
            :ui="{rounded: 'rounded-lg'}"
            class="text-base dark:bg-gray-300/20 dark:hover:bg-zinc-500"
            @click="emits('closeModal')"
        >
        </UButton>
        <UButton
            label="删除"
            color="red"
            :ui="{rounded: 'rounded-lg', variant: {solid: 'dark:bg-red-700 dark:hover:bg-red-600'}}"
            class="text-base dark:text-gray-200"
            @click="emits('deletePreset')"
        >
        </UButton>
        </div>
    </div>
</template>

<script setup>
const props = defineProps(['presetName'])
const emits = defineEmits(['closeModal', 'deletePreset'])

</script>