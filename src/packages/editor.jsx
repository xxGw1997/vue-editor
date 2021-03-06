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
    const previewRef = ref(false)

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
      clearOtherBlockFocus
    } = useFocus(data, previewRef, (e) => {
      mousedown(e);
    });

    //渲染组件拖拽
    const { mousedown, markLine } = useBlockDragger(
      focusData,
      mouseFocusSelectBlock,
      data
    );

    const { commands } = useCommand(data, focusData);
    const buttons = [
      { label: "撤销", icon: "icon-back", handler: () => commands.back() },
      { label: "重做", icon: "icon-forward", handler: () => commands.forward() },
      { label: "置顶", icon: "icon-place-top", handler: () => commands.placeTop() },
      { label: "置底", icon: "icon-place-bottom", handler: () => commands.placeBottom() },
      { label: "删除", icon: "icon-delete", handler: () => commands.delete() },
      {
        label: () => previewRef.value ? '编辑' : '查看',
        icon: () => `icon-${previewRef.value ? 'edit' : 'browse'}`,
        handler: () => {
          previewRef.value = !previewRef.value
          clearOtherBlockFocus()
        }
      },
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
            const icon = typeof btn.icon == 'function' ? btn.icon() : btn.icon
            const label = typeof btn.label == 'function' ? btn.label() : btn.label
            return (
              <div class="editor-top-button" onClick={btn.handler}>
                <i class={icon}></i>
                <span>{label}</span>
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
              onMouseDown={containerMousedown}
            >
              {data.value.blocks.map((block, index) => (
                <EditorBlock
                  class={block.focus ? "editor-block-focus" : ""}
                  class={previewRef.value ? 'editor-block-preview' : ''}
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
