<template>
  <div
    tabindex="1"
    :class="{
      'ring-2 ring-blue-600 dark:ring-blue-400': editing,
      'hover:ring-[0.5px] ring-gray-200 dark:hover:ring-gray-600': !editing,
    }"
    class="px-4 py-3 group flex flex-col w-full max-w-[800px] transition-all dark:hover:shadow-black hover:shadow-[0_1px_1px_rgba(0,0,0,.067),0_2px_5px_rgba(0,0,0,.067),0_3px_8px_rgba(0,0,0,.067)] dark:border-gray-500 rounded-md"
  >
    <div
      class="flex flex-col gap-2 w-full"
      ref="textarea"
      @dblclick="isGenerating ? null : (editing = true)"
    >
      <p class="font-medium text-sm">
        {{ message.role === "user" ? "User" : "Assistant" }}
      </p>
      <template v-if="editing">
        <UTextarea
          ref="textareaInput"
          autoresize
          size="xl"
          :rows="1"
          :padded="false"
          class="h-full w-full"
          variant="none"
          v-model="message.content"
          :placeholder="
            message.role === 'user'
              ? 'Enter user message...'
              : 'Enter assistant message...'
          "
          @blur="editing = false"
        >
        </UTextarea>
      </template>
      <template v-else>
        <div v-if="message.role === 'user'">
          {{ message.content }}
        </div>
        <div
          v-else
          class="prose dark:prose-invert"
          v-html="renderedContent"
        ></div>
      </template>
      <div class="flex gap-2 items-center">
        <UTooltip
          :text="editing ? '完成' : '编辑'"
          :ui="{ background: 'bg-black dark:bg-black', color: 'text-white' }"
        >
          <UButton
            @click="editing = !editing"
            :padded="false"
            color="black"
            :disabled="isGenerating"
            variant="ghost"
            class="w-6 h-6 flex items-center justify-center dark:group-hover:text-gray-400 group-hover:text-black hover:bg-gray-200 hover:dark:bg-[#353740] rounded-md"
            :class="{ 'text-transparent': !editing }"
          >
            <IconEdit v-if="!editing" />
            <IconDone v-else />
          </UButton>
        </UTooltip>
        <UTooltip
          text="删除"
          :ui="{ background: 'bg-black dark:bg-black', color: 'text-white' }"
        >
          <UButton
            @click="$emit('removeRole')"
            :padded="false"
            color="black"
            variant="ghost"
            :disabled="isGenerating"
            class="w-6 h-6 flex items-center justify-center dark:group-hover:text-gray-400 group-hover:text-black hover:bg-gray-200 hover:dark:bg-[#353740] rounded-md"
            :class="{ 'text-transparent': !editing }"
          >
            <IconDelete />
          </UButton>
        </UTooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { marked } from "marked";
import katex from "katex";
import hljs from "highlight.js";
import DOMPurify from "isomorphic-dompurify";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
import { onMounted, onUnmounted } from "vue";

marked.setOptions({
  highlight: function (code, lang) {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value; // 自动检测语言
  },
});

const renderer = new marked.Renderer();

const handleClick = (e) => {
  const copyButton = e.target.closest("[data-copy-button]");
  if (copyButton) {
    const codeBlock = copyButton
      .closest(".code-block-container")
      .querySelector("code");
    if (codeBlock) {
      navigator.clipboard.writeText(codeBlock.textContent);
      copyButton.textContent = "已复制!";
      setTimeout(() => {
        copyButton.textContent = "复制代码";
      }, 2000);
    }
  }
};

onMounted(() => {
  document.addEventListener("click", handleClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClick);
});

renderer.listitem = function ({ text }) {
  // 在列表项内容上应用marked解析，以支持嵌套的Markdown语法
  return "<li>" + marked.parseInline(text) + "</li>";
};

renderer.text = function ({ text }) {
  // 处理独立公式 ($$...$$)
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
    } catch (e) {
      console.error("KaTeX error:", e);
      return math;
    }
  });

  // 处理行内公式 ($...$)
  text = text.replace(/\$([^\$]*?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch (e) {
      console.error("KaTeX error:", e);
      return math;
    }
  });

  return text;
};

renderer.code = function ({ text: code, lang }) {
  const language = lang || "plaintext";
  const highlighted = hljs.highlight(code, { language }).value;

  return `
        <div class="code-block-container border rounded-md border-gray-300 dark:border-neutral-800">
            <div class="flex rounded-t-md justify-between p-2 text-sm font-medium text-gray-500 bg-gray-100 dark:bg-neutral-900">
              <span class="font-medium">${language}</span>
              <button class="hover:text-gray-700 dark:hover:text-gray-300" data-copy-button>复制代码</button>
            </div>
            <pre class="!my-0 !p-0 !rounded-none"><code class="hljs ${language}">${highlighted}</code></pre>
        </div>
    `;
};

const props = defineProps(["message", "isGenerating"]);
const textarea = ref(null);
const textareaInput = ref(null);
const emits = defineEmits(["changeRole", "removeRole"]);

const editing = ref(false);

const renderedContent = computed(() => {
  if (props.message.role === "user") {
    return props.message.content;
  } else {
    const rawHtml = marked(props.message.content, { renderer });
    // 使用DOMPurify净化HTML
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ["math"], // 允许KaTeX使用的math标签
      ADD_ATTR: ["display"], // 允许KaTeX使用的display属性
      USE_PROFILES: { html: true, mathMl: true },
    });
  }
});

watch(
  () => editing.value,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        textareaInput.value.textarea?.focus();
      });
    }
  }
);
</script>

<style>
.prose {
  width: 100%;
}
.prose h1 {
  font-size: 2em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}
.prose h2 {
  font-size: 1.5em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}
.prose h3 {
  font-size: 1.25em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}
.prose p {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.prose ul {
  list-style-type: disc;
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.prose ol {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #6b7280;
}

.copy-button {
  background: none;
  border: none;
  color: #0366d6;
  cursor: pointer;
  font-size: 14px;
}
.copy-button:hover {
  text-decoration: underline;
}
</style>
