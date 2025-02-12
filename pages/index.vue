<template>
  <div class="flex flex-col h-[100vh] dark:bg-[#202123] dark:text-gray-200">
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
      functions: [],
    },
    stop_generate: false,
  },
]);
const isCompared = ref(false);

const models = ref([]);

function toggleCompared() {
  isCompared.value = !isCompared.value;
}

const submit = ref({
  is_submit: false,
  isAvaiable: computed(
    () =>
      models.value.length > 0 &&
      chatContext.value.every(
        (c) => c.system_prompt.length > 0 || c.messages.length > 0
      )
  ),
});

function setModelConfig(chat_index, model_index) {
  let context = chatContext.value[chat_index];
  context.config.model = models.value[model_index];
}

function loadPreset(preset) {
  for (const context of chatContext.value) {
    context.system_prompt = preset.system;
    context.config = preset.config;
    if (preset.messages) {
      context.messages = JSON.parse(JSON.stringify(preset.messages));
    } else {
      context.messages = [];
    }
  }
  toast.add({
    title: "成功",
    description: "场景已加载",
    icon: "i-heroicons-check-circle-20-solid",
    color: "blue",
  });
}

function resetPreset() {
  for (const context of chatContext.value) {
    context.system_prompt = "";
    context.messages = [];
    context.config = {
      model: null,
      temperature: 1,
      max_tokens: 256,
      stop: [],
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      functions: [],
    };
  }
  toast.add({
    title: "成功",
    description: "场景已重置",
    icon: "i-heroicons-check-circle-20-solid",
    color: "blue",
  });
}

onMounted(() => {
  if (localStorage.getItem("models")) {
    models.value = JSON.parse(localStorage.getItem("models"));
    if (models.value.length > 0) {
      for (let index = 0; index < chatContext.value.length; index++) {
        setModelConfig(index, 0);
      }
    }
  }
});

watch(
  models,
  (newVal) => {
    if (newVal.length === 1) {
      for (let index = 0; index < chatContext.value.length; index++) {
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

function convertMessagesWithToolCalls(messages) {
  const new_messages = [];
  for (const message of messages) {
    if (message.tool_calls && message.tool_calls.length > 0) {
      const { role, content, tool_calls } = message;
      const real_tool_calls = [];
      const tool_inputs = [];
      for (const tool_call of tool_calls) {
        const { tool_input, ...real_tool_call } = tool_call;
        real_tool_calls.push(real_tool_call);
        tool_inputs.push({
          role: "tool",
          name: real_tool_call.function.name,
          content: tool_input,
          tool_call_id: tool_call.id,
        });
      }
      new_messages.push({ role, content, tool_calls: real_tool_calls });
      new_messages.push(...tool_inputs);
    } else {
      const { role, content } = message;
      new_messages.push({
        role,
        content,
      });
    }
  }
  return new_messages;
}

async function submitChat(context) {
  try {
    // console.log("输入", context.messages);
    const converted_messages = convertMessagesWithToolCalls(context.messages);
    // console.log("转换后", converted_messages);
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: context.config.model.modelName,
        url: context.config.model.baseURL,
        sk: context.config.model.apiKey,
        temperature: context.config.temperature,
        max_tokens: context.config.max_tokens,
        stop: context.config.stop,
        top_p: context.config.top_p,
        frequency_penalty: context.config.frequency_penalty,
        presence_penalty: context.config.presence_penalty,
        functions: context.config.functions.map(({ str }) => ({
          type: "function",
          function: JSON.parse(str),
        })),
        messages: [
          { role: "system", content: context.system_prompt },
          ...converted_messages,
        ],
        stream: true,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let message_index = -1;
    let start_time = null;
    while (true) {
      if (context.stop_generate) break;
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      const parsedLines = lines
        .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
        .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch (error) {
            console.error(`Error parsing line as JSON: ${error}`);
            return null;
          }
        })
        .filter((line) => line !== null);

      for (const parsedLine of parsedLines) {
        if (context.stop_generate) break;
        const { choices } = parsedLine;
        if (!choices || !choices[0]) continue;

        const { delta } = choices[0];
        if (!delta) continue;

        const { role, content, tool_calls, reasoning_content } = delta;

        if (message_index === -1) {
          context.messages.push({
            role,
            content: "",
            reasoning_content: "",
            tool_calls: [],
            is_focus: false,
            id: uuidv4(),
            reasoning_seconds: 0,
          });
          start_time = Math.floor(Date.now() / 1000);
          message_index = context.messages.length - 1;
        }
        context.messages[message_index].content += content || "";
        context.messages[message_index].reasoning_content +=
          reasoning_content || "";
        // 使用时间函数计算总共用了多少秒
        if (reasoning_content && reasoning_content.length > 0) {
          context.messages[message_index].reasoning_seconds =
            Math.floor(Date.now() / 1000) - start_time;
        }

        if (tool_calls) {
          for (const tool_call of tool_calls) {
            if (
              context.messages[message_index].tool_calls.length <=
              tool_call.index
            ) {
              context.messages[message_index].tool_calls.push({
                id: tool_call.id,
                type: "function",
                function: {
                  name: tool_call.function.name,
                  arguments: tool_call.function.arguments || "",
                },
              });
            } else if (tool_call.function.arguments) {
              context.messages[message_index].tool_calls[
                tool_call.index
              ].function.arguments += tool_call.function.arguments;
            }
          }
        }
      }
    }
    if (context.messages[message_index].tool_calls) {
      for (const tool_call of context.messages[message_index].tool_calls) {
        tool_call.tool_input = null;
      }
    }

    // console.log("输出", context.messages);
  } catch (error) {
    console.log(error);
  } finally {
    context.stop_generate = false;
  }
}

async function submitAll() {
  // TODO: is_submit的状态应该是所有请求都完成后改变
  submit.value.is_submit = true;
  const res = await Promise.allSettled(
    chatContext.value.map((context) => submitChat(context))
  );
  submit.value.is_submit = false;
}
</script>
