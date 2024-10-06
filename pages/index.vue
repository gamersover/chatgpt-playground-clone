<template>
  <div class="flex flex-col h-screen dark:bg-[#202123] dark:text-gray-200">
    <Header
      :models="models"
      :isCompared="isCompared"
      :context="chatContext[0]"
      @load-preset="loadPreset"
      @reset-preset="resetPreset"
    />
    <UDivider :ui="{ border: { base: 'dark:border-black' } }" />
    <ChatPanel
      :models="models"
      :chatContext="chatContext"
      :submit="submit"
      :isCompared="isCompared"
      @toggle-compare="toggleCompared"
      @submit-chat="submitAll"
    />
    <UNotifications />
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";

const toast = useToast();

const chatContext = ref([
  {
    system_prompt: "",
    messages: [],
    config: {
      model: null,
      temperature: 1,
      max_tokens: 256,
      stop: [],
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
  },
]);
const isCompared = ref(false);

const models = ref([]);

function toggleCompared() {
  isCompared.value = !isCompared.value;
}

const submit = ref({
  is_submit: false,
  stop_generate: false,
  isAvaiable: computed(
    () => models.value.length > 0 && chatContext.value.every(c => c.messages.length > 0)
  ),
});

function setModelConfig(chat_index, model_index) {
  let context = chatContext.value[chat_index];
  context.config.model = models.value[model_index];
}

function loadPreset(preset) {
  for (const context of chatContext.value) {
    context.system_prompt.content = preset.system;
    if (preset.messages) {
      context.messages = preset.messages;
    } else {
      context.messages = [{ role: "user", content: "", id: uuidv4() }];
    }
  }
  toast.add({
    title: "成功",
    description: "场景已加载",
    icon: "i-heroicons-check-circle-20-solid",
    color: "green",
  });
}

function resetPreset() {
  for (const context of chatContext.value) {
    context.system_prompt = "";
    context.messages = [{ role: "user", content: "", id: uuidv4() }];
  }
  toast.add({
    title: "成功",
    description: "场景已重置",
    icon: "i-heroicons-check-circle-20-solid",
    color: "green",
  });
}

onMounted(() => {
  if (localStorage.getItem("models")) {
    models.value = JSON.parse(localStorage.getItem("models"));
    if (models.value.length > 0) {
      for (let index = 0; index < models.value.length; index++) {
        setModelConfig(index, 0);
      }
    }
  }
});

watch(
  models,
  (newVal) => {
    if (newVal.length === 1) {
      for (let index = 0; index < models.value.length; index++) {
        setModelConfig(index, 0);
      }
    } else if (newVal.length === 0) {
      for (const context of chatContext.value) {
        context.config.model = null;
      }
    }
    localStorage.setItem("models", JSON.stringify(newVal));
  },
  { deep: true }
);

async function submitChat(context) {
  try {
    submit.value.is_submit = true;
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: context.config.model.modelName,
        url: context.config.model.baseURL,
        temperature: context.config.temperature,
        max_tokens: context.config.max_tokens,
        stop: context.config.stop,
        top_p: context.config.top_p,
        frequency_penalty: context.config.frequency_penalty,
        presence_penalty: context.config.presence_penalty,
        messages: [
          { role: "system", content: context.system_prompt },
          ...context.messages.map(({ role, content }) => ({
            role: role,
            content: content,
          })),
        ],
        stream: true,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let nextRole = null;
    while (true) {
      if (submit.value.stop_generate) break;
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      const parsedLines = lines
        .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
        .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
        .map((line) => JSON.parse(line));

      for (const parsedLine of parsedLines) {
        if (submit.value.stop_generate) break;
        const { choices } = parsedLine;
        const { delta } = choices[0];

        if (delta === null) continue;

        const { role, content } = delta;

        if (nextRole === null) {
          nextRole = role;
          context.messages.push({
            role: role,
            content: content || "",
            is_focus: false,
            id: uuidv4(),
          });
        } else {
          context.messages[context.messages.length - 1].content +=
            content || "";
        }
      }
    }
    submit.value.is_submit = false;
  } catch (error) {
    console.log(error);
  } finally {
    submit.value.is_submit = false;
    submit.value.stop_generate = false;
  }
}

async function submitAll() {
  console.log(chatContext.value);
  for (const context of chatContext.value) {
    await submitChat(context);
  }
}
</script>
