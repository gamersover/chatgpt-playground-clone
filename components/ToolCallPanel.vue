<template>
  <div
    v-show="tool_call.type == 'function'"
    class="relative flex flex-col gap-2 rounded-md bg-gray-100 dark:bg-neutral-800 p-2"
  >
    <UTooltip
      text="删除"
      class="absolute right-2 top-2 z-10"
      :ui="{ background: 'bg-black dark:bg-black', color: 'text-white' }"
    >
      <UButton
        @click="$emit('removeToolCall')"
        :padded="false"
        color="black"
        variant="ghost"
        class="w-6 h-6 flex items-center justify-center dark:group-hover:text-gray-400 group-hover:text-black hover:bg-gray-200 hover:dark:bg-[#353740] rounded-md"
      >
        <IconDelete />
      </UButton>
    </UTooltip>
    <template v-if="isEditing">
      <p class="text-sm">函数名：</p>
      <UInput
        color="blue"
        variant="outline"
        v-model="tool_call.function.name"
        :ui="{
          variant: {
            outline:
              'bg-white dark:bg-neutral-900 ring-gray-300 dark:ring-gray-600 transition-all',
          },
        }"
      ></UInput>
      <p class="text-sm">参数：</p>
      <CodeMirror
        minimal
        wrap
        :dark="is_dark"
        :model-value="formattedArguments"
        @update:model-value="onArgumentsChange"
        :lang="lang"
        :linter="linter"
        class="bg-white dark:bg-neutral-900 ring-[1px] rounded-md ring-gray-300 dark:ring-gray-600 focus-within:ring-2 focus-within:ring-blue-600 dark:focus-within:ring-blue-300 transition-all"
      />
    </template>
    <template v-else>
      <CodeMirror :dark="is_dark" minimal wrap readonly v-model="args" :lang="lang" class="" />
    </template>
    <div class="flex flex-col gap-2">
      <p v-show="isEditing" class="text-sm">返回结果：</p>
      <UInput
        color="blue"
        variant="outline"
        v-model="tool_call.tool_input"
        :ui="{
          icon: { trailing: { pointer: '' } },
          variant: {
            outline:
              'bg-white dark:bg-neutral-900 ring-gray-300 dark:ring-gray-600 transition-all',
          },
        }"
      >
        <template #leading>
          <UIcon name="i-carbon-direction-right-01" class="-scale-y-100" />
        </template>
      </UInput>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CodeMirror from "vue-codemirror6";
import { json, jsonParseLinter } from "@codemirror/lang-json";

const lang = json();
const linter = jsonParseLinter();

const is_dark = ref(document.documentElement.classList.contains('dark'))

let observer: MutationObserver

onMounted(() => {
  observer = new MutationObserver(() => {
    is_dark.value = document.documentElement.classList.contains('dark')
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'] // 只监听 class 变化
  })
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

interface ToolCall {
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
  tool_input: string;
}

interface Props {
  tool_call: ToolCall;
  isEditing: boolean;
}

const props = defineProps<Props>();

const args = computed(() => {
  let formattedArgs;
  try {
    formattedArgs = JSON.stringify(
      JSON.parse(props.tool_call.function.arguments),
      null,
      2
    );
  } catch (e) {
    formattedArgs = props.tool_call.function.arguments;
  }
  return props.tool_call.function.name + "(" + formattedArgs + ")";
});

const formattedArguments = computed(() =>
  args.value.slice(args.value.indexOf("(") + 1, -1)
);

function onArgumentsChange(value: string) {
  props.tool_call.function.arguments = value;
}

defineEmits(["removeToolCall"]);
</script>
