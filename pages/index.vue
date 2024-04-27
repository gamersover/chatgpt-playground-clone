<template>
    <div class="flex flex-col h-screen dark:bg-[#202123] dark:text-gray-200">
        <Header
            :models="models"
            :prompt="system_prompt"
            :messages="messages"
            @load-preset="loadPreset"
            @reset-preset="resetPreset"/>
        <UDivider :ui="{'border': {'base':  'dark:border-black'}}"/>
        <div class="flex-1 overflow-scroll m-4 gap-6 flex justify-center items-start">
            <SystemPanel :systemPrompt="system_prompt" @change-input="changeInput"/>
            <ChatPanel :messages="messages" :submit="submit" @submit-chat="submitChat"/>
            <ConfigPanel :config="config" :models="models"/>
        </div>
        <UNotifications/>
    </div>
</template>

<script setup>
import { v4 as uuidv4 } from 'uuid'

const toast = useToast()

const system_prompt = ref({content: ''})
const models = ref([])
const config = ref({
    model: null,
    url: null,
    sk: "",
    temperature: 1,
    max_tokens: 256,
    stop: []
})

const messages = ref([{
    role: "user",
    content: "",
    id: uuidv4()
}])

const submit = ref({
    is_submit: false,
    stop_generate: false,
    isAvaiable: computed(() => config.value.url !== null && config.value.model !== null)
})

function setModelConfig(index) {
    config.value.model = models.value[index].modelName
    config.value.url = models.value[index].baseURL
    config.value.sk = models.value[index].apiKey
}

function loadPreset(preset) {
    system_prompt.value.content = preset.system
    if (preset.messages) {
        messages.value = preset.messages
    } else {
        messages.value = [{role: "user", content: "", id: uuidv4()}]
    }
    toast.add({
        title: "成功",
        description: "场景已加载",
        icon: "i-heroicons-check-circle-20-solid",
        color: "green",
    })
}

function resetPreset() {
    system_prompt.value.content = ""
    messages.value = [{role: "user", content: "", id: uuidv4()}]
    toast.add({
        title: "成功",
        description: "场景已重置",
        icon: "i-heroicons-check-circle-20-solid",
        color: "green",
    })
}

onMounted(() => {
    if (localStorage.getItem("models")) {
        models.value = JSON.parse(localStorage.getItem("models"))
        if (models.value.length > 0) {
            setModelConfig(0)
        }
    }
})

watch(models, (newVal) => {
    if (newVal.length === 1) {
        setModelConfig(0)
    } else if (newVal.length === 0) {
        config.value.model = null
        config.value.url = null
        config.value.sk = ""
    }
    localStorage.setItem("models", JSON.stringify(newVal))
}, {deep: true})


function changeInput(prompt) {
    system_prompt.value = prompt
}

async function submitChat() {
    try {
        submit.value.is_submit = true
        const response = await fetch("/api/openai", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...config.value,
                messages: [{role: "system", content: system_prompt.value.content}, ...messages.value.map(({role, content}) => ({role: role, content: content}))],
                stream: true
            })
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder("utf-8")
        let nextRole = null
        while (true) {
            if (submit.value.stop_generate) break
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n")
            const parsedLines = lines
                .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
                .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
                .map((line) => JSON.parse(line))

            for (const parsedLine of parsedLines) {
                if (submit.value.stop_generate) break
                const { choices } = parsedLine;
                const { delta } = choices[0];

                if (delta === null) continue

                const { role, content } = delta;

                if (nextRole === null) {
                    nextRole = role
                    messages.value.push({
                        role: role,
                        content: content || '',
                        is_focus: false,
                        id: uuidv4()
                    })
                }
                else {
                    messages.value[messages.value.length - 1].content += content || ""
                }
            }
        }
        submit.value.is_submit = false
    }  catch (error) {
        console.log(error)
    } finally {
        submit.value.is_submit = false
        submit.value.stop_generate = false
    }
}
</script>