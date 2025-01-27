<template>
  <div class="flex flex-col p-4 w-64 gap-5 text-sm font-light h-full">
    <div class="flex flex-col gap-3">
      <div class="flex justify-between items-center">
        <h1>Functions</h1>
        <UButton
          class="rounded-full py-1 px-2 bg-gray-200/70 hover:bg-gray-200/90 dark:bg-gray-300/20 dark:hover:bg-zinc-500 transition-colors text-black dark:text-gray-200"
          icon="i-heroicons-plus-small"
          :padded="false"
          label="add"
          @click="addFunction"
        />
      </div>
      <div class="flex flex-col gap-2">
        <div
          class="flex flex-col"
          v-for="(item, index) in config.functions"
          :key="index"
        >
          <div class="flex justify-between group">
            <div class="flex items-center gap-2">
              <IconFunction />
              <p>{{ item.name }}</p>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100">
              <UButton
                class="w-4 h-4 flex items-center justify-center dark:group-hover:text-gray-400 group-hover:text-black hover:bg-gray-200 hover:dark:bg-[#353740] rounded-md"
                icon="i-heroicons-pencil-square"
                variant="ghost"
                color="black"
                :padded="false"
                @click="editFunction(index)"
              />
              <UButton
                class="w-4 h-4 flex items-center justify-center dark:group-hover:text-gray-400 group-hover:text-black hover:bg-gray-200 hover:dark:bg-[#353740] rounded-md"
                icon="i-heroicons-trash"
                variant="ghost"
                color="black"
                :padded="false"
                @click="removeFunction(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-3 group/item">
      <div class="flex justify-between">
        <p>Temperature</p>
        <UInput
          v-model="config.temperature"
          variant="none"
          :ui="{
            base: 'w-16 !py-0.5 !px-1 text-right',
            rounded: 'rounded-md',
            variant: {
              none: 'bg-transparent focus:!ring-blue-500 focus:!ring-2 dark:focus:!ring-blue-400 shadow-none group-hover/item:ring-1 group-hover/item:ring-gray-300 dark:group-hover/item:ring-gray-600',
            },
          }"
          placeholder="1"
          @blur="changeTemperature"
          :padded="false"
        >
        </UInput>
      </div>
      <URange
        v-model="config.temperature"
        :min="0"
        :max="2"
        :step="0.01"
        color="blue"
        size="sm"
      >
      </URange>
    </div>
    <div class="flex flex-col gap-3 group/item">
      <div class="flex justify-between">
        <p>Max Tokens</p>
        <UInput
          v-model="config.max_tokens"
          variant="none"
          :ui="{
            base: 'w-16 !py-0.5 !px-1 text-right',
            rounded: 'rounded-md',
            variant: {
              none: 'bg-transparent focus:!ring-blue-500 dark:focus:!ring-blue-400 focus:!ring-2 shadow-none group-hover/item:ring-1 group-hover/item:ring-gray-300 dark:group-hover/item:ring-gray-600',
            },
          }"
          placeholder="256"
          @blur="changeMaxTokens"
          :padded="false"
        >
        </UInput>
      </div>
      <URange
        v-model="config.max_tokens"
        :min="1"
        :max="4096"
        :step="1"
        color="blue"
        size="sm"
      >
      </URange>
    </div>
    <div class="flex flex-col gap-3">
      <p>Stop</p>
      <div
        class="flex flex-wrap gap-1 text-sm h-auto min-h-10 w-full p-2 rounded-md ring-1 ring-gray-300 focus-within:ring-2 focus-within:!ring-blue-500 dark:focus-within:!ring-blue-400 dark:ring-gray-600 hover:ring-gray-400 dark:hover:ring-gray-500"
      >
        <Chip
          v-for="(stopword, index) of config.stop"
          :key="index"
          :stopword="stopword"
          @remove-stop-word="removeStopWord(index)"
        >
        </Chip>
        <UInput
          v-model.trim="stop_word"
          @blur="addStopWord"
          :ui="{ base: 'max-w-fit min-w-5 h-full' }"
          variant="none"
          :padded="false"
          autosize
        >
        </UInput>
      </div>
    </div>
    <div class="flex flex-col gap-3 group/item">
      <div class="flex justify-between">
        <p>Top p</p>
        <UInput
          v-model="config.top_p"
          variant="none"
          :ui="{
            base: 'w-16 !py-0.5 !px-1 text-right',
            rounded: 'rounded-md',
            variant: {
              none: 'bg-transparent focus:!ring-blue-500 focus:!ring-2 dark:focus:!ring-blue-400 shadow-none group-hover/item:ring-1 group-hover/item:ring-gray-300 dark:group-hover/item:ring-gray-600',
            },
          }"
          placeholder="1"
          @blur="changeTopP"
          :padded="false"
        >
        </UInput>
      </div>
      <URange
        v-model="config.top_p"
        :min="0"
        :max="1"
        :step="0.01"
        color="blue"
        size="sm"
      >
      </URange>
    </div>
    <div class="flex flex-col gap-3 group/item">
      <div class="flex justify-between">
        <p>Frequency penalty</p>
        <UInput
          v-model="config.frequency_penalty"
          variant="none"
          :ui="{
            base: 'w-16 !py-0.5 !px-1 text-right',
            rounded: 'rounded-md',
            variant: {
              none: 'bg-transparent focus:!ring-blue-500 focus:!ring-2 dark:focus:!ring-blue-400 shadow-none group-hover/item:ring-1 group-hover/item:ring-gray-300 dark:group-hover/item:ring-gray-600',
            },
          }"
          placeholder="1"
          @blur="changeFrequencyPenalty"
          :padded="false"
        >
        </UInput>
      </div>
      <URange
        v-model="config.frequency_penalty"
        :min="0"
        :max="1"
        :step="0.01"
        color="blue"
        size="sm"
      >
      </URange>
    </div>
    <div class="flex flex-col gap-3 group/item">
      <div class="flex justify-between">
        <p>Presence penalty</p>
        <UInput
          v-model="config.presence_penalty"
          variant="none"
          :ui="{
            base: 'w-16 !py-0.5 !px-1 text-right',
            rounded: 'rounded-md',
            variant: {
              none: 'bg-transparent focus:!ring-blue-500 focus:!ring-2 dark:focus:!ring-blue-400 shadow-none group-hover/item:ring-1 group-hover/item:ring-gray-300 dark:group-hover/item:ring-gray-600',
            },
          }"
          placeholder="1"
          @blur="changePresencePenalty"
          :padded="false"
        >
        </UInput>
      </div>
      <URange
        v-model="config.presence_penalty"
        :min="0"
        :max="1"
        :step="0.01"
        color="blue"
        size="sm"
      >
      </URange>
    </div>
  </div>
  <div v-if="showFunctionModal">
    <UModal
      v-model="showFunctionModal"
      :ui="{
        width: 'sm:max-w-full !w-[750px]',
        rounded: 'rounded-2xl',
        background: 'dark:bg-neutral-800',
        overlay: { background: 'bg-black/50 dark:bg-black/80' },
      }"
    >
      <AddFunctionModal
        :current-function="currentFunction"
        @close-modal="closeModal"
        @save-function="saveFunction"
      />
    </UModal>
  </div>
