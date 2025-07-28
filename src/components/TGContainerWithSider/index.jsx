import './assets/styles/index.scss'
import { Button } from 'ant-design-vue'
import { computed, watch } from 'vue'
import configs from '@/configs'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import useStore from '@/composables/tgStore'

export default {
  name: 'TGContainerWithSider',
  props: {
    /**
     * 主容器样式表名
     */
    contentClass: {
      type: String,
      default: ''
    },
    /**
     * 侧边容器样式表名
     */
    siderClass: {
      type: String,
      default: ''
    },
    /**
     * 侧边栏在左侧
     */
    siderOnLeft: {
      type: Boolean,
      default: false
    },
    /**
     * 是否显示侧边栏隐藏按钮。
     */
    showSiderTrigger: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots, emit }) {
    const commonStore = useStore('/common')
    const siderClassName = computed(() => props.siderClass ? ` ${props.siderClass}` : '')
    const treeCollapsed = computed({
      get() {
        return commonStore.treeCollapsed
      },
      set(value) {
        commonStore.treeCollapsed = value
      }
    })

    watch(treeCollapsed, () => {
      // 设置 200ms 的延迟是因为 css 动画的持续时间设置为如下：
      // transition: width .2s ease;
      setTimeout(() => {
        emit('sidebarSwitch')
      }, 200)
    })

    function onTrigger() {
      treeCollapsed.value = !treeCollapsed.value
    }

    return () => (
      <div
        class={{
          'tg-container-with-sider': true,
          'tree-collapsed': treeCollapsed.value
        }}
      >
        <div
          class={{
            'tg-container-with-sider--content': true,
            [props.contentClass]: !!props.contentClass
          }}
        >
          {slots.default?.()}
        </div>
        <div
          style={{ order: props.siderOnLeft ? -1 : 1 }}
          class={{
            'tg-container-with-sider--sider': true,
            [siderClassName.value]: !!siderClassName.value,
            'hide': treeCollapsed.value
          }}
        >
          {slots.sider?.()}
          {
            props.showSiderTrigger && configs.siderTree.togglePosition === 'hasTree'
              ? (
                <Button
                  class={'tg-container-trigger'}
                  icon={!treeCollapsed.value ? <LeftOutlined /> : <RightOutlined />}
                  type={'link'}
                  onClick={onTrigger}
                />
              )
              : null
          }
        </div>
      </div>
    )
  }
}
