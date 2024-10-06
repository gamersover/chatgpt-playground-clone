export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(body)
    try {
        const response = await fetch(body.url + "/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${body.sk || 'sk-none'}`
            },
            body: JSON.stringify({
                messages: body.messages,
                model: body.model,
                temperature: body.temperature,
                max_tokens: body.max_tokens,
                stop: body.stop,
                stream: body.stream,
                top_p: body.top_p,
                frequency_penalty: body.frequency_penalty,
                presence_penalty: body.presence_penalty
            })
        })
        return sendStream(event, response.body)
    } catch (e) {
        return {error: e.toString()}
    }

})