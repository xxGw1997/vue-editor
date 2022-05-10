import { reactive } from "vue";

export function useBlockDragger(focusData, mouseFocusSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
  };
  let markLine = reactive({ x: null, y: null });
  const mousemove = (e) => {
    let { clientX: moveX, clientY: moveY } = e;

    let left = moveX - dragState.startX + dragState.startLeft;
    let top = moveY - dragState.startY + dragState.startTop;

    let y = null;
    let x = null;
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: sT } = dragState.lines.y[i];
      if (Math.abs(t - top) < 5) {
        y = sT;
        moveY = dragState.startY - dragState.startTop + t;
        break;
      }
    }

    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: l, showLeft: sL } = dragState.lines.x[i];
      if (Math.abs(l - left) < 5) {
        x = sL;
        moveX = dragState.startX - dragState.startLeft + l;
        break;
      }
    }
    markLine.x = x;
    markLine.y = y;

    let durX = moveX - dragState.startX;
    let durY = moveY - dragState.startY;
    focusData.value.focus.forEach((block, index) => {
      block.top = dragState.startPos[index].top + durY;
      block.left = dragState.startPos[index].left + durX;
    });
  };

  const mouseup = (e) => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
    markLine.x = null
    markLine.y = null
  };
  const mousedown = (e) => {
    const { width: BWidth, height: BHeight } = mouseFocusSelectBlock.value;

    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: mouseFocusSelectBlock.value.left,
      startTop: mouseFocusSelectBlock.value.top,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      lines: (() => {
        const { unFocus } = focusData.value;
        let lines = { x: [], y: [] };
        [
          ...unFocus,
          {
            top: 0,
            left: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          },
        ].forEach((block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight,
          } = block;
          lines.y.push({ showTop: ATop, top: ATop });
          lines.y.push({ showTop: ATop, top: ATop - BHeight });
          lines.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop + AHeight / 2 - BHeight / 2,
          });
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight,
          });
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight,
          });

          lines.x.push({ showLeft: ALeft, left: ALeft });
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth });
          lines.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2,
          });
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth,
          });
          lines.x.push({
            showLeft: ALeft,
            left: ALeft - BWidth,
          });
        });
        return lines;
      })(),
    };

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };

  return {
    mousedown,
    markLine,
  };
}
