<template>
  <div class="flex-1 flex min-h-0">
    <div class="flex-1 h-full flex flex-col gap-4 justify-center">
      <div
        class="flex justify-center flex-1 min-h-0"
        :class="{ 'border-b-[1px] dark:border-black': isCompared }"
      >
        <div
          class="flex flex-col w-full h-full min-h-0"
          :class="{ 'border-r-[1px] dark:border-black': isCompared }"
          v-for="context of chatContext"
        >
          <ChatContainer
            :context="context"
            :models="models"
            :isCompared="isCompared"
            @clear-messages="clearMessages"
            @handle-compare-clicked="handleCompareClicked"
            @handle-compare-closed="handleCompareClosed"
            @change-role="changeRole"
            @remove-message="removeMessage"
            :isGenerating="submit.is_submit"
          />
        </div>
      </div>
      <div class="flex justify-center items-end h-auto">
        <MessageEnter
          :message="message"
          :submit="submit"
          @change-role="changeRole"
          @add-message="addMessage"
          @submit-chat="submitChat"
          @set-stop-generate="setStopGenerate"
        />
      </div>
    </div>
    <UDivider
      :ui="{ border: { base: 'dark:border-black' } }"
      orientation="vertical"
      v-show="!isCompared"
    />
    <div
      class="justify-center overflow-scroll hidden md:flex min-w-[260px]"
      v-show="!isCompared"
    >
      <ConfigPanel :config="chatContext[0].config" />
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import ChatContainer from "./ChatContainer.vue";

const props = defineProps(["submit", "models", "chatContext", "isCompared"]);
const emits = defineEmits(["submitChat", "toggleCompare"]);

const message = ref({
  role: "user",
  content: null,
  tool_calls: null,
  is_focus: true,
  id: uuidv4(),
});

function handleCompareClicked() {
  emits("toggleCompare");
  const newContext = JSON.parse(JSON.stringify(props.chatContext[0]));
  props.chatContext.push(newContext);
}

function handleCompareClosed(context) {
  emits("toggleCompare");
  props.chatContext.splice(props.chatContext.indexOf(context), 1);
}

function clearMessages(context) {
  context.messages.splice(0, context.messages.length);
}

function setStopGenerate() {
  props.chatContext.forEach(element => {
    element.stop_generate = true;
  });
}

function addMessage(isRun = false) {
  if (message.value.content) {
    for (const context of props.chatContext) {
      context.messages.push({ ...message.value });
    }
  }
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

function removeMessage(context, index) {
  context.messages.splice(index, 1);
}

function changeRole(message) {
  message.role = message.role === "user" ? "assistant" : "user";
}

function submitChat() {
  addMessage(true);
  emits("submitChat");
}
</script>
