export default {
  mounted(el: HTMLElement, binding: any) {
    el.outerHTML = binding.value; // 直接替换当前节点为 HTML 内容
  },
};
