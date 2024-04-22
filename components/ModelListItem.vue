<template>
    <UButton
        @click="emits('handleModelSelected')"
        color="black"
        variant="ghost"
        :class="{'bg-gray-200': isSelected}"
        class="hover:bg-gray-200 w-full"
    >
        <div class="flex justify-between w-full relative">
            <div
                ref="name" :contenteditable="model.editable" @blur="updateName"
                class="overflow-hidden text-nowrap w-28 max-w-28 h-8 text-base font-normal flex items-center">
                {{ model.showName }}
            </div>
            <UDropdown :items="settings" :popper="{placement: 'bottom-start'}">
                <UButton
                    v-show="isSelected"
                    color="black"
                    variant="ghost"
                    :padded="false"
                >
                    <IconThreeDot size="24"/>
                </UButton>
            </UDropdown>
        </div>
    </UButton>
</template>

<script setup>
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

const settings = [
    [{
        label: "重命名",
        click: () => {
            changeName()
        },
        icon: "i-heroicons-pencil-square",
        class: "text-base"
    },{
        label: "删除",
        click: () => {
            deleteModel()
        },
        icon: "i-heroicons-trash",
        class: "text-red-500 text-base",
        iconClass: "text-red-500"
    }]
]
</script>