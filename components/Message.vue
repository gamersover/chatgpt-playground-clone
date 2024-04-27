<template>
    <div :class="{'bg-gray-200 dark:bg-[#353740] rounded-lg': isFocus}" class="group flex w-full h-auto hover:rounded-lg transition-colors border-gray-200 dark:border-[#353740] border-b justify-between hover:bg-gray-200 hover:dark:bg-[#353740]">
        <div class="flex items-center justify-left h-12 w-[8rem] pl-4 mt-2.5">
            <UButton
                @click="$emit('changeRole', message)"
                class="bg-gray-200 dark:bg-[#353740] group-hover:bg-gray-300 group-hover:dark:bg-gray-500 shadow-none rounded-lg text-black dark:text-gray-100"
            >
                {{ message.role.toUpperCase() }}
            </UButton>
        </div>
        <div class="flex flex-1 justify-between h-auto my-3">
            <UTextarea
                ref="textarea"
                autoresize
                v-model="message.content"
                color="blue"
                size="xl"
                :rows="1"
                class="w-full"
                :ui="{'variant': {'outline': 'ring-0 shadow-none focus:bg-white focus:dark:bg-[#202123]'}, 'base': 'font-light'}"
                @focus="handleFocus"
                @blur="handleBlur"
                :placeholder="message.role === 'user' ? 'Type user message here.' : 'Type assistant message here.'"
            >
            </UTextarea>
        </div>
        <div class="flex w-14 h-12 mt-2.5 items-center justify-center">
            <UButton
                @click="$emit('removeRole')"
                :padded=false
                color="black"
                variant="ghost"
                class="text-white dark:text-[#202123] group-hover:text-gray-400 group-hover:dark:text-gray-500 hover:!text-black hover:dark:!text-gray-100"
                :class="{'text-gray-400 dark:text-gray-500': isFocus}"
            >
                <IconCircleMinus size="20"/>
            </UButton>
        </div>
    </div>
</template>

<script setup>
const props = defineProps(['message'])
const textarea = ref(null)
const emits = defineEmits(['changeRole', 'removeRole'])

const isFocus = ref(false)

function handleFocus() {
    textarea.value.textarea.focus()
    isFocus.value = true
}

function handleBlur() {
    isFocus.value = false
}

onMounted(() => {
    textarea.value.textarea?.focus()
})
</script>