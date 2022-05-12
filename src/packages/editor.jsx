import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMunuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";

export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        ctx.emit("update:modelValue", deepcopy(newValue));
      },
    });

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    const config = inject("config");

    const containerRef = ref(null);

    // 菜单组件拖拽
    const { dragstart, dragend } = useMenuDragger(containerRef, data);

    //获取焦点
    //获取多个组件焦点
    const {
      blockMousedown,
      focusData,
      containerMousedown,
      mouseFocusSelectBlock,
    } = useFocus(data, (e) => {
      mousedown(e);
    });

    //渲染组件拖拽
    const { mousedown, markLine } = useBlockDragger(
      focusData,
      mouseFocusSelectBlock,
      data
    );

    const { commands } = useCommand(data);
    const buttons = [
      { label: "撤销", icon: "icon-back", handler: () => commands.back() },
      { label: "重做", icon: "icon-forward", handler: () => commands.forward() },
    ];

    return () => (
      <div class="editor">
        <div class="editor-left">
          {config.componentList.map((component) => (
            <div
              class="editor-left-item"
              draggable
              ondragstart={(e) => dragstart(e, component)}
              ondragend={(e) => dragend(e)}
            >
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div class="editor-top">
          {buttons.map((btn, index) => {
            return (
              <div class="editor-top-button" onClick={btn.handler}>
                <i class={btn.icon}></i>
                <span>{btn.label}</span>
              </div>
            );
          })}
        </div>
        <div class="editor-right">属性控制栏目</div>
        <div class="editor-container">
          <div class="editor-container-canvas">
            <div
              class="editor-container-canvas__content"
              ref={containerRef}
              style={containerStyles.value}
            >
              {data.value.blocks.map((block, index) => (
                <EditorBlock
                  class={block.focus ? "editor-block-focus" : ""}
                  block={block}
                  onMousedown={(e) => blockMousedown(e, block, index)}
                />
              ))}
              {markLine.x !== null && (
                <div class="line-x" style={{ left: markLine.x + "px" }}></div>
              )}
              {markLine.y !== null && (
                <div class="line-y" style={{ top: markLine.y + "px" }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
