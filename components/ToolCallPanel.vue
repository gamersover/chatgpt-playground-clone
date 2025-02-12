<template>
  <div
    v-show="tool_call.type == 'function'"
    class="relative flex flex-col gap-2 rounded-md bg-gray-100 dark:bg-neutral-800 p-2"
  >
    <UTooltip
      text="删除"
      class="absolute right-2 top-2"
      :ui="{ background: 'bg-black dark:bg-black', color: 'text-white' }"
    >
      <UButton
        @click="$emit('removeToolCall')"
        :padded="false"
        color="black"
        variant="ghost"
        class="w-6 h-6 flex items-center justify-center dark:group-hover:text-gray-400 group-hover:text-black hover:bg-gray-200 hover:dark:bg-[#353740] rounded-md"
      >
        <IconDelete />
      </UButton>
    </UTooltip>
    <template v-if="isEditing">
      函数名：<UInput color="blue" variant="outline" v-model="tool_call.function.name"></UInput>
      参数：<UInput color="blue" variant="outline" v-model="tool_call.function.arguments"></UInput>
    </template>
    <template v-else>
      <p>{{ tool_call.function.name }}({{ tool_call.function.arguments }})</p>
    </template>
    <div class="flex flex-col gap-2">
      <p v-show="isEditing">返回结果：</p>
      <UInput
        color="blue"
        variant="outline"
        v-model="tool_call.tool_input"
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template #leading>
          <UIcon name="i-carbon-direction-right-01" class="-scale-y-100" />
        </template>
      </UInput>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface ToolCall {
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
  tool_input: string;
}

interface Props {
  tool_call: ToolCall;
  isEditing: boolean;
}

defineProps<Props>();

defineEmits(["removeToolCall"]);
</script>
