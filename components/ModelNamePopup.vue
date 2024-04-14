<template>
    <div v-if="model.showPopup" v-click-outside="() => {model.showPopup=false}" class="absolute -right-32 -bottom-24 z-10">
        <div class="flex flex-col p-2 gap-1 shadow-md bg-white border-[1px] rounded-lg w-[150px] items-start">
            <button @click="emits('changeModelName')" class="flex hover:bg-gray-200 w-full py-2 rounded-lg gap-2 pl-2">
                <RenameIcon />
                重命名</button>
            <button @click="emits('deleteModel')" class="flex text-red-400 hover:bg-gray-200 w-full py-2 rounded-lg gap-2 pl-2">
                <DeleteIcon />
                删除</button>
        </div>
    </div>
</template>

<script setup>
import RenameIcon from './icon/RenameIcon.vue'
import DeleteIcon from './icon/DeleteIcon.vue'

const props = defineProps(['model'])
const emits = defineEmits(['changeModelName', 'deleteModel'])
</script>