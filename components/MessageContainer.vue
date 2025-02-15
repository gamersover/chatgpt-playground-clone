<template>
  <div
    :class="{
      'ring-2 ring-blue-600 dark:ring-blue-400': editing,
      'hover:ring-[0.5px] ring-gray-200 dark:hover:ring-gray-600': !editing,
    }"
    class="px-4 py-3 group flex flex-col w-full max-w-[800px] transition-all dark:hover:shadow-black hover:shadow-[0_1px_1px_rgba(0,0,0,.067),0_2px_5px_rgba(0,0,0,.067),0_3px_8px_rgba(0,0,0,.067)] dark:border-gray-500 rounded-md"
    ref="textarea"
  >
    <div
      class="flex flex-col gap-2 w-full"
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
          <details
            open
            v-if="message.reasoning_content && message.reasoning_content.length > 0"
            class="group bg-transparent rounded-lg"
          >
            <summary
              class="flex items-center justify-between cursor-pointer font-semibold text-gray-800 dark:text-gray-100"
            >
              <span
                class="font-normal text-gray-500 dark:text-gray-400 hover:text-gray-600 hover:dark:text-gray-300"
                >深度思考，持续{{ message.reasoning_seconds}}秒</span
              >
              <!-- 这里的 SVG 箭头会在 details 展开时旋转 -->
              <svg
                class="w-5 h-5 transition-transform duration-200 group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div
              class="overflow-hidden transition-all duration-300 ease-in-out max-h-0 group-open:max-h-full border-l-2 pl-4 border-neutral-800 dark:border-white"
            >
              <div class="text-gray-600 dark:text-gray-300">
                {{ message.reasoning_content }}
              </div>
            </div>
          </details>
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
          @removeToolCall="$emit('removeToolCall', tool_call.id)"
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

const thinkExtension = {
  name: "think", // 自定义 token 名称
  level: "block", // 作为块级解析（因为 <think> 通常是一个块级元素）
  start(src) {
    // 从源文本中找到 <think> 出现的位置
    return src.indexOf("<think>");
  },
  tokenizer(src, tokens) {
    // 使用正则匹配整个 <think> ... </think> 块
    const rule = /^<think>\s*([\s\S]*?)\s*<\/think>/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: "think", // token 类型名称
        raw: match[0], // 完整匹配的原始文本
        text: match[1], // 标签内部内容（可以包含换行）
        tokens: this.lexer.blockTokens(match[1].trim()), // 递归解析内部内容（如果内部还包含 Markdown 语法）
      };
    }
  },
  renderer(token) {
    // 在渲染阶段，将 token 渲染为自定义的 HTML
    // 这里我们使用 <div class="think"> 包裹渲染后的内容
    const content = token.text.replace(/\n/g, "<br>");
    return `<details
              open
              class="group bg-transparent rounded-lg"
            >
              <summary
                class="flex items-center justify-between cursor-pointer font-semibold text-gray-800 dark:text-gray-100"
              >
                <span class="font-normal text-gray-500 dark:text-gray-400 hover:text-gray-600 hover:dark:text-gray-300">深度思考</span>
                <!-- 这里的 SVG 箭头会在 details 展开时旋转 -->
                <svg
                  class="w-5 h-5 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div
                class="overflow-hidden transition-all duration-300 ease-in-out max-h-0 group-open:max-h-[500px] border-l-2 pl-4 border-neutral-800 dark:border-white"
              >
                <div class="text-gray-600 dark:text-gray-300">
                  ${content}
                </div>
              </div>
            </details>`;
  },
};

marked.use({ extensions: [thinkExtension] });

const props = defineProps(["message", "isGenerating", "tindex"]);
const textarea = ref(null);
const textareaInput = ref(null);
const emits = defineEmits(["changeRole", "removeRole", "removeToolCall"]);
const tokens = ref([]);

const editing = ref(false);

onMounted(() => {
  if (props.message.role !== "user") {
    tokens.value = marked.lexer(props.message.content, { gfm: true });
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
