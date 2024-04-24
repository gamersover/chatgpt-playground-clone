<template>
  <div class="flex flex-col p-4 gap-6">
	<h1 class="text-lg font-medium">{{ title }}</h1>
	<p>
	  {{ description }}
	</p>
	<div class="flex flex-col gap-4">
	  <div class="flex flex-col gap-2">
		<p class="font-medium">名称</p>
		<UInput
		  v-model="preset_name"
		  size="xl"
		  :ui="{'rounded': 'rounded-lg', 'variant': {'outline': 'ring-gray-300'}, 'padding': 'py-0.5'}"
		  color="blue"
		>
		</UInput>
	  </div>
	  <div class="flex flex-col gap-2">
		<div class="flex gap-2">
		  <p class="font-medium">描述</p>
		  <p class="font-light">可选</p>
		</div>
		<UInput
		  v-model="preset_desc"
		  size="xl"
		  :ui="{'rounded': 'rounded-lg', 'variant': {'outline': 'ring-gray-300'}, 'padding': 'py-0.5'}"
		  color="blue"
		>
		</UInput>
	  </div>
	  <div class="flex gap-2 items-center">
		<UToggle
		  label="保存对话历史"
		  v-model="save_chat"
		  color="blue"
		>
		</UToggle>
		<p class="font-medium">保存对话历史</p>
	  </div>
	</div>
	<div class="flex justify-end gap-2">
	  <UButton
		label="取消"
		color="gray"
		:ui="{'rounded': 'rounded-lg'}"
		class="text-base"
		@click="emits('closeModal')"
	  >
	  </UButton>
	  <UButton
		:label="props.currentPreset ? '另存为' : '保存'"
		:disabled="!isSaveEnable"
		:color="props.currentPreset ? 'gray' : 'blue'"
		:ui="{'rounded': 'rounded-lg'}"
		class="text-base"
		@click="savePreset"
	  >
	  </UButton>
	  <UButton
		v-if="props.currentPreset"
		:disabled="!isSaveEnable"
		label="更新"
		color="blue"
		:ui="{'rounded': 'rounded-lg'}"
		class="text-base"
		@click="updatePreset"
	  >
	  </UButton>
	</div>
  </div>
</template>

<script setup>
const emits = defineEmits(['closeModal', 'savePreset', 'updatePreset'])
const props = defineProps(['currentPreset'])

const preset_name = ref(props.currentPreset?.label || '')
const preset_desc = ref(props.currentPreset?.desc || '')
const save_chat = ref(false)

const isSaveEnable = computed(() => {
	return preset_name.value.length > 0
})

const title = computed(() => {
  if (props.currentPreset) {
	return `更新预设场景 "${props.currentPreset.label}"？`
  } else {
	return '保存预设场景'
  }
})

const description = computed(() => {
  const suffix = save_chat.value ? '和对话历史' : ''
  if (props.currentPreset) {
	return `更新预设场景, 包含系统提示${suffix}`
  } else {
	return `保存当前的预设场景，包含系统提示${suffix}`
  }
})

function savePreset() {
  emits('savePreset', preset_name.value, preset_desc.value, save_chat.value)
  emits('closeModal')
}

function updatePreset() {
  emits('updatePreset', preset_name.value, preset_desc.value, save_chat.value)
  emits('closeModal')
}
</script>