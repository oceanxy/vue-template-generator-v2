import { Button } from 'ant-design-vue'
import { CopyOutlined, DeleteOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { computed, nextTick, ref, watch } from 'vue'
import { debounce } from 'lodash'
import { useEditorStore } from '@/components/TGEditor/stores/useEditorStore'
import useActionBar from '@/components/TGEditor/hooks/useActionBar'
import { Geometry } from '@/components/TGEditor/utils/geometry'

export default {
  name: 'ComponentsActionBar',
  props: ['containerRef'],
  setup(props, { emit }) {
    const store = useEditorStore()
    const compActionBarRef = ref(null)
    const schema = computed(() => store.schema)
    const componentSchemas = computed(() => store.schema.components)
    const selectedComponent = computed(() => store.selectedComponent)
    const actionBar = computed(() => store.actionBar)
    const { updatePosition } = useActionBar()
    const actions = [
      { icon: <DeleteOutlined />, action: 'delete', title: '删除' },
      { icon: <UpOutlined />, action: 'up', title: '上移' },
      { icon: <DownOutlined />, action: 'down', title: '下移' },
      { icon: <CopyOutlined />, action: 'copy', title: '复制' }
    ]

    // 监听选中组件变化
    watch(selectedComponent, async (val) => {
      actionBar.value.visible = false

      if (val?.type && val.type !== 'canvas') {
        // 先更新可见性状态
        actionBar.value.visible = true
        // 等待DOM渲染完成
        await nextTick()
        // 再执行位置计算，避免组件功能条位置计算错误
        await updatePosition(props.containerRef, compActionBarRef)
      }
    })

    // 监听滚动事件
    watch(
      () => props.containerRef.value?.scrollTop,
      async () => {
        await updatePosition(props.containerRef, compActionBarRef)
      },
      { flush: 'post' }
    )

    const handleAction = debounce((action) => {
      let targetSchema = Geometry.findNestedSchema(
        componentSchemas.value,
        selectedComponent.value.id,
        'parent'
      )

      if (!targetSchema) targetSchema = componentSchemas.value

      const index = targetSchema.findIndex(c => c.id === selectedComponent.value.id)
      if (index === -1) return

      let newComponentSchema = null

      if (action === 'copy') {
        newComponentSchema = store.createComponentSchema(selectedComponent.value, targetSchema[index])
      }

      switch (action) {
        case 'delete':
          targetSchema.splice(index, 1)
          store.selectedComponent = null
          break
        case 'copy':
          targetSchema.splice(index + 1, 0, newComponentSchema)
          store.updateComponent({
            id: newComponentSchema.id,
            type: selectedComponent.value.type,
            category: selectedComponent.value.category
          })
          break
        case 'up':
          if (index > 0) {
            [targetSchema[index], targetSchema[index - 1]] = [targetSchema[index - 1], targetSchema[index]]

            store.updateComponent({
              id: selectedComponent.value.id,
              type: selectedComponent.value.type,
              category: selectedComponent.value.category
            })
          }
          break
        case 'down':
          if (index < schema.value.components.length - 1) {
            [targetSchema[index], targetSchema[index + 1]] = [targetSchema[index + 1], targetSchema[index]]

            store.updateComponent({
              id: selectedComponent.value.id,
              type: selectedComponent.value.type,
              category: selectedComponent.value.category
            })
          }
          break
        default:
          break
      }
    }, 50)

    return () => (
      <div
        ref={compActionBarRef}
        class="tg-editor-component-actions-bar"
        style={{
          display: actionBar.value.visible ? 'flex' : 'none',
          left: `${actionBar.value.position.x}px`,
          top: `${actionBar.value.position.y}px`
        }}
      >
        {
          actions.map(({ icon, action, title }) => (
            <Button
              shape="circle"
              size="small"
              onClick={() => handleAction(action)}
              icon={icon}
              title={title}
            />
          ))
        }
      </div>
    )
  }
}
