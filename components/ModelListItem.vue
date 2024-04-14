<template>
    <button @click="emits('handleModelSelected')" :class="{'bg-gray-200/50': isSelected}" class="hover:bg-gray-200/50 w-full px-2 py-1 rounded-md text-start">
        <div class="flex justify-between relative">
            <div ref="name" :contenteditable="model.editable" @blur="updateName" class="overflow-hidden text-nowrap w-28 max-w-28 h-8 flex items-center">{{ model.showName }}</div>
            <button v-show="isSelected" @click="model.showPopup=!(model.showPopup)">
                <ThreeDotIcon />
            </button>
            <ModelNamePopup @ChangeModelName="changeName" @DeleteModel="deleteModel" :model="model"/>
        </div>
    </button>
</template>

<script setup>
import ThreeDotIcon from './icon/ThreeDotIcon.vue'


const props = defineProps(['model', 'isSelected'])
const emits = defineEmits(['handleModelSelected', 'removeModel'])

const name = ref(null)

async function changeName() {
    props.model.editable = true
    await nextTick()
    const el = name.value
    el.focus()
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
      }
    props.model.showPopup = false
}

function updateName() {
    props.model.editable = false
    props.model.showName = name.value.textContent
}

function deleteModel() {
    emits('removeModel')
    props.model.showPopup = false
}
</script>