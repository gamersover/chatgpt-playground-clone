<template>
  <div
    tabindex="1"
    class="px-4 py-3 group flex flex-col w-full max-w-[800px] hover:ring-[0.5px] ring-gray-200 dark:hover:ring-gray-600 transition-all dark:hover:shadow-black hover:shadow-[0_1px_1px_rgba(0,0,0,.067),0_2px_5px_rgba(0,0,0,.067),0_3px_8px_rgba(0,0,0,.067)] dark:border-gray-500 rounded-md"
  >
    <div class="flex flex-col gap-2 w-full" ref="textarea">
      <p class="font-medium text-sm">
        {{ message.role === "user" ? "User" : "Assistant" }}
      </p>
      <UTextarea
        autoresize
        :ui="{ base: 'font-light' }"
        :rows="1"
        size="xl"
        :padded="false"
        class="h-full w-full"
        variant="none"
        v-model="message.content"
        :placeholder="
          message.role === 'user'
            ? 'Enter user message...'
            : 'Enter assistant message...'
        "
      >
      </UTextarea>
      <UButton
        @click="$emit('removeRole')"
        :padded="false"
        color="black"
        variant="ghost"
        class="text-transparent dark:group-hover:text-gray-400 group-hover:text-black"
      >
        <IconDelete />
      </UButton>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(["message"]);
const textarea = ref(null);
const emits = defineEmits(["changeRole", "removeRole"]);
</script>
