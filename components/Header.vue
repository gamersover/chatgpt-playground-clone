<template>
  <div class="w-screen h-16 flex justify-between items-center pl-4 pr-4">
    <h1 class="font-medium text-2xl">Playground</h1>
    <div class="flex gap-2">
      <USelectMenu
        color="blue"
        :ui="{
          base: 'w-44',
          variant: { outline: 'ring-gray-300 dark:ring-gray-600' },
          icon: { trailing: { pointer: '' } },
        }"
        ,
        :uiMenu="{
          option: { container: 'w-full', active: 'bg-blue-200' },
          background: 'dark:bg-neutral-800',
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
          <UIcon name="i-heroicons-chevron-up-down-20-solid" />
        </template>
        <template #option="{ option: preset }">
          <UTooltip
            :text="preset.desc === '' ? preset.label : preset.desc"
            :popper="{ arrow: true }"
            :ui="{ wrapper: 'w-full' }"
          >
            <span class="w-full">{{ preset.label }}</span>
          </UTooltip>
        </template>
      </USelectMenu>
      <UTooltip
        :ui="{
          base: 'px-1.5 py-1 h-full rounded-md',
          background: 'bg-neutral-800 dark:bg-neutral-800',
        }"
      >
        <template #text>
          <div class="flex gap-3 items-center text-sm justify-between">
            <span class="text-white">保存场景</span>
            <div class="flex items-center gap-1">
              <UKbd
                :ui="{
                  base: 'text-white dark:text-black',
                  background: 'bg-neutral-600 dark:bg-gray-300',
                }"
                >{{ metaSymbol }}</UKbd
              >
              <UKbd
                :ui="{
                  base: 'text-white dark:text-black',
                  background: 'bg-neutral-600 dark:bg-gray-300',
                }"
                >S</UKbd
              >
            </div>
          </div>
        </template>
        <UButton
          label="保存"
          class="bg-gray-200/70 disabled:text-gray-500 disabled:bg-gray-200/40 hover:bg-gray-200/90 dark:bg-gray-300/20 dark:hover:bg-zinc-500 transition-colors py-1 text-black dark:text-gray-200"
          @click="showSaveModal = true"
          color="gray"
          variant="ghost"
          :disabled="isCompared"
        >
        </UButton>
      </UTooltip>
      <UButton
        label="设置"
        class="bg-gray-200/70 hover:bg-gray-200/90 dark:bg-gray-300/20 dark:hover:bg-zinc-500 transition-colors py-1 text-black dark:text-gray-200"
        @click="isShowModal = true"
      >
      </UButton>
      <UPopover
        :popper="{ placement: 'bottom-start' }"
        :ui="{ background: 'dark:bg-neutral-800' }"
      >
        <template #panel>
          <div v-if="currentPreset" class="w-full">
            <UButton
              label="删除场景"
              variant=""
              @click="showDeletePresetModal = true"
              class="py-2 w-full rounded-none text-red-500 dark:text-red-500 text-sm hover:bg-gray-100 hover:text-black hover:dark:bg-gray-900/50 dark:hover:text-white"
            ></UButton>
            <UDivider :ui="{ border: { base: 'dark:border-gray-700' } }">
            </UDivider>
          </div>
          <div class="flex w-[190px] px-2 py-1 justify-between items-center">
            <div class="text-sm">主题</div>
            <ThemeSwitch />
          </div>
        </template>
        <UButton
          class="bg-gray-200/70 hover:bg-gray-200/90 dark:bg-gray-300/20 dark:hover:bg-zinc-500 transition-colors py-1 text-black dark:text-gray-200"
        >
          <IconThreeDot size="24" />
        </UButton>
      </UPopover>
      <UModal
        v-model="showSaveModal"
        :ui="{
          rounded: 'rounded-2xl',
          background: 'dark:bg-neutral-800',
          overlay: { background: 'bg-black/50 dark:bg-black/80' },
        }"
      >
        <PresetSaveModal
          :currentPreset="currentPreset"
          @save-preset="addPreset"
          @update-preset="updatePreset"
          @close-modal="showSaveModal = false"
        />
      </UModal>
      <UModal
        prevent-close
        v-model="isShowModal"
        :ui="{
          rounded: 'rounded-2xl',
          base: 'sm:!max-w-[650px]',
          background: 'dark:bg-neutral-800',
          overlay: { background: 'bg-black/50 dark:bg-black/80' },
        }"
      >
        <ModelSetModal @CloseModal="closeModal" :models="props.models" />
      </UModal>

      <UModal
        v-model="showDeletePresetModal"
        :ui="{
          rounded: 'rounded-2xl',
          background: 'dark:bg-neutral-800',
          overlay: { background: 'bg-black/50 dark:bg-black/80' },
        }"
      >
        <DeletePresetModal
          :preset-name="currentPreset?.label"
          @DeletePreset="deletePreset"
          @CloseModal="showDeletePresetModal = false"
        />
      </UModal>
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
const toast = useToast();
const { metaSymbol } = useShortcuts();

