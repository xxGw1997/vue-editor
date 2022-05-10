import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMunuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";

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
    const { blockMousedown, focusData, containerMousedown } = useFocus(
      data,
      (e) => {
        mousedown(e);
      }
    );
    const { mousedown } = useBlockDragger(focusData);

    return () => (
      <div class="editor">
        <div class="editor-left">
          {config.componentList.map((component) => (
            <div
              class="editor-left-item"
              draggable
              ondragstart={(e) => dragstart(e, component)}
              ondragend={(e) => dragend}
            >
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div class="editor-top">菜单栏</div>
        <div class="editor-right">属性控制栏目</div>
        <div class="editor-container">
          <div class="editor-container-canvas">
            <div
              class="editor-container-canvas__content"
              ref={containerRef}
              style={containerStyles.value}
            >
              {data.value.blocks.map((block) => (
                <EditorBlock
                  class={block.focus ? "editor-block-focus" : ""}
                  block={block}
                  onMousedown={(e) => blockMousedown(e, block)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
