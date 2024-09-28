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
    <div class="flex gap-2">
      <UButton
        variant="ghost"
        color="black"
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
      >
        <template #trailing>
          <IconCompare />
        </template>
      </UButton>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(["config", "models"]);
const emits = defineEmits(["clearMessages"]);
const selectedModel = ref(null);

function setModelConfig() {
  if (selectedModel.value) {
    props.config.model = selectedModel.value.modelName;
    props.config.url = selectedModel.value.baseURL;
    props.config.sk = selectedModel.value.apiKey;
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
