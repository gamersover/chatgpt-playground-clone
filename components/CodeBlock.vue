<template>
  <div>
    <div class="border rounded-md border-gray-300 dark:border-neutral-800">
      <pre>
        <div
          class="flex rounded-t-md items-center justify-between py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700"
        >
          <span class="font-medium">{{ lang }}</span>
          <button
            @click="copyCode"
            class="hover:text-gray-700 dark:hover:text-gray-300 flex gap-1 items-center"><IconCopy v-if="!isCopied" /><IconDone size="14" v-else />复制代码</button>
        </div>
        <div class="overflow-y-auto text-base flex py-4 px-4 bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100">
          <code :class="lang" class="flex">
            <div v-html="highlightedCode"></div>
          </code>
        </div>
      </pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import DOMPurify from "isomorphic-dompurify";
import hljs from "highlight.js";

const props = defineProps<{
  lang: string;
  code: string;
}>();
const isCopied = ref(false);

const lang = computed(() => {
  return props.lang || "plaintext";
});

const highlightedCode = computed(() => {
  const language = hljs.getLanguage(lang.value);
  const code = hljs.highlightAuto(props.code, language?.aliases).value
  return DOMPurify.sanitize(code);
});


const copyCode = () => {
  navigator.clipboard.writeText(props.code);
  isCopied.value = true;

  setTimeout(() => {
    isCopied.value = false;
  }, 1000);
};
</script>
