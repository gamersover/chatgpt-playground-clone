import OpenAI from "openai";


export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const openai = new OpenAI({ baseURL: body.url, apiKey: body.sk || 'sk-none' });
        const completions = await openai.chat.completions.create({
            model: body.model,
            messages: body.messages,
            temperature: body.temperature,
            max_tokens: body.max_tokens,
            // TODO: huggingface的qwen2.5 top_p不能设置为1，stop不能是[]，penalty不支持，当为0的时候会胡说八道
            // stop: body.stop,
            stream: body.stream,
            top_p: body.top_p,
            frequency_penalty: body.frequency_penalty,
            presence_penalty: body.presence_penalty
        });

        if (body.stream) {
            for await (const chunk of completions) {
                event.node.res.write(JSON.stringify(chunk) + "\n");
            }
            event.node.res.end()
        } else {
            return completions
        }
    } catch (error) {
        return error
    }
})