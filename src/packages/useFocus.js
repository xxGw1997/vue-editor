import { computed, ref } from "vue";

export function useFocus(data, previewRef, callback) {
  const selectIndex = ref(-1);

  const mouseFocusSelectBlock = computed(
    () => data.value.blocks[selectIndex.value]
  );

  const focusData = computed(() => {
    let focus = [];
    let unFocus = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focus : unFocus).push(block)
    );
    return { focus, unFocus };
  });
  const clearOtherBlockFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false));
  };

  const containerMousedown = () => {
    if (previewRef.value) return;
    clearOtherBlockFocus();
    selectIndex.value = -1;
  };

  const blockMousedown = (e, block, index) => {
    if(previewRef.value) return
    e.preventDefault();
    e.stopPropagation();
    if (e.ctrlKey) {
      if (focusData.value.focus.length <= 1) {
        //只有一个节点被选中时,多选时不会切换focus事件
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        clearOtherBlockFocus();
        block.focus = true;
      }
    }
    selectIndex.value = index;
    //点击选中block块后执行回调,主要是收集未被选中的block的辅助线以及被选中block的位置信息
    callback(e);
  };

  return {
    blockMousedown,
    containerMousedown,
    focusData,
    mouseFocusSelectBlock,
    clearOtherBlockFocus,
  };
}
