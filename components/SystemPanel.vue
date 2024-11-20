<template>
  <UAccordion
    color="gray"
    :ui="{ wrapper: 'flex flex-col w-full', item: { color: '' } }"
    variant="ghost"
    size="sm"
    class="max-w-[800px] rounded-md ring-1 ring-gray-200 dark:ring-gray-700 dark:hover:shadow-black hover:shadow-[0_1px_1px_rgba(0,0,0,.067),0_2px_5px_rgba(0,0,0,.067),0_3px_8px_rgba(0,0,0,.067)]"
    :items="[{ label: 'System instructions', slot: 'item' }]"
  >
    <template #default="{ item, index, open }">
      <div
        class="flex w-full h-[44px] px-4 py-2 gap-4 justify-between items-center"
      >
        <div class="font-medium text-nowrap text-sm">{{ item.label }}</div>
        <div
          :class="{ 'text-gray-500': !open }"
          class="flex-1 h-full max-w-full min-w-0 font-light text-ellipsis overflow-hidden leading-7"
          v-if="!open"
        >
          <span>{{ context.system_prompt }}</span>
        </div>
        <div>
          <UTooltip
            v-if="open"
            text="完成"
            :ui="{ background: 'bg-black dark:bg-black', color: 'text-white' }"
          >
            <UButton
              :padded="false"
              color="black"
              variant="ghost"
              class="w-6 h-6 flex items-center justify-center hover:bg-gray-200 hover:dark:bg-[#353740] rounded-md"
            >
              <IconTopArrow />
            </UButton>
          </UTooltip>
          <UTooltip
            v-else
            text="编辑"
            :ui="{ background: 'bg-black dark:bg-black', color: 'text-white' }"
          >
            <UButton
              :padded="false"
              color="black"
              variant="ghost"
              class="w-6 h-6 flex items-center justify-center hover:bg-gray-200 hover:dark:bg-[#353740] rounded-md"
            >
              <IconEdit />
            </UButton>
          </UTooltip>
        </div>
      </div>
    </template>
    <template #item>
      <div class="px-4">
        <UTextarea
          ref="textareaInput"
          autoresize
          :padded="false"
          size="xl"
          placeholder="You are a helpful assistant..."
          class="w-full"
          variant="none"
          v-model="context.system_prompt"
        >
        </UTextarea>
      </div>
    </template>
  </UAccordion>
</template>

<script setup>
const props = defineProps(["context"]);
const textareaInput = ref(null);

const adjustHeight = () => {
  nextTick(() => {
    if (!textareaInput.value.textarea) return;
    const ta = textareaInput.value.textarea;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
    ta.scrollTop = ta.scrollHeight;
  });
};

watch(() => props.context.system_prompt, adjustHeight);
</script>
