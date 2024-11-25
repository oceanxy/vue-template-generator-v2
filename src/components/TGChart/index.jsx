import './index.scss'
// 引入监听dom变化的组件
import elementResizeDetectorMaker from 'element-resize-detector'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Spin } from 'ant-design-vue'

export default {
  name: 'TGChart',
  props: {
    option: {
      type: Object,
      required: true
    },
    notMerge: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const chart = ref(null)
    const chartContainer = ref(null)
    const _option = ref(props.option)
    let chartInstance = null
    let elementResizeDetector = null

    watch(_option, value => {
      if (props.notMerge) {
        chartInstance?.clear()
      }

      chartInstance?.setOption(value, props.notMerge)
    }, { deep: true })

    onMounted(() => {
      const height = chart.value.clientHeight

      if (!height) {
        const paddingTop = Number(getComputedStyle(chartContainer.value.parentElement)['paddingTop'].replace(
          /\s+|px/gi,
          ''
        ))
        const paddingBottom = Number(getComputedStyle(chartContainer.value.parentElement)['paddingBottom'].replace(
          /\s+|px/gi,
          ''
        ))

        chart.value.style.height = chartContainer.value.parentElement.clientHeight - paddingTop - paddingBottom + 'px'
      }

      // webpack optimization.splitChunks.cacheGroups.echarts 为了优化 echarts 打包大小而使用的定制包。
      // 生产环境需要读取定制的 echarts.min.js 文件，定制地址：https://echarts.apache.org/zh/builder.html，
      // 非生产环境不需要读 echarts.min.js 文件，直接引用 node_modules 下的 echarts。
      chartInstance = __TG_APP_CUSTOMIZE_PROD_TINY_ECHARTS__.init(chart.value)
      chartInstance.setOption(props.option || {})
      elementResizeDetector = elementResizeDetectorMaker()
      elementResizeDetector.listenTo(chartContainer.value, listener)
    })

    onBeforeUnmount(() => {
      elementResizeDetector?.removeListener(chartContainer.value, listener)
    })

    async function listener() {
      await nextTick()
      chartInstance.resize({ animation: { duration: 200 } })
    }

    return () => (
      <div ref={chartContainer} class="tg-chart-container">
        <Spin spinning={props.loading}>
          {slots.default?.()}
          <div ref={chart} class="chart-container" />
        </Spin>
      </div>
    )
  }
}
