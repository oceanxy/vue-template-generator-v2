import './index.scss'
import { Button } from 'ant-design-vue'
import { computed } from 'vue'

/**
 * @global
 * @typedef {Object} TGContainerProps
 * @property {String|JSX.Element} modalTitle 标题文字
 * @property {String|Number} [width=500] 容器宽度
 * @property {Boolean} [showMore=] 是否展示“更多”箭头
 * @property {String|Element|JSX.Element} [rightIcon] 右侧显示更多的图标，依赖 showMore。
 * @property {Boolean} [showTitleLine] 是否显示标题与内容的分割线
 * @property {String} [contentClass] 内容区的自定义class
 * @property {Boolean} [showBoxShadow] 显示边框阴影
 * @property {String} [titleClass] 标题区的自定义class
 * @property {Boolean} [showTitleShape] 是否显示标题前的图案
 */

/**
 * 容器组件
 * @param {TGContainerProps} props
 * @param slots
 * @param emits
 * @returns {JSX.Element}
 * @constructor
 */
const TGCard = (props, { slots, emits }) => {
  const containerWidth = computed(() => {
    if (!props.width) {
      return '500px'
    }

    if (!isNaN(props.width)) {
      return `${props.width}px`
    } else {
      return props.width
    }
  })
  const className = computed(() => (props.contentClass ? `${props.contentClass} ` : '') + 'box-content')
  const titleClassName = computed(() => `${
    props.titleClass ? `${props.titleClass} ` : ''
  }${
    props.showTitleShape ? 'divider padding-left ' : ''
  }${
    props.showTitleLine ? 'line ' : ''
  }box-title`)

  return (
    <div
      class={`${props.showBoxShadow ? 'show-shadow ' : ''}tg-universal-box`}
      style={{ '--box-width': containerWidth.value }}
    >
      {
        props.modalTitle
          ? (
            <div class={titleClassName.value}>
              {props.modalTitle}
              {
                props.showMore
                  ? (
                    props.rightIcon
                      ? (
                        <div class={'right-icon'}>
                          {props.rightIcon}
                        </div>
                      )
                      : (
                        <Button
                          class={'right-icon'}
                          icon="right"
                          onclick={() => emits('more')}
                        />
                      )
                  )
                  : null
              }
            </div>
          )
          : null
      }
      {
        slots.default
          ? <div class={className.value}>{slots.default()}</div>
          : null
      }
    </div>
  )
}

export default TGCard
