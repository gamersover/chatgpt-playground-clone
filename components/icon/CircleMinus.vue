<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    fill="currentColor"
    viewBox="0 0 24 24"
    class="chat-message-remove-button"
  >
    <path d="M9 11a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z"></path>
    <path
      fill-rule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z"
      clip-rule="evenodd"
    ></path>
  </svg>
</template>

<script setup>
const props = defineProps(["size"]);
</script>
