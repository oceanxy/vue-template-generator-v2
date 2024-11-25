import './index.scss'
import _ from 'lodash'
import { onMounted, ref, watch } from 'vue'

export default {
  name: 'TGScrollingNumber',
  props: {
    itemHeight: {
      type: Number,
      required: true
    },
    /**
     * 滚动目标数字
     */
    targetNumber: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const startDistance = ref(0)
    const targetDistance = ref(0)
    const duration = ref(0)
    const container = ref(null)
    const style = ref({
      '--duration': `${duration.value}ms`,
      '--start': `${-startDistance.value}px`,
      '--target': `${targetDistance.value}px`
    })

    function getRandom(min, max) {
      const floatRandom = Math.random()
      const difference = max - min
      // 介于 0 和差值之间的随机数
      const random = Math.round(difference * floatRandom)

      return random + min
    }

    function update(targetNumber) {
      duration.value = getRandom(500, 2000)
      startDistance.value = targetDistance.value
      targetDistance.value = container.value?.children[targetNumber].offsetTop

      style.value = {
        '--duration': `${duration.value}ms`,
        '--start': `${startDistance.value}px`,
        '--target': `${-targetDistance.value}px`
      }
    }

    onMounted(() => {
      if (props.targetNumber !== 0) {
        update(props.targetNumber)
      }
    })

    watch(() => props.targetNumber, async number => {
      update(number)
    })

    return () => (
      <div class="tg-scrolling-number-content">
        <div
          ref={container}
          class={'tg-scrolling-number-scroll-container animation'}
          style={style.value}
        >
          {
            _.range(0, 10, 1).map(num => {
              return (
                <div style={`height: ${props.itemHeight}px; line-height: ${props.itemHeight}px;`}>
                  {num}
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}
