import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";

export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  setup(props) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set() { },
    });

    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    const config = inject('config')

    const containerRef = ref(null)

    const dragenter = e => {
      e.dataTransfer.dropEffect = 'move'
    }
    const dragover = e => {
      e.preventDefault()
    }
    const dragleave = e => {
      e.dataTransfer.dropEffect = 'none'
    }
    const drop = e => {
      // e.dataTransfer.dropEffect = 'move'
    }

    const dragstart = (e, component) => {
      containerRef.value.addEventListener('dragenter', dragenter)
      containerRef.value.addEventListener('dragover', dragover)
      containerRef.value.addEventListener('dragleave', dragleave)
      containerRef.value.addEventListener('drop', drop)
    }

    return () => (
      <div class="editor">
        <div class="editor-left">
          {config.componentList.map(component => (
            <div className="editor-left-item"
              draggable
              ondragstart={e => dragstart(e, component)}>
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
              {
                (data.value.blocks.map((block) => (
                  <EditorBlock block={block} />
                )))
              }
            </div>
          </div>
        </div>
      </div>
    );
  },
});
