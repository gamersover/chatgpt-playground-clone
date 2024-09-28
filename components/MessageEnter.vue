<template>
  <div
    class="mb-4 px-4 py-4 flex flex-col min-h-[44px] max-h-[400px] w-[800px] border-[0.5px] border-gray-100 transition-all hover:ring-2 hover:ring-blue-600 dark:border-gray-500 rounded-md"
  >
    <UTextarea
      ref="textarea"
      autoresize
      v-model="message.content"
      color="blue"
      size="xl"
      :rows="1"
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
          class="bg-gray-100 dark:bg-[#353740] group-hover:bg-gray-300 group-hover:dark:bg-gray-500 shadow-none rounded-lg text-black dark:text-gray-100"
        >
          {{ message.role === "user" ? "User" : "Assistant" }}
        </UButton>
      </div>
      <div class="flex gap-2">
        <UButton
          class="bg-gray-100 hover:bg-gray-200 dark:bg-[#353740] shadow-none rounded-lg text-black dark:text-gray-100"
          label="Add"
          color=""
          :disabled="!message.content"
          @click="$emit('addMessage')"
        >
        </UButton>
        <UButton
          :label="submit.is_submit ? 'Cancel' : 'Run'"
          class=" dark:text-gray-200 py-1 px-1.5"
          size="lg"
          :color="submit.is_submit ? 'red' : 'blue'"
          :ui="{
            variant: {
              solid:
                'dark:bg-{color}-800 dark:hover:bg-{color}-700 disabled:bg-{color}-700/50 dark:disabled:bg-{color}-600/50',
            },
          }"
          @click="buttonClickHandler"
          :disabled="!message.content || !submit.isAvaiable"
        >
          <template #trailing>
            <div class="flex items-center gap-1 backdrop-blur-md">
              <UKbd
                :ui="{
                  base: 'text-white dark:text-black',
                  background: '',
                }"
                >{{ metaSymbol }}</UKbd
              >
              <UKbd
                :ui="{
                  base: 'text-white dark:text-black',
                  background: '',
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
