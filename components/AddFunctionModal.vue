<template>
  <UCard>
    <template #header>
      <h1 class="text-lg font-medium">添加函数</h1>
      <h2>模型将根据用户输入智能地决定是否调用函数。</h2>
    </template>

    <div class="flex flex-col gap-3">
      <div class="flex justify-between items-center">
        <div>定义</div>
        <UDropdown :items="items" label="Example">
          <UButton
            color="white"
            label="Example"
            trailing-icon="i-heroicons-chevron-down-20-solid"
          />
        </UDropdown>
      </div>
      <UTextarea
        :maxrows="25"
        autoresize
        :placeholder="JSON.stringify(functionExamples[1], null, 2)"
        v-model="schema"
      ></UTextarea>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="取消"
          color="gray"
          :ui="{
            rounded: 'rounded-lg',
            color: {
              gray: { solid: 'dark:bg-gray-300/20 dark:hover:bg-zinc-500' },
            },
          }"
          @click="emits('closeModal')"
        />
        <UButton label="保存" color="blue" @click="saveFunction" />
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
const emits = defineEmits(["closeModal", "saveFunction"]);
const props = defineProps(["currentFunction"]);

const schema = ref(props.currentFunction);

const items = [
  [
    {
      label: "get_weather()",
      click: () => {
        schema.value = JSON.stringify(functionExamples[0], null, 2);
      },
    },
    {
      label: "get_stock_price()",
      click: () => {
        schema.value = JSON.stringify(functionExamples[1], null, 2);
      },
    },
  ],
];

const functionExamples = [
  {
    name: "get_weather",
    description: "Determine weather in my location",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state e.g. San Francisco, CA",
        },
        unit: {
          type: "string",
          enum: ["c", "f"],
        },
      },
      additionalProperties: false,
      required: ["location", "unit"],
    },
  },
  {
    name: "get_stock_price",
    description: "Get the current stock price",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The stock symbol",
        },
      },
      additionalProperties: false,
      required: ["symbol"],
    },
  },
];

const saveFunction = () => {
  emits("saveFunction", schema.value);
};
</script>

<style></style>
