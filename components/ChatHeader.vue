<template>
  <div class="flex justify-between p-4">
    <UInputMenu
      v-model="selectedModel"
      :options="models"
      by="id"
      option-attribute="showName"
      trailing-icon="i-heroicons-chevron-up-down-20-solid"
      color="blue"
      size="lg"
      :ui="{
        variant: { outline: 'ring-gray-300 dark:ring-gray-600' },
      }"
      :uiMenu="{
        background: 'dark:bg-neutral-800',
      }"
      @change="setModelConfig"
    >
    </UInputMenu>
    <div class="flex gap-2 items-center">
      <UButton
        variant="ghost"
        color="black"
        square
        class="hover:bg-gray-200 hover:dark:bg-[#353740]"
        @click="$emit('clearMessages')"
      >
        <template #leading>
          <IconClear />
        </template>
      </UButton>
      <UButton
        variant="ghost"
        color="black"
        class="hover:bg-gray-200 hover:dark:bg-[#353740]"
        label="Compare"
        v-if="!isCompared"
        @click="$emit('handleCompareClicked')"
      >
        <template #trailing>
          <IconCompare />
        </template>
      </UButton>
      <UPopover v-if="isCompared" :ui="{ background: 'dark:bg-neutral-800' }">
        <UButton
          variant="ghost"
          color="black"
          square
          class="hover:bg-gray-200 hover:dark:bg-[#353740]"
          label="Settings"
        >
          <IconSetting />
        </UButton>
        <template #panel>
          <div class="p-0">
            <ConfigPanel :config="config" />
          </div>
        </template>
      </UPopover>
      <UButton
        variant="ghost"
        color="black"
        square
        class="hover:bg-gray-200 hover:dark:bg-[#353740]"
        v-if="isCompared"
        @click="$emit('handleClose')"
      >
        <IconClose size="18px" />
      </UButton>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(["config", "models", "isCompared"]);
const emits = defineEmits([
  "clearMessages",
  "handleCompareClicked",
  "handleClose",
]);
const selectedModel = ref(props.config.model);

function setModelConfig() {
  if (selectedModel.value) {
    props.config.model = selectedModel.value;
  }
}

watch(
  () => props.models,
  (newVal) => {
    if (selectedModel.value && !newVal.includes(selectedModel.value)) {
      selectedModel.value = null;
    } else if (!selectedModel.value && newVal.length > 0) {
      selectedModel.value = newVal[0];
    }
  },
  { deep: true }
);
</script>
