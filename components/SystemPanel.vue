<template>
  <div
    :style="{ height: height + 'px' }"
    class="px-4 py-3 flex flex-col min-h-[44px] max-h-[400px] w-[800px] border-[0.5px] border-gray-100 transition-all hover:shadow-[0_1px_1px_rgba(0,0,0,.067),0_2px_5px_rgba(0,0,0,.067),0_3px_8px_rgba(0,0,0,.067)] dark:border-gray-500 rounded-md"
  >
    <UButton
      variant="ghost"
      color="gray"
      class="w-full h-[20px] text-black hover:bg-transparent dark:text-gray-300 dark:hover:text-gray-100"
      @click="showDetail"
      :padded="false"
    >
      <template #default>
        <div class="flex w-full h-full gap-2 justify-between">
          <p class="font-medium text-sm">System instructions</p>
          <p class="w-[50px] flex-1 font-light text-ellipsis overflow-hidden">{{ isShow ? "" : systemPrompt.content }}</p>
          <!--根据isshow来判断显示什么组件-->
          <IconTopArrow v-if="isShow"/>
          <IconRename v-else/>
        </div>
      </template>
    </UButton>
    <div class="flex flex-1 mt-2 w-full" v-if="isShow" ref="textarea">
      <UTextarea
        autoresize
        :ui="{ base: 'font-light' }"
        :maxrows="14"
        size="xl"
        :padded="false"
        placeholder="You are a helpful assistant..."
        class="h-full w-full"
        variant="none"
        v-model="systemPrompt.content"
      >
      </UTextarea>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(["systemPrompt"]);

const isShow = ref(false);
const height = ref(44);
const textarea = ref(null);

let beforeCloseHeight = null;

function showDetail() {
  isShow.value = !isShow.value;
  if (!isShow.value) {
    beforeCloseHeight = height.value;
    height.value = 44;
  }
  else {
    if (beforeCloseHeight === null) {
      updateHeight();
    } else {
      height.value = beforeCloseHeight;
    }
  }
}

watch(
  () => props.systemPrompt.content,
  () => {
    updateHeight();
  },
  { immediate: true }
);

// 监控textarea的高度，更新height
function updateHeight() {
  nextTick(() => {
    if (textarea.value) {
      const newHeight = textarea.value.offsetHeight;
      if (newHeight > 0) {
        height.value = 44 + newHeight;
      }
    }
  });
}
</script>
