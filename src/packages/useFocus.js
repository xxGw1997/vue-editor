import { computed } from "vue";

export function useFocus(data, callback) {
  const clearOtherBlockFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false));
  };

  const containerMousedown = () => {
    clearOtherBlockFocus();
  };

  const blockMousedown = (e, block) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.ctrlKey) {
      block.focus = !block.focus;
    } else {
      if (!block.focus) {
        clearOtherBlockFocus();
        block.focus = true;
      }
    }
    callback(e);
  };

  const focusData = computed(() => {
    let focus = [];
    let unFocus = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focus : unFocus).push(block)
    );
    return { focus, unFocus };
  });
  return {
    blockMousedown,
    containerMousedown,
    focusData,
  };
}
