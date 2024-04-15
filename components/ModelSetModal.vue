<template>
<div class="flex flex-col w-[750px] h-[500px] max-w-[750px] max-h-[600px] bg-white rounded-2xl shadow-md">
    <div class="h-20 flex justify-between items-center border-b-[1px] px-4">
        <h1 class="font-medium text-2xl">设置</h1>
        <button @click="emits('closeModal')" class="w-5 h-5 hover:text-gray-700">
            <CloseIcon size="24"/>
        </button>
    </div>
    <div class="flex flex-1">
        <ul class="flex flex-col w-[230px] px-4 pt-4">
            <li>
                <button @click="handleAddButton" class="hover:bg-gray-100 w-full p-2 rounded-md text-start">新建</button>
            </li>
            <li v-for="(model, index) in models" :key="index">
                <ModelListItem :isSelected="currentModel===index" @HandleModelSelected="handleModelSelected(index)" @RemoveModel="removeModel" :model="model"/>
            </li>
        </ul>
        <div class="flex flex-col flex-1 justify-around items-center gap-10 p-4">
            <div class="flex flex-col gap-2 w-full">
                <p><span class="text-red-500">*</span> Model UID</p>
                <input v-model="modelConfig.model" class="border-[1px] w-full h-[50px] rounded-lg p-2"/>
            </div>
            <div class="flex flex-col gap-2 w-full">
                <p><span class="text-red-500">*</span> Base URL</p>
                <input v-model="modelConfig.url" class="border-[1px] w-full h-[50px] rounded-lg p-2"/>
            </div>
            <div class="flex flex-col gap-2 w-full">
                <p>Secret Key (Optional)</p>
                <input v-model="modelConfig.sk" type="password" class="border-[1px] w-full h-[50px] rounded-lg p-2"/>
            </div>
            <div class="flex gap-2 self-end">
                <button @click="testModel" :class="{'disable bg-gray-200': !isTestEnable, 'bg-green-500 hover:bg-green-600': isTestEnable}" class="text-white border-[1px] py-2 px-2 rounded-lg">测试</button>
                <button @click="addModel" :class="{'disable bg-gray-200': !addButtonEnable}" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded-lg">添加</button>
            </div>
        </div>
    </div>
</div>
</template>


<script setup>
import CloseIcon from './icon/CloseIcon.vue'


const emits = defineEmits(["closeModal"])
const props = defineProps(['models'])

const isAddPanel = ref(true)
const isTesting = ref(false)
const addButtonEnable = ref(false)
const isTestEnable = computed(() => {
    return modelConfig.value.model!==null && modelConfig.value.url!==null && !(isTesting.value)
})

const currentModel = ref(null)

const modelConfig = ref({
    model: null,
    url: null,
    sk: null
})

function handleAddButton() {
    isAddPanel.value = true
    currentModel.value = null
    modelConfig.value = {
        model: null,
        url: null,
        sk: null
    }
    addButtonEnable.value = false
}

function handleModelSelected(index) {
    isAddPanel.value = false
    currentModel.value = index
    modelConfig.value = {
        model: props.models[index].modelName,
        url: props.models[index].baseURL,
        sk: props.models[index].apiKey
    }
    addButtonEnable.value = false
}

function addModel() {
    props.models.push({
        showName: modelConfig.value.model,
        modelName: modelConfig.value.model,
        baseURL: modelConfig.value.url,
        apiKey: modelConfig.value.sk,
        editable: false,
        showPopup: false
    })
    currentModel.value += 1
}

function removeModel() {
    props.models.splice(currentModel.value, 1)
    handleAddButton()
}

async function testModel() {
    isTesting.value = true

    const rawResponse = await fetch("/api/openai", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...modelConfig.value,
            messages: [{role: "user", content: "Hello!"}],
            max_tokens: 1,
            temperature: 0.7,
            stop: [],
            stream: false
        })
    })
    const content = await rawResponse.json()

    if (content.error) {
        alert(content.error.error.message)
    } else {
        addButtonEnable.value = true
    }
    isTesting.value = false
}
</script>