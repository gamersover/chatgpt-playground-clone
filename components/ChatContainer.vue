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
    class="flex flex-col flex-1 gap-2 px-4 pt-[0.5px] pb-4 items-center overflow-scroll"
    ref="container"
  >
    <SystemPanel :context="context" />
    <Message
      v-for="(message, index) of context.messages"
      @change-role="$emit('changeRole', message)"
      @remove-role="$emit('removeMessage', context, index)"
      :message="message"
      :key="message.id"
    />
  </div>
</template>

<script setup>
const props = defineProps(["context", "models", "isCompared"]);
const emits = defineEmits([
  "clearMessages",
  "handleCompareClicked",
  "handleCompareClosed",
  "changeRole",
  "removeMessage",
])

const container = ref(null);

async function autoExpand() {
  await nextTick();
  if (container.value) {
    const diff =
      container.value.scrollHeight -
      container.value.scrollTop -
      container.value.clientHeight;
    if (diff < 120) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  }
}

watch(
  () => props.context.messages,
  () => {
    autoExpand();
  },
  { deep: true, immediate: false }
);
</script>
