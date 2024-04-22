<template>
    <div class="flex flex-col h-[90%] overflow-y-scroll w-[55%]" ref="container">
        <Message
            v-for="(message, index) of messages"
            @auto-expand="autoExpand"
            @change-role="changeRole(message)"
            @remove-role="removeMessage(index)"
            :message="message"
            :key="message.id"
        />
        <UButton
            variant="ghost"
            color="black"
            class="pl-4 py-4 hover:bg-gray-200"
            @click="addMessage"
            label="添加消息"
        >
            <template #leading>
                <IconCircleAdd size="20"/>
            </template>
        </UButton>

        <UButton
            :label="submit.is_submit ? '取消' : '提交'"
            class="fixed bottom-5 text-base py-1.5"
            size="lg"
            :color="submit.is_submit ? 'red' : 'blue'"
            @click="buttonClickHandler"
            :disabled="!submit.isAvaiable"
        >
        </UButton>
        <!-- <button
            :disabled="!submit.isAvaiable"
            @click="buttonClickHandler"
            :class="{'bg-gray-300': !submit.isAvaiable, 'bg-blue-500 hover:bg-blue-600' : !submit.is_submit && submit.isAvaiable, 'bg-red-500 hover:bg-red-600': submit.is_submit}"
            class="fixed transition-colors bottom-5 rounded-md px-2 py-1 text-white">
            {{ submit.is_submit ? '取消' : '提交' }}
        </button> -->
    </div>
</template>


<script setup>
import { v4 as uuidv4 } from 'uuid'

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
        container.value.scrollTop = container.value.scrollHeight
    }
}

function buttonClickHandler() {
    if (props.submit.is_submit) {
        props.submit.stop_generate = true
    } else {
        emits('submitChat')
    }
}
</script>