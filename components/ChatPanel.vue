<template>
    <div class="flex flex-col h-[90%] overflow-y-scroll w-[55%]" ref="container">
        <Message
            v-for="(message, index) of messages"
            @change-role="changeRole(message)"
            @remove-role="removeMessage(index)"
            :message="message"
            :key="message.id"
        />
        <UButton
            variant="ghost"
            color="black"
            class="pl-4 py-4 hover:bg-gray-200 hover:dark:bg-[#353740]"
            @click="addMessage"
            label="添加消息"
        >
            <template #leading>
                <IconCircleAdd size="20"/>
            </template>
        </UButton>

        <div class="fixed bottom-5">
            <UTooltip
                :ui="{base: 'px-1.5 py-1 h-full rounded-md', background: 'bg-neutral-800 dark:bg-neutral-800'}"
            >
                <template #text>
                    <div class="flex gap-1 items-center text-sm justify-between">
                        <span class="text-white">{{ submit.is_submit ? '取消' : '提交' }}</span>
                        <div class="flex items-center">
                            <UKbd :ui="{base: 'text-white dark:text-black', background: 'bg-neutral-600 dark:bg-gray-300'}">{{ metaSymbol }}</UKbd>
                            <UKbd :ui="{base: 'text-white dark:text-black', background: 'bg-neutral-600 dark:bg-gray-300'}">Enter</UKbd>
                        </div>
                    </div>
                </template>
                <UButton
                    :label="submit.is_submit ? '取消' : '提交'"
                    class="text-base dark:text-gray-200 py-1.5"
                    size="lg"
                    :color="submit.is_submit ? 'red' : 'blue'"
                    :ui="{variant: {solid: 'dark:bg-{color}-800 dark:hover:bg-{color}-700 disabled:bg-{color}-700/50 dark:disabled:bg-{color}-600/50'}}"
                    @click="buttonClickHandler"
                    :disabled="!submit.isAvaiable"
                >
                </UButton>
            </UTooltip>
        </div>
    </div>
</template>


<script setup>
import { v4 as uuidv4 } from 'uuid'

const { metaSymbol } = useShortcuts()

const props = defineProps(['messages', 'submit'])
const emits = defineEmits(['submitChat'])

const container = ref(null)

const new_role = computed(() => {
    if (props.messages.length == 0) {
        return 'user'
    } if (props.messages[props.messages.length-1].role == 'user') {
        return 'assistant'
    } else {
        return 'user'
    }
})

function addMessage() {
    props.messages.push({
        role: new_role.value,
        content: '',
        is_focus: true,
        id: uuidv4()
    })
}

function removeMessage(index) {
    props.messages.splice(index, 1)
}

function changeRole(message) {
    message.role = message.role === 'user' ? 'assistant' : 'user'
}

async function autoExpand() {
    await nextTick()
    if (container.value) {
        const diff = container.value.scrollHeight - container.value.scrollTop -  container.value.clientHeight
        console.log(diff)
        if (diff < 70) {
            container.value.scrollTop = container.value.scrollHeight
        }
    }
}

watch(() => props.messages, () => {
    autoExpand()
}, {deep: true, immediate: false})

function buttonClickHandler() {
    if (props.submit.is_submit) {
        props.submit.stop_generate = true
    } else {
        emits('submitChat')
    }
}

defineShortcuts({
    meta_enter: {
        usingInput: true,
        handler: buttonClickHandler
    }
})
</script>