</template>

<script setup>
const props = defineProps(["config"]);
const stop_word = ref("");
const showFunctionModal = ref(false);
const currentEditFunctionIndex = ref(null);
const currentFunction = ref(null);
const toast = useToast();

function closeModal() {
  showFunctionModal.value = false;
  currentEditFunctionIndex.value = null;
  currentFunction.value = null;
}

function addFunction() {
  currentEditFunctionIndex.value = null;
  currentFunction.value = null;
  showFunctionModal.value = true;
}

function saveFunction(schema) {
  try {
    const name = JSON.parse(schema).name;

    if (props.config.functions.some((f) => f.name === name)) {
      toast.add({
        title: "错误",
        description: "函数名必须唯一",
        icon: "i-heroicons-x-circle-20-solid",
        color: "red",
      });
      return;
    }

    if (currentEditFunctionIndex.value !== null) {
      props.config.functions[currentEditFunctionIndex.value] = {
        name: name,
        str: schema,
      };
    } else {
      props.config.functions.push({ name: name, str: schema });
    }
    closeModal();
  } catch (e) {
    toast.add({
      title: "错误",
      description: "函数定义格式有误",
      icon: "i-heroicons-x-circle-20-solid",
      color: "red",
    });
  }
}

function editFunction(index) {
  currentEditFunctionIndex.value = index;
  currentFunction.value = props.config.functions[index].str;
  showFunctionModal.value = true;
}

function removeFunction(index) {
  props.config.functions.splice(index, 1);
}

function changeTemperature(e) {
  const v = parseFloat(e.target.value);
  if (!isNaN(v)) {
    if (v < 0) {
      props.config.temperature = 0;
    } else if (v > 2) {
      props.config.temperature = 2;
    } else {
      props.config.temperature = v;
    }
  } else {
    props.config.temperature = 1;
  }
}

function changeMaxTokens(e) {
  const v = parseInt(e.target.value);
  if (!isNaN(v)) {
    if (v < 0) {
      props.config.max_tokens = 0;
    } else if (v > 4096) {
      props.config.max_tokens = 4096;
    } else {
      props.config.max_tokens = v;
    }
  } else {
    props.config.max_tokens = 256;
  }
  e.target.value = props.config.max_tokens;
}

function addStopWord() {
  if (stop_word.value.length > 0) {
    props.config.stop.push(stop_word.value);
    stop_word.value = "";
  }
}

function removeStopWord(index) {
  props.config.stop.splice(index, 1);
}

function changeTopP(e) {
  const v = parseFloat(e.target.value);
  if (!isNaN(v)) {
    if (v < 0) {
      props.config.top_p = 0;
    } else if (v > 1) {
      props.config.top_p = 1;
    } else {
      props.config.top_p = v;
    }
  } else {
    props.config.top_p = 1;
  }
}

function changeFrequencyPenalty(e) {
  const v = parseFloat(e.target.value);
  if (!isNaN(v)) {
    if (v < 0) {
      props.config.frequency_penalty = 0;
    } else if (v > 1) {
      props.config.frequency_penalty = 1;
    } else {
      props.config.frequency_penalty = v;
    }
  } else {
    props.config.frequency_penalty = 1;
  }
}

function changePresencePenalty(e) {
  const v = parseFloat(e.target.value);
  if (!isNaN(v)) {
    if (v < 0) {
      props.config.presence_penalty = 0;
    } else if (v > 1) {
      props.config.presence_penalty = 1;
    } else {
      props.config.presence_penalty = v;
    }
  } else {
    props.config.presence_penalty = 1;
  }
}
</script>
