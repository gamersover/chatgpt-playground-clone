<template>
  <div
    :class="{
      'ring-2 ring-blue-600 dark:ring-blue-400': editing,
      'hover:ring-[0.5px] ring-gray-200 dark:hover:ring-gray-600': !editing,
    }"
    class="px-4 py-3 group flex flex-col w-full max-w-[800px] transition-all dark:hover:shadow-black hover:shadow-[0_1px_1px_rgba(0,0,0,.067),0_2px_5px_rgba(0,0,0,.067),0_3px_8px_rgba(0,0,0,.067)] dark:border-gray-500 rounded-md"
  >
    <div
      class="flex flex-col gap-2 w-full"
      ref="textarea"
      :tabindex="tindex"
      @dblclick="handleDblClick"
    >
      <p class="font-medium">
        {{ message.role === "user" ? "User" : "Assistant" }}
      </p>
      <template v-if="editing">
        <UTextarea
          ref="textareaInput"
          autoresize
          size="xl"
          :rows="1"
          :padded="false"
          class="w-full"
          variant="none"
          v-model="message.content"
          :placeholder="
            message.role === 'user'
              ? 'Enter user message...'
              : 'Enter assistant message...'
          "
        >
        </UTextarea>
      </template>
      <template v-else>
        <div
          class="break-words whitespace-pre-wrap"
          v-if="message.role === 'user'"
        >
          {{ message.content }}
        </div>
        <div v-else class="prose dark:prose-invert">
          <template v-for="(token, index) in tokens" :key="index">
            <template v-if="token.type === 'code'">
              <CodeBlock
                :lang="token.lang"
                :code="unsanitizeMd(token.text)"
              ></CodeBlock>
            </template>
            <template v-else>
              <div v-html="santizeMd(token.raw)"></div>
            </template>
          </template>
        </div>
      </template>
      <div v-show="message.tool_calls && message.tool_calls.length > 0">
        <ToolCallPanel
          v-for="tool_call of message.tool_calls"
          :tool_call="tool_call"
          :key="tool_call.id"
          :isEditing="editing"
          @submitToolCall="
            (value) => $emit('submitToolCall', tool_call.id, value)
          "
        />
      </div>
      <div class="flex gap-2 items-center">
        <UTooltip
          :text="editing ? '完成' : '编辑'"
          :ui="{ background: 'bg-black dark:bg-black', color: 'text-white' }"
        >
          <UButton
            @click.stop="editing = !editing"
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
import DOMPurify from "isomorphic-dompurify";
import "katex/dist/katex.min.css";
import CodeBlock from "./CodeBlock.vue";

marked.setOptions({
  highlight: function (code, lang) {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value; // 自动检测语言
  },
});

const renderer = new marked.Renderer();

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

const props = defineProps(["message", "isGenerating", "tindex"]);
const textarea = ref(null);
const textareaInput = ref(null);
const emits = defineEmits(["changeRole", "removeRole", "submitToolCall"]);
const tokens = ref([]);

const editing = ref(false);

onMounted(() => {
  if (props.message.role !== "user") {
    tokens.value = marked.lexer(props.message.content);
  }
});

const handleDblClick = () => {
  editing.value = true;
  nextTick(() => {
    if (textareaInput.value) {
      textareaInput.value.textarea?.focus();
    }
  });
};

watch(
  () => props.message.content,
  () => {
    if (props.message.role !== "user") {
      tokens.value = marked.lexer(props.message.content);
    }
  }
);

function preprocessMarkdown(markdown) {
  return (
    markdown
      // 将 \[...\] 替换为 $$...$$
      .replace(/\\\[((?:.|\n)*?)\\\]/g, (_, math) => `$$${math}$$`)
      // 将 \(...\) 替换为 $...$
      .replace(/\\\(((?:.|\n)*?)\\\)/g, (_, math) => `$${math}$`)
  );
}

const santizeMd = (content) => {
  content = preprocessMarkdown(content);
  const parsed = marked.parse(content, { renderer });
  const santized = DOMPurify.sanitize(parsed, {
    ADD_TAGS: ["math"], // 允许KaTeX使用的math标签
    ADD_ATTR: ["display"], // 允许KaTeX使用的display属性
    USE_PROFILES: { html: true, mathMl: true },
  });
  return santized;
};

const unsanitizeMd = (md) => {
  return md.replaceAll("&lt;", "<");
};

const adjustHeight = () => {
  nextTick(() => {
    if (!textareaInput.value?.textarea) return;
    const ta = textareaInput.value.textarea;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  });
};

watch(() => props.message.content, adjustHeight);

const handleClickOutside = (event) => {
  if (textarea.value && !textarea.value.contains(event.target)) {
    editing.value = false;
  }
};

onMounted(() => {
  // 监听整个文档的点击事件，用于检测点击外部
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  // 清除事件监听
  document.removeEventListener("click", handleClickOutside);
});
</script>
