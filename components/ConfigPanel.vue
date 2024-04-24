<template>
    <div class="flex flex-col w-64 gap-5 text-sm font-light h-full p-2 mr-2">
        <div class="flex flex-col gap-3">
            <p>Model</p>
            <UInputMenu
                v-model="selectedModel"
                :options="models"
                by="id"
                option-attribute="showName"
                trailing-icon="i-heroicons-chevron-up-down-20-solid"
                color="blue"
                size="lg"
                :ui="{
                    'variant': {'outline': 'ring-gray-300'},
                }"
                @change="setModelConfig"
            >
            </UInputMenu>
        </div>
        <div class="flex flex-col gap-3">
            <div class="flex justify-between group">
                <p>Temperature</p>
                <UInput
                    v-model="config.temperature"
                    color="blue"
                    :ui="{
                        'base': 'w-16 !py-0.5 !px-1 text-right',
                        'rounded': 'rounded-md',
                        'variant': {'outline': 'ring-0 shadow-none group-hover:ring-1 hover:ring-gray-300'},
                    }"
                    placeholder="1"
                    @blur="changeTemperature"
                    :padded="false"
                >
                </UInput>
            </div>
            <URange
                v-model="config.temperature"
                :min="0"
                :max="2"
                :step="0.01"
                color="blue"
                size="sm"
            >
            </URange>
        </div>
        <div class="flex flex-col gap-3">
            <div class="flex justify-between group">
                <p>Max Tokens</p>
                <UInput
                    v-model="config.max_tokens"
                    color="blue"
                    :ui="{
                        'base': 'w-16 !py-0.5 !px-1 text-right',
                        'rounded': 'rounded-md',
                        'variant': {'outline': 'ring-0 shadow-none group-hover:ring-1 hover:ring-gray-300'},
                    }"
                    placeholder="2048"
                    @blur="changeMaxTokens"
                    :padded="false"
                >
                </UInput>
            </div>
            <URange
                v-model="config.max_tokens"
                :min="0"
                :max="4096"
                :step="1"
                color="blue"
                size="sm"
            >
            </URange>
        </div>
        <div>
            <p>Stop</p>
            <div class="flex h-auto min-h-10 w-full p-2 mt-2 rounded-md border-2 hover:border-blue-500">
                <div class="flex flex-wrap w-full gap-1 text-sm">
                    <Chip v-for="(stopword, index) of config.stop" :key="index" :stopword="stopword" @click="removeStopWord(index)"></Chip>
                    <UInput
                        v-model.trim="stop_word"
                        @blur="addStopWord"
                        :ui="{'base': 'max-w-fit h-full'}"
                        variant="none"
                        :padded="false"
                    >
                    </UInput>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
const props = defineProps(['config', 'models'])
const stop_word = ref('')
const selectedModel = ref(null)

function setModelConfig() {
    if (selectedModel.value) {
        props.config.model = selectedModel.value.modelName
        props.config.url = selectedModel.value.baseURL
        props.config.sk = selectedModel.value.apiKey
    }
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

watch(() => props.models, (newVal) => {
    if (selectedModel.value && !newVal.includes(selectedModel.value)) {
        selectedModel.value = null
    } else if (!selectedModel.value && newVal.length > 0) {
        selectedModel.value = newVal[0]
    }
}, {deep: true})
</script>