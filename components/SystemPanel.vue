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
          <IconTopArrow v-if="open" />
          <IconRename v-else />
        </div>
      </div>
    </template>
    <template #item>
      <div class="px-4">
        <UTextarea
          autoresize
          :ui="{ base: 'font-light' }"
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
</script>
