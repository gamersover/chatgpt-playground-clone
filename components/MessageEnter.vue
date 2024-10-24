<template>
  <div
    class="mb-4 mx-4 p-4 flex flex-col min-h-[44px] max-h-[400px] w-full max-w-[800px] ring-1 ring-gray-300 transition-all hover:ring-2 hover:ring-blue-600 dark:hover:ring-blue-400 dark:ring-gray-500 rounded-md"
  >
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
        base: 'font-light',
      }"
      :placeholder="
        message.role === 'user'
          ? 'Enter user message...'
          : 'Enter assistant message...'
      "
    >
    </UTextarea>
    <div class="flex justify-between items-center pt-4">
      <div>
        <UButton
          @click="$emit('changeRole', message)"
          class="bg-gray-100 dark:bg-[#353740] hover:bg-gray-300 hover:dark:bg-gray-600 shadow-none rounded-lg text-black dark:text-gray-100"
          color="gray"
          variant="ghost"
        >
          {{ message.role === "user" ? "User" : "Assistant" }}
        </UButton>
      </div>
      <div class="flex gap-2">
        <UButton
          class="bg-gray-100 disabled:text-gray-500 disabled:bg-gray-200/40 dark:disabled:bg-gray-200/10 hover:bg-gray-300 hover:dark:bg-gray-600 dark:bg-[#353740] shadow-none rounded-lg text-black dark:text-gray-100"
          label="Add"
          color="gray"
          variant="ghost"
          :disabled="!message.content"
          @click="$emit('addMessage')"
        >
        </UButton>
        <UButton
          :label="submit.is_submit ? 'Cancel' : 'Run'"
          class="dark:text-gray-200 py-1 px-1.5"
          :color="submit.is_submit ? 'red' : 'blue'"
          :ui="{
            variant: {
              solid:
                'dark:bg-{color}-700 dark:hover:bg-{color}-600 disabled:text-gray-500 disabled:bg-gray-200/40 dark:disabled:bg-gray-200/10',
            },
          }"
          @click="buttonClickHandler"
          :disabled="!message.content && !submit.isAvaiable"
        >
          <template #trailing>
            <div
              class="flex items-center gap-1 px-1 bg-white/10 rounded-md backdrop-blur-md"
            >
              <UKbd
                :ui="{
                  base: 'text-none',
                  size: {sm: 'min-w-0'},
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
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(["message", "submit"]);
const textarea = ref(null);
const emits = defineEmits(["changeRole", "addMessage", "submitChat"]);

const { metaSymbol } = useShortcuts();

onMounted(() => {
  textarea.value.textarea?.focus();
});

function buttonClickHandler() {
  if (props.submit.is_submit) {
    props.submit.stop_generate = true;
  } else {
    emits("submitChat");
  }
}

defineShortcuts({
  meta_enter: {
    usingInput: true,
    handler: buttonClickHandler,
  },
});
</script>
