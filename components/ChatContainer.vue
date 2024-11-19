<template>
  <ChatHeader
    :config="context.config"
    :models="models"
    :isCompared="isCompared"
    @clear-messages="$emit('clearMessages', context)"
    @handle-compare-clicked="$emit('handleCompareClicked')"
    @handle-close="$emit('handleCompareClosed', context)"
  />
  <div class="flex-1 overflow-hidden">
    <div class="h-full">
      <div class="relative h-full">
        <div
          class="h-full w-full overflow-y-scroll scroll-smooth"
          ref="container"
          @scroll="handleScroll"
        >
          <div class="flex flex-col w-full gap-2 items-center my-2">
            <SystemPanel :context="context" />
            <MarkdownMessage
              v-for="(message, index) of context.messages"
              @change-role="$emit('changeRole', message)"
              @remove-role="$emit('removeMessage', context, index)"
              :message="message"
              :key="message.id"
              :isGenerating="
                index === context.messages.length - 1 && isGenerating
              "
            />
            <UButton
              v-if="visable"
              class="absolute bg-clip-padding right-1/2 translate-x-1/2 z-10 bottom-5 rounded-full border border-gray-300 bg-white dark:bg-neutral-800 dark:border-gray-700"
              icon="i-heroicons-arrow-down"
              square
              color="gray"
              variant="ghost"
              @click="scrollToBottom"
            >
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const container = ref(null);
const visable = ref(false);

const props = defineProps(["context", "models", "isCompared", "isGenerating"]);
const emits = defineEmits([
  "clearMessages",
  "handleCompareClicked",
  "handleCompareClosed",
  "changeRole",
  "removeMessage",
]);

async function autoExpand() {
  if (container.value) {
    const diff =
      container.value.scrollHeight -
      container.value.scrollTop -
      container.value.clientHeight;
    await nextTick();
    if (diff < 20) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  }
}

async function handleScroll() {
  if (!container.value) return;
  const diff =
    container.value.scrollHeight -
    container.value.scrollTop -
    container.value.clientHeight;
  visable.value = diff > 50;
}

async function scrollToBottom() {
  await nextTick();
  container.value.scrollTop = container.value.scrollHeight;
}

watch(
  () => props.context.messages,
  () => {
    autoExpand();
  },
  { deep: true, immediate: true }
);
</script>
