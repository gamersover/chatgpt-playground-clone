<template>
    <div class="w-screen h-16 border-b-[1px] border-gray-300 flex justify-between items-center pl-4 pr-8">
        <h1 class="font-medium text-2xl">Playground</h1>
        <button @click="isShowModal=true" class="bg-gray-300 hover:bg-gray-300/90 transition-colors text-black py-2 px-2 rounded-lg">
            设置
        </button>
        <div v-if="isShowModal" class="z-10 w-screen h-screen fixed top-0 left-0 bg-black/50 flex justify-center items-center">
            <ModelSetModal @closeModal="closeModal" :models="props.models"/>
        </div>
    </div>
</template>


<script setup>
const props = defineProps(['models'])

const isShowModal = ref(false)

onMounted(async () => {
    await nextTick()
    if (props.models.length == 0) {
        isShowModal.value = true
    }
})

function closeModal() {
    isShowModal.value = false
}

</script>


<style>
.invisiable {
    visibility: hidden;
}
</style>