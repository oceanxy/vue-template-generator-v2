import './index.scss'
import Scroll from './Scroll'
import { ref, watch } from 'vue'
import { Tooltip } from 'ant-design-vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

export default {
  name: 'TGScrollingNumberMain',
  props: {
    text: {
      type: String,
      default: ''
    },
    value: {
      type: [Number, String],
      default: 0
    },
    // 值的高度
    valueHeight: {
      type: Number,
      default: 40
    },
    // 次要显示数值
    subValue: {
      type: [Object, Number, String, undefined],
      default: undefined
    },
    // 文本预值的间隔
    gap: {
      type: Number,
      default: 0
    },
    // 单位
    unit: {
      type: String,
      default: undefined
    },
    tip: {
      type: String,
      default: undefined
    }
  },
  setup(props) {
    const innerText = ref('')
    const innerValue = ref([])

    watch(
      () => props.text,
      value => innerText.value = value,
      { immediate: true }
    )

    watch(
      () => props.value,
      value => innerValue.value = value.toLocaleString().split(''),
      { immediate: true }
    )

    return () => (
      <div class="tg-scrolling-number-container" style={{ gap: props.gap + 'px' }}>
        <div class="tg-scrolling-number-text">
          {innerText.value && <span>{innerText.value}</span>}
          {props.unit && <span class={'tg-scrolling-number-unit'}>({props.unit})</span>}
          {
            props.tip && (
              <Tooltip title={props.tip}>
                <QuestionCircleOutlined style={{ marginLeft: 'auto' }} />
              </Tooltip>
            )
          }
        </div>
        <div
          class="tg-scrolling-number-value"
          style={{ height: props.valueHeight + 'px', flexBasis: `${props.valueHeight}px` }}
        >
          {
            innerValue.value.map(numStr => {
              return !isNaN(+numStr)
                ? <Scroll targetNumber={+numStr} itemHeight={props.valueHeight} />
                : <div>{numStr}</div>
            })
          }
        </div>
        {
          props.subValue && (
            <div class={'tg-scrolling-number-sub-value'}>
              {props.subValue}
            </div>
          )
        }
      </div>
    )
  }
}
