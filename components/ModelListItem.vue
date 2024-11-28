<template>
  <UButton
    @click="emits('handleModelSelected')"
    color="black"
    variant="ghost"
    :class="{ 'bg-gray-200 dark:bg-neutral-700': isSelected }"
    class="hover:bg-gray-200 dark:hover:bg-neutral-700 w-full"
    :padded="false"
  >
    <div class="flex justify-between w-full relative px-1">
      <div
        ref="name"
        :contenteditable="model.editable"
        @blur="updateName"
        @dblclick="changeName"
        :class="{ 'dark:bg-neutral-800 bg-white': model.editable }"
        class="overflow-hidden rounded-lg text-nowrap px-1 w-4/5 h-10 text-base font-normal flex items-center focus:border"
      >
        {{ model.showName }}
      </div>
      <UDropdown
        :items="settings"
        :popper="{ placement: 'bottom-start' }"
        :ui="{ background: 'dark:bg-neutral-800' }"
      >
        <UButton
          v-show="isSelected"
          color="black"
          variant="ghost"
          :padded="false"
        >
          <IconThreeDot size="24" />
        </UButton>
      </UDropdown>
    </div>
    <UModal
      v-model="isDelete"
      :ui="{
        rounded: 'rounded-2xl',
        background: 'dark:bg-neutral-800',
        overlay: { background: 'bg-black/50 dark:bg-black/80' },
      }"
    >
      <div class="flex flex-col p-4 gap-6">
        <h1 class="text-lg font-medium">删除模型 "{{ model.showName }}"？</h1>
        <p>该模型将被永久删除，无法恢复，确定继续吗？</p>
        <div class="flex justify-end gap-2">
          <UButton
            label="取消"
            color="gray"
            :ui="{ rounded: 'rounded-lg' }"
            class="text-base dark:bg-gray-300/20 dark:hover:bg-zinc-500"
            @click="isDelete = false"
          >
          </UButton>
          <UButton
            label="删除"
            color="red"
            :ui="{
              rounded: 'rounded-lg',
              variant: { solid: 'dark:bg-red-700 dark:hover:bg-red-600' },
            }"
            class="text-base dark:text-gray-200"
            @click="deleteModel"
          >
          </UButton>
        </div>
      </div>
    </UModal>
  </UButton>
</template>

<script setup>
const props = defineProps(["model", "isSelected"]);
const emits = defineEmits([
  "handleModelSelected",
  "removeModel",
  "duplicateModel",
]);

const name = ref(null);
const isDelete = ref(false);

async function changeName() {
  props.model.editable = true;
  await nextTick();
  const el = name.value;
  el.focus();
  if (
    typeof window.getSelection != "undefined" &&
    typeof document.createRange != "undefined"
  ) {
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
  props.model.showPopup = false;
}

function updateName() {
  props.model.editable = false;
  props.model.showName = name.value.textContent;
}

function deleteModel() {
  emits("removeModel");
  isDelete.value = false;
  props.model.showPopup = false;
}

function duplicateModel(e) {
  e.stopPropagation();
  emits("duplicateModel");
}

const settings = [
  [
    {
      label: "重命名",
      click: () => {
        changeName();
      },
      icon: "i-heroicons-pencil-square",
      class: "text-base dark:text-gray-200",
      iconClass: "dark:text-gray-200",
    },
    {
      label: "复制",
      click: (e) => {
        duplicateModel(e);
      },
      icon: "i-heroicons-document-duplicate",
      class: "text-base dark:text-gray-200",
      iconClass: "dark:text-gray-200",
    },
    {
      label: "删除",
      click: () => {
        isDelete.value = true;
      },
      icon: "i-heroicons-trash",
      class: "text-red-500 dark:text-red-500 text-base",
      iconClass: "text-red-500 dark:text-red-500",
    },
  ],
];
</script>
