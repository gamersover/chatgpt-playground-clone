<template>
  <form
    class="gap-4 mb-4 mx-4 p-4 flex flex-col min-h-[44px] max-h-[400px] w-full max-w-[800px] ring-1 ring-gray-300 transition-all hover:ring-2 hover:ring-blue-600 dark:hover:ring-blue-400 dark:ring-gray-500 rounded-md"
  >
    <div class="flex flex-col gap-4 overflow-auto">
      <UTextarea
        ref="textarea"
        autoresize
        v-model="message.content"
        color="blue"
        size="xl"
        :rows="1"
        :maxrows="7"
        class="w-full"
        :ui="{
          padding: { xl: 'px-1 py-0' },
          variant: { outline: 'ring-0 shadow-none focus:ring-0' },
        }"
        :placeholder="
          message.role === 'user'
            ? 'Enter user message...'
            : 'Enter assistant message...'
        "
      >
      </UTextarea>
      <div
        class="flex flex-col gap-2"
        v-show="message.tool_calls && message.tool_calls.length > 0"
      >
        <ToolCallPanel
          v-for="tool_call of message.tool_calls"
          :tool_call="tool_call"
          :key="tool_call.id"
          :isEditing="true"
          @removeToolCall="() => removeFunction(tool_call.id)"
        />
      </div>
    </div>
    <div class="flex justify-between items-center">
      <div class="flex gap-1">
        <UButton
          @click="$emit('changeRole', message)"
          class="bg-gray-100 dark:bg-[#353740] hover:bg-gray-300 hover:dark:bg-gray-600 shadow-none rounded-lg text-black dark:text-gray-100"
          color="gray"
          variant="ghost"
        >
          {{ message.role === "user" ? "User" : "Assistant" }}
        </UButton>
        <UTooltip
          v-if="message.role === 'assistant' && validFunctions.length > 0"
          text="添加函数"
          :ui="{
            base: 'px-1.5 py-1 h-full rounded-md text-white',
            background: 'bg-black',
          }"
          :popper="{ placement: 'top' }"
        >
          <UButton color="gray" variant="ghost" @click="addFunction">
            <IconFunction :size="20" />
          </UButton>
        </UTooltip>
      </div>
      <div class="flex gap-2">
        <UButton
          class="bg-gray-100 disabled:text-gray-500 disabled:bg-gray-200/40 dark:disabled:bg-gray-200/10 hover:bg-gray-300 hover:dark:bg-gray-600 dark:bg-[#353740] shadow-none rounded-lg text-black dark:text-gray-100"
          label="Add"
          color="gray"
          variant="ghost"
          :disabled="
            (!message.content &&
              (!message.tool_calls || message.tool_calls.length === 0)) ||
            submit.is_submit
          "
          @click="$emit('addMessage')"
        >
        </UButton>
        <UButton
          :label="submit.is_submit ? 'Stop' : 'Run'"
          class="dark:text-gray-200 py-1 px-1.5"
          :color="submit.is_submit ? 'red' : 'blue'"
          :ui="{
            variant: {
              solid:
                'dark:bg-{color}-700 dark:hover:bg-{color}-600 disabled:text-gray-500 disabled:bg-gray-200/40 dark:disabled:bg-gray-200/10',
            },
          }"
          @click="buttonClickHandler"
          :disabled="
            !message.content &&
            (!message.tool_calls || message.tool_calls.length === 0) &&
            !submit.isAvaiable
          "
        >
          <template #trailing>
            <template v-if="submit.is_submit">
              <UIcon
                name="i-heroicons-arrow-path-20-solid"
                class="animate-spin"
              />
            </template>
            <template v-else>
              <div
                class="flex items-center gap-1 px-1 bg-white/10 rounded-md backdrop-blur-md"
              >
                <UKbd
                  :ui="{
                    base: 'text-none',
                    size: { sm: 'min-w-0' },
                    ring: 'ring-0',
                    background: 'bg-transparent dark:bg-transparent',
                    padding: 'px-0',
                  }"
                  >{{ metaSymbol }}</UKbd
                >
                <UKbd
                  :ui="{
                    base: 'text-none',
                    ring: 'ring-0',
                    background: 'bg-transparent dark:bg-transparent',
                    padding: 'px-0',
                  }"
                  >Enter</UKbd
                >
              </div>
            </template>
          </template>
        </UButton>
      </div>
    </div>
  </form>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";

const props = defineProps(["message", "submit", "validFunctions"]);
const textarea = ref(null);
const emits = defineEmits([
  "changeRole",
  "addMessage",
  "submitChat",
  "setStopGenerate",
]);

const { metaSymbol } = useShortcuts();

onMounted(() => {
  textarea.value.textarea?.focus();
});

function buttonClickHandler() {
  if (props.submit.is_submit) {
    emits("setStopGenerate");
  } else {
    emits("submitChat");
  }
}

function addFunction() {
  if (props.message.role === "assistant") {
    if (!props.message.tool_calls) {
      props.message.tool_calls = [];
    }
    props.message.tool_calls.push({
      id: uuidv4(),
      type: "function",
      function: {
        name: "",
        arguments: "",
      },
      tool_input: "",
    });
  }
}

function removeFunction(id) {
  props.message.tool_calls = props.message.tool_calls.filter(
    (tool_call) => tool_call.id !== id
  );
}

// const handleTab = (e) => {
//   if (e.key === "Tab") {
//     e.preventDefault();
//     const start = e.target.selectionStart;
//     const end = e.target.selectionEnd;
//     const value = e.target.value;
//     e.target.value =
//       value.substring(0, start) + "\t" + value.substring(end, value.length);
//     e.target.selectionStart = e.target.selectionEnd = start + 1;
//   }
// }

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: () => {
      if (props.submit.isAvaiable || props.message.content) {
        buttonClickHandler();
      }
    },
  },
});
</script>
