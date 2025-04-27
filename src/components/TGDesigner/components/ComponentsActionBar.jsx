import { Button } from 'ant-design-vue'
import { CopyOutlined, DeleteOutlined, DownOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons-vue'
import { computed, nextTick, ref, watch } from 'vue'
import { debounce } from 'lodash'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import useActionBar from '@/components/TGDesigner/hooks/useActionBar'
import { Geometry } from '@/components/TGDesigner/utils/geometry'

export default {
  name: 'ComponentsActionBar',
  props: ['containerRef'],
  setup(props) {
    const layoutDirection = ref('vertical')
    const store = useEditorStore()
    const compActionBarRef = ref(null)
    const componentSchemas = computed(() => store.schema.components)
    const selectedComponent = computed(() => store.selectedComponent)
    const actionBar = computed(() => store.actionBar)
    const { updatePosition } = useActionBar()
    const actions = computed(() => {
      const isHorizontal = layoutDirection.value === 'horizontal'

      return [
        { icon: <DeleteOutlined />, action: 'delete', title: '删除' },
        {
          icon: isHorizontal ? <LeftOutlined /> : <UpOutlined />,
          action: 'up',
          title: isHorizontal ? '前移' : '上移'
        },
        {
          icon: isHorizontal ? <RightOutlined /> : <DownOutlined />,
          action: 'down',
          title: isHorizontal ? '后移' : '下移'
        },
        { icon: <CopyOutlined />, action: 'copy', title: '复制' }
      ]
    })

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

        // 更新布局方向
        layoutDirection.value = Geometry.getLayoutDirectionById(val.id)
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

    const handleMoveComplete = (component) => {
      const markChildren = (schema) => {
        schema.__initialized = true
        schema.__animating = false
        schema.children?.forEach(markChildren)
      }

      requestAnimationFrame(() => {
        markChildren(component)
        store.schema.components.value = [...store.schema.components.value]
      })
    }

    const handleAction = debounce((action) => {
      let targetSchema = Geometry.findNestedSchema(
        componentSchemas.value,
        selectedComponent.value.id,
        'parent'
      ).schema

      if (!targetSchema) targetSchema = componentSchemas.value

      const index = targetSchema.findIndex(c => c.id === selectedComponent.value.id)
      if (index === -1) return

      if (action === 'delete') {
        targetSchema[index].__initialized = true
        targetSchema[index].__animating = true

        setTimeout(() => {
          targetSchema.splice(index, 1)
          store.selectedComponent = null
        }, 200) // 等待动画完成
      } else if (action === 'copy') {
        const newComponentSchema = store.copyLayoutComponentSchema(targetSchema[index])
        targetSchema.splice(index + 1, 0, newComponentSchema)

        store.updateComponent({
          id: newComponentSchema.id,
          type: selectedComponent.value.type,
          category: selectedComponent.value.category
        })

        setTimeout(() => {
          newComponentSchema.__initialized = true
          newComponentSchema.__animating = false
        }, 300)
      } else if (action === 'up') {
        if (index > 0) {
          // 动画状态检查
          if (targetSchema[index].__animating || !targetSchema[index].__initialized) {
            return
          }

          // 添加FLIP动画逻辑
          const oldElement = props.containerRef.value.querySelector(`[data-id="${selectedComponent.value.id}"]`)
          const oldRect = oldElement.getBoundingClientRect()

            // 执行元素交换
          ;[targetSchema[index], targetSchema[index - 1]] = [targetSchema[index - 1], targetSchema[index]]
          handleMoveComplete(targetSchema[index])

          // 获取新位置
          requestAnimationFrame(() => {
            const newElement = props.containerRef.value.querySelector(`[data-id="${selectedComponent.value.id}"]`)
            const newRect = newElement.getBoundingClientRect()

            // 计算位置变化
            const deltaX = oldRect.left - newRect.left
            const deltaY = oldRect.top - newRect.top

            // 应用FLIP动画
            newElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`
            newElement.style.transition = 'none'

            requestAnimationFrame(() => {
              newElement.style.transform = ''
              newElement.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' // 同步曲线
            })
          })
        }
      } else if (action === 'down') {
        if (index < targetSchema.length - 1) {
          const oldElement = props.containerRef.value.querySelector(`[data-id="${selectedComponent.value.id}"]`)
          const oldRect = oldElement.getBoundingClientRect()

          ;[targetSchema[index], targetSchema[index + 1]] = [targetSchema[index + 1], targetSchema[index]]
          handleMoveComplete(targetSchema[index])

          requestAnimationFrame(() => {
            const newElement = props.containerRef.value.querySelector(`[data-id="${selectedComponent.value.id}"]`)
            const newRect = newElement.getBoundingClientRect()

            const deltaX = oldRect.left - newRect.left
            const deltaY = oldRect.top - newRect.top

            newElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`
            newElement.style.transition = 'none'

            requestAnimationFrame(() => {
              newElement.style.transform = ''
              newElement.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' // 同步曲线
            })
          })
        }
      }
    }, 50)

    return () => (
      <div
        ref={compActionBarRef}
        class="tg-designer-component-actions-bar"
        style={{
          display: actionBar.value.visible ? 'flex' : 'none',
          left: `${actionBar.value.position.x}px`,
          top: `${actionBar.value.position.y}px`
        }}
      >
        {
          actions.value.map(({ icon, action, title }) => (
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
