<template>
    <div class="w-screen h-16 flex justify-between items-center pl-4 pr-8">
        <h1 class="font-medium text-2xl">Playground</h1>
        <div class="flex gap-2">
            <USelectMenu
                color="blue"
                :ui="{
                    base: 'w-44',
                    variant: {outline: 'ring-gray-300'},
                    icon: { trailing: { pointer: '' } }
                }",
                :uiMenu="{
                    option: {container: 'w-full'}
                }"
                placeholder="未选择预设场景"
                :options="presets"
                by="id"
                option-attribute="label"
                v-model="currentPreset"
                @update:modelValue="changePreset"
            >
                <template #trailing>
                    <UButton
                        v-if="currentPreset != null"
                        icon="i-heroicons-x-mark-20-solid"
                        :padded="false"
                        color="gray"
                        variant="ghost"
                        @click.prevent="clearPreset"
                    />
                    <UIcon name="i-heroicons-chevron-up-down-20-solid"/>
                </template>
                <template #option="{option: preset}">
                    <UTooltip :text="preset.desc === '' ? preset.label : preset.desc" :popper="{arrow: true}" :ui="{wrapper: 'w-full'}">
                        <span class="w-full">{{ preset.label }}</span>
                    </UTooltip>
                </template>
            </USelectMenu>
            <UButton
                label="保存"
                class="bg-gray-200/70 hover:bg-gray-200/90 dark:bg-gray-200/30 dark:hover:bg-gray-200/20 transition-colors py-1 text-black dark:text-gray-100"
                @click="showSaveModal=true"
                >
            </UButton>
            <UModal v-model="showSaveModal" :ui="{rounded: 'rounded-2xl'}">
                <PresetSaveModal :currentPreset="currentPreset" @save-preset="addPreset" @update-preset="updatePreset" @close-modal="showSaveModal=false"/>
            </UModal>
            <UDropdown :items="currentPreset ? settings : [settings[1]]" :popper="{ placement: 'bottom-start' }">
                <UButton
                    class="bg-gray-200/70 hover:bg-gray-200/90 dark:bg-gray-200/30 dark:hover:bg-gray-200/20 transition-colors py-1 text-black dark:text-gray-100"
                >
                    <IconThreeDot size="24"/>
                </UButton>
            </UDropdown>
            <UModal v-model="isShowModal" :ui="{rounded: 'rounded-2xl', base: 'sm:max-w-[650px]'}">
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
const emits = defineEmits(['loadPreset', 'resetPreset'])
const isShowModal = ref(false)
const showSaveModal = ref(false)
const currentPreset = ref(null)
const oldPreset = ref(null)
const showDeletePresetModal = ref(false)

const presets = ref([])

const settings = ref([
    [{
        label: "删除场景",
        class: 'text-red-500 text-sm',
        click: () => {
            showDeletePresetModal.value = true
        },
        disabled: computed(() => currentPreset.value === null)
    }],[{
        label: "模型设置",
        click: () => {
            isShowModal.value=true
        },
        class: "text-sm"
    }]
])

watch(currentPreset, (newVal, oldVal) => {
    console.log(newVal, oldVal, oldPreset.value)
    if (newVal !== oldPreset.value) {
        oldPreset.value = oldVal
        currentPreset.value = newVal
    }
}, {deep: true})


function changePreset() {
    const result = confirm("更改场景后，会丢弃当前未保存的内容，确定继续吗？")
    if (result) {
        emits('loadPreset', currentPreset.value)
        oldPreset.value = currentPreset.value
    } else {
        currentPreset.value = oldPreset.value
    }
}

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

function updatePreset(name, desc, save_chat) {
    currentPreset.value.label = name
    currentPreset.value.desc = desc
    currentPreset.value.system = props.prompt.content
    if (save_chat) {
        currentPreset.value.messages = JSON.parse(JSON.stringify(props.messages))
    }
    toast.add({
        title: '更新成功',
        description: '场景已更新',
        icon: 'i-heroicons-check-circle-20-solid',
        color: 'green',
    })
}

function clearPreset() {
    currentPreset.value = null
    emits('resetPreset')
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