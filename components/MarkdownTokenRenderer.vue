<template>
  <template v-for="(token, index) in tokens" :key="index">
    <ul v-if="token.type === 'list'">
        <li v-for="(listItem, idx) in token.items" :key="idx">
          <!-- Recursively render list items, each containing tokens -->
          <MarkdownTokenRenderer :tokens="listItem.tokens" />
        </li>
    </ul>
    <template v-else-if="token.type === 'code'">
      <CodeBlock
        :lang="token.lang"
        :code="unsanitizeMd(token.text)"
      ></CodeBlock>
    </template>
    <template v-else>
      <div v-html="santizeMd(token.raw)"></div>
    </template>
  </template>
</template>

<script setup>
import { marked } from "marked";
import katex from "katex";
import DOMPurify from "isomorphic-dompurify";
import "katex/dist/katex.min.css";
import CodeBlock from "./CodeBlock.vue";

const props = defineProps({
  tokens: {
    type: Array,
    required: true,
  },
});

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
  return "<li>" + marked.parse(text) + "</li>";
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
</script>