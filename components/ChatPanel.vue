<template>
  <div
    class="flex flex-col h-full border-r-[1px] overflow-y-scroll flex-1"
    ref="container"
  >
    <ChatHeader
      :config="config"
      :models="models"
      @clear-messages="clearMessages"
    />
    <div class="flex flex-col gap-2 items-center h-[80%] overflow-auto">
      <SystemPanel :systemPrompt="system_prompt" @change-input="changeInput" />
      <Message
        v-for="(message, index) of messages"
        @change-role="changeRole(message)"
        @remove-role="removeMessage(index)"
        :message="message"
        :key="message.id"
      />
    </div>
    <div class="flex justify-center">
      <MessageEnter
        :message="message"
        :submit="submit"
        @change-role="changeRole"
        @add-message="addMessage"
        @submit-chat="submitChat"
      />
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";

const props = defineProps([
  "messages",
  "submit",
  "config",
  "models",
  "system_prompt",
]);
const emits = defineEmits(["submitChat"]);

const container = ref(null);
const message = ref({
  role: "user",
  content: "",
  is_focus: true,
  id: uuidv4(),
});

function changeInput(prompt) {
  props.system_prompt.value = prompt;
}

function clearMessages() {
  props.messages.splice(0, props.messages.length);
}

function addMessage(isRun = false) {
  props.messages.push({ ...message.value });
  let role = null;
  if (isRun) {
    role = message.value.role;
  } else {
    role = message.value.role == "user" ? "assistant" : "user";
  }
  message.value = {
    role: role,
    content: "",
    is_focus: true,
    id: uuidv4(),
  };
}

function removeMessage(index) {
  props.messages.splice(index, 1);
}

function changeRole(message) {
  message.role = message.role === "user" ? "assistant" : "user";
}

function submitChat() {
  addMessage(true);
  emits("submitChat");
}

async function autoExpand() {
  await nextTick();
  if (container.value) {
    const diff =
      container.value.scrollHeight -
      container.value.scrollTop -
      container.value.clientHeight;
    if (diff < 70) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  }
}

watch(
  () => props.messages,
  () => {
    autoExpand();
  },
  { deep: true, immediate: false }
);

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
