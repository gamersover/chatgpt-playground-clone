<template>
    <div class="group flex w-full h-auto rounded-md border-gray-200 border-b-[1px] justify-between hover:bg-gray-200">
        <div class="flex items-center justify-left h-12 w-[8rem] pl-4 mt-3">
            <button
                @click="$emit('changeRole', message)"
                class="font-medium text-sm group-hover:bg-gray-300 px-2 py-2 rounded-lg">
                {{ message.role.toUpperCase() }}
            </button>
        </div>
        <div class="flex flex-1 justify-between h-auto my-3">
            <textarea
                ref="textarea"
                @input="inputHandler"
                v-model="message.content"
                type="text"
                :placeholder="message.role === 'user' ? 'Type user message here.' : 'Type assistant message here.'"
                class="font-light w-full p-3 inline-block h-12 overflow-y-hidden resize-none rounded-lg border-[2px] focus:border-blue-500 border-transparent focus:outline-none focus:border-solid group-hover:bg-gray-200 focus:!bg-white"
            />
        </div>
        <div class="flex w-10 h-12 mt-3 items-center justify-center">
            <button @click="$emit('removeRole')" class="text-white group-hover:text-gray-400 hover:!text-black">
                <CircleMinusIcon size="20"/>
            </button>
        </div>
    </div>
</template>

<script setup>
import CircleMinusIcon from './icon/CircleMinusIcon.vue'

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

watch(() => props.message.content, async () => {
    await nextTick()
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