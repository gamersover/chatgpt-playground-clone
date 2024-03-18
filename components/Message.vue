<template>
    <div class="group flex w-full h-auto pl-2 border-b-[1px] justify-between hover:bg-gray-100">
        <div class="flex w-[10%] h-12 mt-3">
            <button
                @click="$emit('changeRole', message)"
                class="font-medium text-sm group-hover:bg-gray-300 px-2 py-1 rounded">
                {{ message.role.toUpperCase() }}
            </button>
        </div>
        <div class="flex w-[83%] justify-between h-auto my-3 ml-6">
            <textarea
                ref="textarea"
                @input="inputHandler"
                v-model.trim="message.content"
                type="text"
                :placeholder="message.role === 'user' ? 'Type user message here.' : 'Type assistant message here.'"
                class="font-light w-full p-3 inline-block h-12 overflow-y-hidden resize-none rounded-lg border-[1px] focus:border-blue-500 border-transparent focus:outline-none focus:border-solid group-hover:bg-gray-100 focus:!bg-white"
            />
        </div>
        <div class="flex flex-1 h-12 mt-3 items-center justify-center">
            <button @click="$emit('removeRole')" class="text-white group-hover:text-gray-400 hover:!text-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" class="chat-message-remove-button"><path d="M9 11a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z"></path><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" clip-rule="evenodd"></path></svg>
            </button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps(['message'])
const textarea = ref(null)
const emits = defineEmits(['changeRole', 'removeRole', 'autoExpand'])


function autoExpand() {
    let new_height = textarea.value.scrollHeight > 48 ? textarea.value.scrollHeight : 48
    new_height = parseInt(new_height / 24) * 24
    textarea.value.style.height = `${new_height}px`
    textarea.value.scrollTop = textarea.value.scrollHeight
}

function inputHandler(e) {
    emits("autoExpand")
    autoExpand()
    props.message.content = e.target.value
}

watch(() => props.message.content, () => {
    emits('autoExpand')
    autoExpand()
})

onMounted(
    () => {
        if (props.message.is_focus) {
            textarea.value.focus()
        }
    }
)
</script>