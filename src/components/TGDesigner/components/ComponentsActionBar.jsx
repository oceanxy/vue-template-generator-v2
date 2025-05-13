import { Button, message } from 'ant-design-vue'
import { CopyOutlined, DeleteOutlined, DownOutlined, LeftOutlined, RightOutlined, UpOutlined } from '@ant-design/icons-vue'
import { computed, reactive, ref, watch } from 'vue'
import { debounce } from 'lodash'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import useActionBar from '@/components/TGDesigner/hooks/useActionBar'
import { Geometry } from '@/components/TGDesigner/utils/geometry'

const actionButtons = {
  delete: { icon: <DeleteOutlined />, action: 'delete', title: '删除' },
  copy: { icon: <CopyOutlined />, action: 'copy', title: '复制' },
  up: { icon: <UpOutlined />, action: 'up', title: '上移' },
  down: { icon: <DownOutlined />, action: 'down', title: '下移' },
  left: { icon: <LeftOutlined />, action: 'left', title: '左移' },
  right: { icon: <RightOutlined />, action: 'right', title: '右移' }
}

export default {
  name: 'ComponentsActionBar',
  props: ['containerRef'],
  setup(props) {
    const layoutInfo = reactive({
      layoutDirection: 'vertical',
      isInGridLayout: false
    })
    const store = useEditorStore()
    const compActionBarRef = ref(null)
    const componentSchemas = computed(() => store.schema.components)
    const selectedComponent = computed(() => store.selectedComponent)
    const actionBar = computed(() => store.actionBar)
    const { updatePosition } = useActionBar()
    const actions = computed(() => {
      if (layoutInfo.isInGridLayout) {
        return [
          actionButtons.delete,
          actionButtons.up,
          actionButtons.down,
          actionButtons.left,
          actionButtons.right,
          actionButtons.copy
        ]
      } else {
        if (layoutInfo.layoutDirection === 'horizontal') {
          return [actionButtons.delete, actionButtons.left, actionButtons.right, actionButtons.copy]
        } else {
          return [actionButtons.delete, actionButtons.up, actionButtons.down, actionButtons.copy]
        }
      }
    })

    // 监听选中组件变化
    watch(selectedComponent, async val => {
      actionBar.value.visible = false

      if (val?.type && val.type !== 'canvas') {
        // 等待组件淡入动画完成
        setTimeout(async () => {
          // 先更新可见性状态
          actionBar.value.visible = true
          // 再执行组件功能条位置计算
          await updatePosition(props.containerRef, compActionBarRef)
          const _layoutInfo = Geometry.getLayoutInfoById(val.id)
          // 更新布局方向
          layoutInfo.layoutDirection = _layoutInfo.layoutDirection
          layoutInfo.isInGridLayout = _layoutInfo.isInGridLayout
        }, 200)
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

    const moveWithinGridLayout = (targetSchema, index, direction) => {
      const moveInfo = Geometry.checkAdjacentPositionInGridLayout({
        elements: targetSchema,
        position: targetSchema[index].cellPosition,
        direction,
        rowCount: selectedComponent.value.rowCount,
        colCount: selectedComponent.value.colCount
      })

      if (moveInfo) {
        if (moveInfo.isEmptyAdjacentLocation) {
          // 空位置无法做交换动画，这里模拟一个临时数据，用于交换位置
          targetSchema.splice(targetSchema.length, 0, { ...targetSchema[index], id: '__temp__' })
          targetSchema[index].cellPosition = moveInfo.position
          // 更新组件位置
          FLIP(targetSchema, index, targetSchema.length - 1)
          // 删除临时数据
          targetSchema.splice(index, 1)
        } else {
          const newIndex = targetSchema.findIndex(c => c.cellPosition === moveInfo.position)
          targetSchema[newIndex].cellPosition = targetSchema[index].cellPosition
          targetSchema[index].cellPosition = moveInfo.position

          // 更新组件位置
          FLIP(targetSchema, index, newIndex)
        }
      }
    }

    /**
     * 删除组件时，添加动画
     * @param targetSchema
     * @param index
     * @param [isUpdateComponent=true] {boolean} - 是否更新选中组件
     */
    const removeComponentWithAnimated = (targetSchema, index, isUpdateComponent = true) => {
      targetSchema[index].__initialized = true
      targetSchema[index].__animating = true

      setTimeout(() => {
        targetSchema.splice(index, 1)
        if (isUpdateComponent) {
          store.selectedComponent = null
        }
      }, 200) // 等待动画完成
    }

    /**
     * 插入组件时，添加动画
     * @param targetSchema
     * @param index
     * @param newComponentSchema
     * @param [isDeleteOriginalComponent] {boolean}
     */
    const insertComponentWithAnimated = (targetSchema, index, newComponentSchema, isDeleteOriginalComponent) => {
      targetSchema.splice(index, +isDeleteOriginalComponent, newComponentSchema)

      store.updateComponent({
        id: newComponentSchema.id,
        type: selectedComponent.value.type,
        category: selectedComponent.value.category
      })

      setTimeout(() => {
        newComponentSchema.__initialized = true
        newComponentSchema.__animating = false
      }, 300)
    }

    /**
     * 变换位置时，添加FLIP动画
     * First-Last-Invert-Play
     * @param targetSchema {TGComponentSchema[]}
     * @param preIndex {number}
     * @param postIndex {number}
     * @constructor
     */
    const FLIP = (targetSchema, preIndex, postIndex) => {
      const oldElement = props.containerRef.value.querySelector(`[data-id="${selectedComponent.value.id}"]`)
      const oldRect = oldElement.getBoundingClientRect();

      // 执行元素交换
      [targetSchema[preIndex], targetSchema[postIndex]] = [targetSchema[postIndex], targetSchema[preIndex]]

      const markChildren = (schema) => {
        schema.__initialized = true
        schema.__animating = false
        schema.children?.forEach(markChildren)
      }

      requestAnimationFrame(() => {
        markChildren(targetSchema[preIndex])
      })

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

    const handleAction = debounce(action => {
      let targetSchema = Geometry.findNestedSchema(
        componentSchemas.value,
        selectedComponent.value.id,
        'parent'
      ).schema

      if (!targetSchema) targetSchema = componentSchemas.value

      const index = targetSchema.findIndex(c => c.id === selectedComponent.value.id)
      if (index === -1) return

      if (action === 'delete') {
        removeComponentWithAnimated(targetSchema, index)
      } else if (action === 'copy') {
        let newPositon

        if (layoutInfo.isInGridLayout) {
          newPositon = Geometry.findNextEmptyPosition({
            elements: targetSchema,
            rowCount: selectedComponent.value.rowCount,
            colCount: selectedComponent.value.colCount,
            position: targetSchema[index].cellPosition
          })

          if (!newPositon?.position) {
            message.warning('复制失败：没有可用的区域来放置新部件。')
            return
          }
        }

        const newComponentSchema = store.copyLayoutComponentSchema(targetSchema[index])

        if (layoutInfo.isInGridLayout) {
          newComponentSchema.cellPosition = newPositon?.position
        }

        insertComponentWithAnimated(targetSchema, index + 1, newComponentSchema)
      } else if (action === 'up' || action === 'left') {
        if (layoutInfo.isInGridLayout) {
          if (action === 'up') {
            moveWithinGridLayout(targetSchema, index, 'up')
          } else {
            moveWithinGridLayout(targetSchema, index, 'left')
          }
        } else {
          if (index > 0) {
            // 动画状态检查
            if (targetSchema[index].__animating || !targetSchema[index].__initialized) {
              return
            }

            FLIP(targetSchema, index, index - 1)
          }
        }

      } else if (action === 'down' || action === 'right') {
        if (layoutInfo.isInGridLayout) {
          if (action === 'down') {
            moveWithinGridLayout(targetSchema, index, 'down')
          } else {
            moveWithinGridLayout(targetSchema, index, 'right')
          }
        } else {
          if (index < targetSchema.length - 1) {
            FLIP(targetSchema, index, index + 1)
          }
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
