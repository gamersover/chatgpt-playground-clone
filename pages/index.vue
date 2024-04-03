<template>
    <div class="flex flex-col h-screen">
        <Header />
        <div class="flex-1 overflow-scroll m-4 gap-6 flex justify-center items-start">
            <SystemPanel :systemPrompt="system_prompt" @change-input="changeInput"/>
            <ChatPanel :messages="messages" :submit="submit" @submit-chat="submitChat"/>
            <ConfigPanel :config="config" />
        </div>
    </div>
</template>

<script setup>
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

const system_prompt = ref('')

const config = ref({
    model: "solar",
    temperature: 1,
    max_tokens: 256,
    stop: []
})
const messages = ref([{
    role: "user",
    content: "",
    is_focus: true,
    id: uuidv4()
}])
const submit = ref({
    is_submit: false,
    stop_generate: false
})

function changeInput(prompt) {
    system_prompt.value = prompt
}

async function submitChat() {
    try {
        submit.value.is_submit = true
        const openai = new OpenAI({
            baseURL: "http://localhost:3000/ollama",
            apiKey: "sk-none",
            dangerouslyAllowBrowser: true
        })
        const stream = await openai.chat.completions.create({
            messages: [{role: "system", content: system_prompt.value}, ...messages.value.map(({role, content}) => ({role: role, content: content}))],
            model: config.value.model,
            temperature: config.value.temperature,
            max_tokens: config.value.max_tokens,
            stream: true,
            stop: config.value.stop
        })
        let content = ""
        let role = null
        for await (const chunck of stream) {
            if (submit.value.stop_generate) break
            if (role === null) {
                role = chunck.choices[0]?.delta?.role
                content = chunck.choices[0]?.delta?.content || ''
                messages.value.push({
                    role: role,
                    content: content,
                    is_focus: false,
                    id: uuidv4()
                })
            }
            else {
                messages.value[messages.value.length - 1].content += chunck.choices[0]?.delta?.content || ""
            }
            submit.value.is_submit = false
        }
    }  catch (error) {
        console.log(error)
    } finally {
        submit.value.is_submit = false
        submit.value.stop_generate = false
    }
}
</script>