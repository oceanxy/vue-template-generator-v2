import { Button } from 'ant-design-vue'
import { CopyOutlined, DeleteOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { ref, watchEffect } from 'vue'

export default {
  name: 'ComponentsActionBar',
  props: ['position', 'visible'],
  setup(props, { emit }) {
    const visible = ref(false)
    const positionX = ref(0)
    const positionY = ref(0)
    const actions = [
      { icon: <DeleteOutlined />, action: 'delete', title: '删除' },
      { icon: <UpOutlined />, action: 'up', title: '上移' },
      { icon: <DownOutlined />, action: 'down', title: '下移' },
      { icon: <CopyOutlined />, action: 'copy', title: '复制' }
    ]

    watchEffect(() => {
      visible.value = props.visible
      positionX.value = props.position.x
      positionY.value = props.position.y
    })

    return () => (
      <div
        class="tg-editor-component-actions-bar"
        style={{
          display: visible.value ? 'flex' : 'none',
          left: `${positionX.value}px`,
          top: `${positionY.value}px`
        }}
      >
        {
          actions.map(({ icon, action, title }) => (
            <Button
              shape="circle"
              size="small"
              onClick={() => emit(action)}
              icon={icon}
              title={title}
            />
          ))
        }
      </div>
    )
  }
}
