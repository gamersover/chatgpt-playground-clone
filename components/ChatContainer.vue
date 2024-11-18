<template>
  <ChatHeader
    :config="context.config"
    :models="models"
    :isCompared="isCompared"
    @clear-messages="$emit('clearMessages', context)"
    @handle-compare-clicked="$emit('handleCompareClicked')"
    @handle-close="$emit('handleCompareClosed', context)"
  />
  <div
    class="flex relative flex-col flex-1 gap-2 px-4 pt-[0.5px] pb-4 items-center overflow-scroll"
    ref="container"
  >
    <SystemPanel :context="context" />
    <MarkdownMessage
      v-for="(message, index) of context.messages"
      @change-role="$emit('changeRole', message)"
      @remove-role="$emit('removeMessage', context, index)"
      :message="message"
      :key="message.id"
      :isGenerating="index === context.messages.length - 1 && isGenerating"
    />
    <UButton
      class="absolute bg-clip-padding right-1/2 translate-x-1/2 z-10 bottom-10 rounded-full border border-gray-300 bg-white dark:bg-neutral-800 dark:border-gray-700"
      icon="i-heroicons-arrow-down"
      color="gray"
      variant="ghost"
      @click="autoExpand"
    >
    </UButton>
  </div>
</template>

<script setup>
const props = defineProps(["context", "models", "isCompared", "isGenerating"]);
const emits = defineEmits([
  "clearMessages",
  "handleCompareClicked",
  "handleCompareClosed",
  "changeRole",
  "removeMessage",
]);

const container = ref(null);

async function autoExpand() {
  if (container.value) {
    const diff =
      container.value.scrollHeight -
      container.value.scrollTop -
      container.value.clientHeight;
    console.log("###", diff);
    await nextTick();
    if (diff < 1) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  }
}

watch(
  () => props.context.messages,
  () => {
    autoExpand();
  },
  { deep: true, immediate: true }
);
</script>
