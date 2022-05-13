import { reactive } from "vue";
import { events } from "./events";

export function useBlockDragger(focusData, mouseFocusSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false,
  };
  let markLine = reactive({
    x: null,
    y: null,
  });
  const mousemove = (e) => {
    //在移动block时触发, 每次移动时计算拖动的block和未选中的block之间的距离,如果小于5则将该值设置成对应x或y的值,否则为null.
    // 然后再将选中的block的top值和left进行动态计算 设置为移动后的值.
    let { clientX: moveX, clientY: moveY } = e;

    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit("start");
    }

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
    markLine.x = null;
    markLine.y = null;
    if (dragState.dragging) {
      events.emit("end");
    }
  };
  const mousedown = (e) => {
    //选中block时将鼠标选中的那个block获取到.然后把对应的x,y,left,top 值获取到,并且将所有选中的block的位置信息记录下来.
    // 以及动态计算好没有被选中以及画布的该显示的线的值
    // 最后这个逻辑会被鼠标选中block块时,作为回调执行

    const { width: BWidth, height: BHeight } = mouseFocusSelectBlock.value;

    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      startLeft: mouseFocusSelectBlock.value.left,
      startTop: mouseFocusSelectBlock.value.top,
      startPos: focusData.value.focus.map(({ top, left }) => ({
        top,
        left,
      })),
      lines: (() => {
        const { unFocus } = focusData.value;
        let lines = {
          x: [],
          y: [],
        };
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
          lines.y.push({
            showTop: ATop,
            top: ATop,
          });
          lines.y.push({
            showTop: ATop,
            top: ATop - BHeight,
          });
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

          lines.x.push({
            showLeft: ALeft,
            left: ALeft,
          });
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth,
          });
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
