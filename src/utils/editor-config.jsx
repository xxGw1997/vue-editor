//显示所有的可选组件
//key 对应的组件映射关系
import { ElButton, ElInput } from 'element-plus'

function createEditorConfig() {
    const componentList = []
    const componentMap = {}

    return {
        componentList,
        componentMap,
        register: (component) => {
            componentList.push(component)
            componentMap[component.key] = component
        }
    }
}

export let registerConfig = createEditorConfig()

const componentsConfig = [
    {
        label: '文本',
        preview: () => '预览文本',
        render: () => '预览文本',
        key: 'text'
    },
    {
        label: '按钮',
        preview: () => <ElButton>预览按钮</ElButton>,
        render: () => <ElButton>渲染按钮</ElButton>,
        key: 'button'
    },
    {
        label: '输入框',
        preview: () => <ElInput placeholder="预览输入框" />,
        render: () => <ElInput placeholder="渲染输入框" />,
        key: 'input'
    }
]

componentsConfig.forEach(componentConfig => {
    registerConfig.register(componentConfig)
})