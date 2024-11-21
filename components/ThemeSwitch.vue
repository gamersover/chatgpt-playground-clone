<template>
  <div>
    <UButtonGroup class="bg-gray-400/40 dark:bg-black rounded-xl px-1 py-0.5">
      <UButton
        icon="i-heroicons-sun"
        color="gray"
        variant="ghost"
        @click="setTheme('light')"
        class="rounded-xl transition-colors"
        :class="{
          'text-blue-400 bg-white dark:text-blue-600 ':
            colorMode.preference === 'light',
          'text-gray-600 hover:text-gray-900 bg-transparent dark:text-gray-300 dark:hover:text-gray-100 dark:bg-transparent':
            colorMode.preference !== 'light',
        }"
        :ui="{
          variant: { solid: 'dark:bg-gray-300/20 dark:hover:bg-zinc-500' },
        }"
      ></UButton>
      <UButton
        icon="i-heroicons-moon"
        color="gray"
        variant="ghost"
        @click="setTheme('dark')"
        class="rounded-xl transition-colors"
        :class="{
          'text-blue-400 dark:hover:text-blue-600 dark:bg-gray-800':
            colorMode.preference === 'dark',
          'text-gray-600 hover:text-gray-900 bg-transparent dark:text-gray-300 dark:hover:text-gray-100 dark:bg-transparent':
            colorMode.preference !== 'dark',
        }"
      ></UButton>
      <UButton
        icon="i-heroicons-computer-desktop-20-solid"
        color="gray"
        variant="ghost"
        class="rounded-xl transition-colors"
        :class="{
          'text-blue-400 dark:text-blue-600 bg-white hover:bg-white dark:hover:text-blue-600 dark:bg-gray-800':
            colorMode.preference === 'system',
          'text-gray-600 hover:text-gray-900 bg-transparent dark:text-gray-300 dark:hover:text-gray-100 dark:bg-transparent':
            colorMode.preference !== 'system',
        }"
        @click="setTheme('system')"
      >
      </UButton>
    </UButtonGroup>
  </div>
</template>

<script lang="ts" setup>
const colorMode = useColorMode();

function setTheme(theme: string) {
  colorMode.preference = theme;
}
</script>
