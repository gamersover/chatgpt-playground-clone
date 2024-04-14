<template>
    <div class="flex flex-col w-64 gap-4 text-sm font-light h-full p-2 mr-2">
        <div>
            <p>Model</p>
            <select @input="changeModel" class="border-[1px] w-full rounded-md mt-2 p-2 focus:border-e-blue-300">
                <option disabled>CHAT</option>
                <option v-for="(model, index) in models"
                        :key="index"
                        :selected="selectedModel===index"
                        :value="index">
                        {{ model.showName }}
                </option>
            </select>
        </div>
        <div>
            <div class="flex justify-between">
                <p>Temperature</p>
                <input
                    :value="config.temperature"
                    @blur="changeTemperature"
                    placeholder="1"
                    class="w-12 text-right rounded-md border-2 border-white focus:outline-none hover:border-gray-300 focus:border-blue-500"
                />
            </div>
            <input
                :value="config.temperature"
                @input="changeTemperature"
                type="range"
                min="0"
                max="2"
                step="0.01"
                class="w-full cursor-pointer mt-2"
            />
        </div>
        <div>
            <div class="flex justify-between">
                <p>Max Tokens</p>
                <input
                    :value="config.max_tokens"
                    @blur="changeMaxTokens"
                    placeholder="256"
                    class="w-12 text-right rounded-md border-2 border-white focus:outline-none hover:border-gray-300 focus:border-blue-500"
                />
            </div>
            <input
                :value="config.max_tokens"
                @input="changeMaxTokens"
                type="range"
                min="0"
                max="4096"
                step="1"
                class="w-full cursor-pointer mt-2"
            />
        </div>
        <div>
            <p>Stop</p>
            <div class="flex w-full p-2 mt-2 rounded-md border-[1px] hover:border-blue-500">
                <div class="flex flex-wrap w-[90%] gap-1 text-sm">
                    <Chip v-for="(stopword, index) of config.stop" :key="index" :stopword="stopword" @click="removeStopWord(index)"></Chip>
                    <div class="flex w-auto min-w-2">
                        <input class="border-none box-border w-full h-full outline-none" @blur="addStopWord" v-model.trim="stop_word"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
const props = defineProps(['config', 'models'])
const stop_word = ref('')
const selectedModel = ref(0)

function setModelConfig(index) {
    props.config.model = props.models[index].modelName
    props.config.url = props.models[index].baseURL
    props.config.sk = props.models[index].apiKey
}

function changeModel(e) {
    selectedModel.value = e.target.value
    setModelConfig(selectedModel.value)
}

function changeTemperature(e) {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) {
        if (v < 0) {
            props.config.temperature = 0
        } else if (v > 2) {
            props.config.temperature = 2
        } else {
            props.config.temperature = v
        }
    } else {
        props.config.temperature = 1
    }
}

function changeMaxTokens(e) {
    const v = parseInt(e.target.value)
    if (!isNaN(v)) {
        if (v < 0) {
            props.config.max_tokens = 0
        } else if (v > 4096) {
            props.config.max_tokens = 4096
        } else {
            props.config.max_tokens = v
        }
    } else {
        props.config.max_tokens = 256
    }
    e.target.value = props.config.max_tokens
}

function addStopWord() {
    if (stop_word.value.length > 0) {
        props.config.stop.push(stop_word.value)
        stop_word.value = ''
    }
}

function removeStopWord(index) {
    props.config.stop.splice(index, 1)
}
</script>