<template>
    <div class="w-screen h-16 border-b-[1px] border-gray-300 flex justify-between items-center pl-4 pr-8">
        <h1 class="font-medium text-2xl">Playground</h1>
        <div class="flex gap-2">
            <UInputMenu
                trailing-icon="i-heroicons-chevron-up-down-20-solid"
                color="blue"
                :ui="{
                    'variant': {'outline': 'ring-gray-300'},
                }"
                placeholder="预设场景"
                :options="presets"
                by="id"
                option-attribute="label"
                v-model="currentPreset"
                @change="emits('loadPreset', currentPreset)"
            >
            </UInputMenu>
            <UButton
                label="保存"
                class="bg-gray-200/70 hover:bg-gray-200/90 transition-colors py-1 text-black"
                @click="showSaveModal=true"
                >
            </UButton>
            <UModal v-model="showSaveModal" :ui="{rounded: 'rounded-2xl'}">
                <PresetSaveModal @SavePreset="addPreset" @CloseModal="showSaveModal=false"/>
            </UModal>
            <UDropdown :items="currentPreset ? settings : [settings[1]]" :popper="{ placement: 'bottom-start' }">
                <UButton
                    class="bg-gray-200/70 hover:bg-gray-200/90 transition-colors py-1 text-black"
                >
                    <IconThreeDot size="24"/>
                </UButton>
            </UDropdown>
            <UModal v-model="isShowModal" :ui="{rounded: 'rounded-2xl'}">
                <ModelSetModal @CloseModal="closeModal" :models="props.models"/>
            </UModal>

            <UModal v-model="showDeletePresetModal" :ui="{rounded: 'rounded-2xl'}">
                <DeletePresetModal :preset-name="currentPreset?.label" @DeletePreset="deletePreset" @CloseModal="showDeletePresetModal=false"/>
            </UModal>
        </div>
    </div>
</template>


<script setup>
const toast = useToast()

const props = defineProps(['models', 'prompt', 'messages'])
const emits = defineEmits(['loadPreset'])
const isShowModal = ref(false)
const showSaveModal = ref(false)
const currentPreset = ref(null)
const showDeletePresetModal = ref(false)

const presets = ref([])

const settings = ref([
    [{
        label: "删除场景",
        class: 'text-red-500 text-base',
        click: () => {
            showDeletePresetModal.value = true
        },
        disabled: computed(() => currentPreset.value === null)
    }],[{
        label: "模型设置",
        click: () => {
            isShowModal.value=true
        },
        class: "text-base"
    }]
])

function deletePreset() {
    showDeletePresetModal.value = false
    presets.value = presets.value.filter((item) => item.id != currentPreset.value.id)
    currentPreset.value = null
    toast.add({
        title: '删除成功',
        description: '场景已删除',
        icon: 'i-heroicons-check-circle-20-solid',
        color: 'green',
    })
}

function closeModal() {
    isShowModal.value = false
}

function addPreset(name, desc, save_chat) {
    const preset = {
        id: presets.value.length+1,
        label: name,
        desc: desc,
        system: props.prompt.content,
    }
    if (save_chat) {
        preset.messages = JSON.parse(JSON.stringify(props.messages))
    }
    presets.value.push(preset)
    toast.add({
        title: '添加成功',
        description: '场景已添加',
        icon: 'i-heroicons-check-circle-20-solid',
        color: 'green',
    })
}

onMounted(async () => {
    if (localStorage.getItem("presets")) {
        presets.value = JSON.parse(localStorage.getItem("presets"))
    }

    await nextTick()
    if (props.models.length == 0) {
        isShowModal.value = true
    }
})

watch(presets, (newVal) => {
    localStorage.setItem("presets", JSON.stringify(newVal))
}, {deep: true})
</script>