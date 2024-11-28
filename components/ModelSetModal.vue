<template>
  <div class="flex flex-col rounded-2xl dark:text-gray-100">
    <div
      class="h-16 flex justify-between items-center border-b border-black/10 dark:border-white/10 px-4"
    >
      <h1 class="font-medium text-2xl">设置</h1>
      <UButton
        @click="emits('closeModal')"
        variant="ghost"
        color="black"
        class="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-gray-100"
      >
        <IconClose size="24" />
      </UButton>
    </div>
    <div class="flex flex-1">
      <div class="flex flex-col px-4 py-2">
        <UButton
          @click="handleNewModel"
          :class="{ 'bg-gray-200 dark:bg-neutral-700': isAddPanel }"
          class="hover:bg-gray-200 dark:hover:bg-neutral-700 font-normal text-base w-full p-2 text-start"
          label="新建"
          variant="ghost"
          color="black"
        >
        </UButton>
        <ul class="flex flex-col h-[300px] overflow-y-auto w-[200px]">
          <li v-for="(model, index) in models" :key="index">
            <ModelListItem
              :isSelected="currentModel === index"
              @handle-model-selected="handleModelSelected(index)"
              @duplicate-model="duplicateModel(model)"
              @remove-model="removeModel(index)"
              :model="model"
            />
          </li>
        </ul>
      </div>
      <div class="flex flex-col flex-1 justify-around items-center gap-6 p-4">
        <div class="flex flex-col gap-2 w-full">
          <p><span class="text-red-500">*</span> Model UID</p>
          <UInput
            v-model.trim="modelConfig.model"
            :ui="{
              base: 'w-full h-[48px]',
              variant: {
                outline:
                  'ring-gray-300 hover:ring-gray-400 dark:ring-gray-600 dark:hover:ring-gray-500',
              },
            }"
            color="blue"
            size="xl"
          >
          </UInput>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <p><span class="text-red-500">*</span> Base URL</p>
          <UInput
            v-model.trim="modelConfig.url"
            :ui="{
              base: 'w-full h-[48px]',
              variant: {
                outline:
                  'ring-gray-300 hover:ring-gray-400 dark:ring-gray-600 dark:hover:ring-gray-500',
              },
            }"
            color="blue"
            size="xl"
          >
          </UInput>
        </div>
        <div class="flex flex-col gap-2 w-full">
          <p>Secret Key <span class="font-light">可选</span></p>
          <UInput
            v-model.trim="modelConfig.sk"
            :ui="{
              base: 'w-full h-[48px]',
              variant: {
                outline:
                  'ring-gray-300 hover:ring-gray-400 dark:ring-gray-600 dark:hover:ring-gray-500',
              },
            }"
            color="blue"
            size="xl"
            type="password"
          >
          </UInput>
        </div>
        <div class="flex items-center gap-2 self-end">
          <UButton
            @click="testModel"
            label="测试"
            size="xl"
            :disabled="!testButtonEnable"
            :loading="testStatus === 'testing'"
            :ui="{
              variant: {
                solid:
                  'bg-[#10a37f] hover:bg-[#1a7f64] dark:bg-[#1a7f64] dark:hover:bg-[#1a7f64]/80',
              },
            }"
            class="px-3 py-1.5 dark:text-gray-200 disabled:bg-[#10a37f] dark:disabled:bg-[#1a7f64]/30"
          >
          </UButton>
          <UButton
            @click="addOrUpdateModel"
            :label="updateButtonEnable ? '更新' : ' 添加'"
            size="xl"
            :disabled="!canAddOrUpdate"
            color="blue"
            :ui="{
              variant: {
                solid:
                  'dark:bg-blue-800 dark:hover:bg-blue-800/80 disabled:bg-blue-600/50 dark:disabled:bg-blue-700/30',
              },
            }"
            class="px-3 py-1.5 dark:text-gray-200"
          >
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";

const toast = useToast();
const emits = defineEmits(["closeModal"]);
const props = defineProps(["models"]);

const modelConfig = ref({
  model: null,
  url: null,
  sk: null,
});

const isAddPanel = ref(true);
const currentModel = ref(null);

const canTest = ref(false);
const testStatus = ref(null);
const canAddOrUpdate = ref(false);

const testButtonEnable = computed(() => {
  return canTest.value && testStatus.value !== "testing";
});
const updateButtonEnable = computed(() => {
  return (
    currentModel.value !== null &&
    modelConfig.value.model !== null &&
    modelConfig.value.url !== null
  );
});

watch(
  modelConfig,
  () => {
    canTest.value =
      modelConfig.value.model !== null &&
      modelConfig.value.url !== null &&
      modelConfig.value.model.length > 0 &&
      modelConfig.value.url.length > 0;
  },
  { deep: true }
);

function handleNewModel() {
  isAddPanel.value = true;
  currentModel.value = null;
  modelConfig.value = {
    model: null,
    url: null,
    sk: null,
  };
  canAddOrUpdate.value = false;
  testStatus.value = null;
}

function handleModelSelected(index) {
  isAddPanel.value = false;
  currentModel.value = index;
  modelConfig.value = {
    model: props.models[index].modelName,
    url: props.models[index].baseURL,
    sk: props.models[index].apiKey,
  };
  canAddOrUpdate.value = false;
  testStatus.value = null;
}

function addOrUpdateModel() {
  if (updateButtonEnable.value) {
    props.models[currentModel.value].modelName = modelConfig.value.model;
    props.models[currentModel.value].baseURL = modelConfig.value.url;
    props.models[currentModel.value].apiKey = modelConfig.value.sk;
    toast.add({
      title: "成功",
      description: "模型已更新",
      color: "green",
      icon: "i-heroicons-check-circle-20-solid",
    });
  } else {
    props.models.push({
      id: uuidv4(),
      showName: modelConfig.value.model,
      modelName: modelConfig.value.model,
      baseURL: modelConfig.value.url,
      apiKey: modelConfig.value.sk,
      editable: false,
      showPopup: false,
    });
    currentModel.value = props.models.length - 1;
    isAddPanel.value = false;
    toast.add({
      title: "成功",
      description: "模型已添加",
      color: "green",
      icon: "i-heroicons-check-circle-20-solid",
    });
  }
  canAddOrUpdate.value = false;
}

function duplicateModel(config) {
  handleNewModel();
  modelConfig.value = {
    model: config.modelName,
    url: config.baseURL,
    sk: config.apiKey,
  };
}

function removeModel(index) {
  props.models.splice(index, 1);
  handleNewModel();
}

async function testModel() {
  testStatus.value = "testing";

  try {
    const rawResponse = await fetch("/api/openai", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...modelConfig.value,
        messages: [{ role: "user", content: "Hello!" }],
        max_tokens: 1,
        temperature: 0.7,
        stop: [],
        stream: false,
      }),
    });
    const content = await rawResponse.json();

    if (!rawResponse.ok || content.object === "error" || content.error) {
      toast.add({
        description: content.message || content.error.message,
        title: "失败",
        color: "red",
        icon: "i-heroicons-exclamation-circle-20-solid",
      });
    } else {
      toast.add({
        title: "成功",
        description: "模型测试通过",
        color: "green",
        icon: "i-heroicons-check-circle-20-solid",
      });
      canAddOrUpdate.value = true;
    }
    testStatus.value = "finished";
  } catch (e) {
    toast.add({
      title: "失败",
      description: e.toString(),
      color: "red",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
    testStatus.value = "finished";
  }
}
</script>
