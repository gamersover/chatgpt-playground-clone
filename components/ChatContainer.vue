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
    <div class="relative h-full">
      <div class="h-full w-full overflow-y-scroll" ref="container">
        <div
          class="flex flex-col w-full gap-2 items-center my-2 px-4"
          ref="inner"
        >
          <SystemPanel :context="context" />
          <MessageContainer
            v-for="(message, index) of context.messages"
            @change-role="$emit('changeRole', message)"
            @remove-role="$emit('removeMessage', context, index)"
            @remove-tool-call="
              (tool_call_id) => removeToolCall(index, tool_call_id)
            "
            :message="message"
            :functions="context.config.functions"
            :key="message.id"
            :tindex="index"
            :isGenerating="
              index === context.messages.length - 1 && isGenerating
            "
          />
          <UButton
            v-if="visible"
            class="absolute bg-clip-padding right-1/2 translate-x-1/2 z-10 bottom-5 rounded-full border border-gray-300 bg-white dark:bg-neutral-800 dark:border-gray-700 hover:bg-gray-100 hover:dark:bg-[#353740]"
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
</template>

<script setup>
import throttle from "lodash/throttle";

const container = ref(null);
const inner = ref(null);
const visible = ref(false);

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
    if (diff < 5) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  }
}

const updateVisible = throttle(async () => {
  if (!container.value) return;
  const scrollHeight = container.value.scrollHeight;
  const clientHeight = container.value.clientHeight;
  const scrollTop = container.value.scrollTop;

  // 判断滚动条是否接近底部
  await nextTick();
  visible.value = scrollHeight - clientHeight - scrollTop > 40;
}, 200);

let resizeObserver;

onMounted(() => {
  if (container.value && inner.value) {
    // 监听滚动事件
    container.value.addEventListener("scroll", updateVisible);

    // 使用 ResizeObserver 监听容器自身的尺寸变化
    resizeObserver = new ResizeObserver(() => {
      updateVisible();
    });
    resizeObserver.observe(inner.value, {
      childList: true, // 监听子节点的添加或删除
      subtree: true, // 监听后代节点的变化
      characterData: true, // 监听文本内容的变化
    });
  }
});

onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener("scroll", updateVisible);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

async function scrollToBottom() {
  await nextTick();
  container.value.scrollTop = container.value.scrollHeight;
}

const removeToolCall = (index, tool_call_id) => {
  props.context.messages[index].tool_calls = props.context.messages[
    index
  ].tool_calls.filter((tool_call) => tool_call.id !== tool_call_id);
};

watch(
  () => props.context.messages,
  () => {
    autoExpand();
  },
  { deep: true, immediate: true }
);
</script>