const props = defineProps(["models", "context", "isCompared"]);
const emits = defineEmits(["loadPreset", "resetPreset"]);
const isShowModal = ref(false);
const showSaveModal = ref(false);
const currentPreset = ref(null);
const oldPreset = ref(null);
const showDeletePresetModal = ref(false);

const presets = ref([]);

watch(
  currentPreset,
  (newVal, oldVal) => {
    if (newVal !== oldPreset.value) {
      oldPreset.value = oldVal;
      currentPreset.value = newVal;
    }
  },
  { deep: true }
);

function changePreset() {
  const result = confirm("更改场景后，会丢弃当前未保存的内容，确定继续吗？");
  if (result) {
    emits("loadPreset", currentPreset.value);
    oldPreset.value = currentPreset.value;
  } else {
    currentPreset.value = oldPreset.value;
  }
}

function deletePreset() {
  showDeletePresetModal.value = false;
  presets.value = presets.value.filter(
    (item) => item.id != currentPreset.value.id
  );
  currentPreset.value = null;
  toast.add({
    title: "删除成功",
    description: "场景已删除",
    icon: "i-heroicons-check-circle-20-solid",
    color: "green",
  });
}

function closeModal() {
  isShowModal.value = false;
}

function addPreset(name, desc, save_chat) {
  const preset = {
    id: uuidv4(),
    label: name,
    desc: desc,
    system: props.context.system_prompt.content,
  };
  if (save_chat) {
    preset.messages = JSON.parse(JSON.stringify(props.context.messages));
  }
  presets.value.push(preset);
  toast.add({
    title: "添加成功",
    description: "场景已添加",
    icon: "i-heroicons-check-circle-20-solid",
    color: "green",
  });
  currentPreset.value = preset;
}

function updatePreset(name, desc, save_chat) {
  currentPreset.value.label = name;
  currentPreset.value.desc = desc;
  currentPreset.value.system = props.context.system_prompt.content;
  if (save_chat) {
    currentPreset.value.messages = JSON.parse(JSON.stringify(props.context.messages));
  }
  toast.add({
    title: "更新成功",
    description: "场景已更新",
    icon: "i-heroicons-check-circle-20-solid",
    color: "green",
  });
}

function clearPreset() {
  currentPreset.value = null;
  oldPreset.value = null;
  emits("resetPreset");
}

onMounted(async () => {
  if (localStorage.getItem("presets")) {
    presets.value = JSON.parse(localStorage.getItem("presets"));
  }

  await nextTick();
  if (props.models.length == 0) {
    isShowModal.value = true;
  }
});

watch(
  presets,
  (newVal) => {
    localStorage.setItem("presets", JSON.stringify(newVal));
  },
  { deep: true }
);

defineShortcuts({
  meta_s: {
    usingInput: true,
    handler: () => {
      showSaveModal.value = true;
    },
  },
});
</script>
