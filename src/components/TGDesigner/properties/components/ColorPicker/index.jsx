import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import TGColorPicker from '@/components/TGColorPicker'
import './index.scss'

const parseGradientString = (gradientStr) => {
  if (!gradientStr) return null

  const regex = /linear-gradient\(([^,]+),([^)]+)\)/
  const match = gradientStr.match(regex)

  if (!match) return null

  const stops = []
  const stopsStr = match[2].trim()
  const stopParts = stopsStr.split(',').map(s => s.trim())

  stopParts.forEach(part => {
    const colorMatch = part.match(/([a-z]+|#[\da-fA-F]{3,6}|rgba?\([^)]+\))\s*(\d+%)?/)
    if (colorMatch) {
      const color = colorMatch[1]
      const offset = colorMatch[2] ? parseFloat(colorMatch[2]) : undefined
      stops.push({ color, offset })
    }
  })

  // 自动计算未指定位置的色标偏移量
  if (stops.length > 1) {
    const lastIndex = stops.length - 1
    stops.forEach((stop, i) => {
      if (stop.offset === undefined) {
        if (i === 0) stop.offset = 0
        else if (i === lastIndex) stop.offset = 100
        else stop.offset = (i / lastIndex) * 100
      }
    })
  }

  return stops
}

export default {
  name: 'PropertyGradientColorPicker',
  props: {
    ...TGColorPicker.props,
    gradient: {
      type: Boolean,
      default: false
    }
  },
  emits: ['change', 'update:value'],
  setup(props, { attrs, emit }) {
    const colorStops = ref([])
    const activeIndex = ref(0)
    const isDragging = ref(false)
    const gradientBarRef = ref(null) // 渐变条DOM引用
    const lastClickedWasTag = ref(false)
    const isTagMoved = ref(false)

    // 初始化色标
    const initColorStops = () => {
      if (props.gradient) {
        // 尝试解析渐变字符串
        if (typeof props.value === 'string') {
          const parsedStops = parseGradientString(props.value)
          if (parsedStops && parsedStops.length >= 2) {
            colorStops.value = parsedStops
            return
          }
        }

        // 回退到对象格式或默认值
        if (props.value?.stops?.length >= 2) {
          colorStops.value = [...props.value.stops]
        } else {
          colorStops.value = [
            { color: '#ffffff', offset: 0 },
            { color: '#000000', offset: 100 }
          ]
        }
      } else {
        colorStops.value = [{ color: props.value || '#ffffff', offset: 0 }]
      }
    }

    // 组件挂载时初始化
    onMounted(initColorStops)

    // 监听props变化
    watch(() => props.gradient, () => {
      initColorStops()
      emitUpdate()
    })

    watch(() => props.value, newVal => {
      if (props.gradient) {
        if (typeof newVal === 'string') {
          const parsedStops = parseGradientString(newVal)
          if (parsedStops && parsedStops.length >= 2) {
            colorStops.value = parsedStops
            return
          }
        }

        if (newVal?.stops?.length >= 2) {
          colorStops.value = [...newVal.stops]
        }
      } else {
        colorStops.value = [{ color: newVal, offset: 0 }]
      }
    })

    // 计算渐变条样式
    const gradientBarStyle = computed(() => {
      if (!props.gradient) return ''

      const stops = colorStops.value
        .map(stop => `${stop.color || 'transparent'} ${stop.offset}%`)
        .join(', ')

      return `linear-gradient(to right, ${stops})`
    })

    // 开始拖动色标
    const handleTagMouseDown = (index, e) => {
      e.preventDefault()
      e.stopPropagation()

      isDragging.value = true
      activeIndex.value = index

      // 添加全局事件监听
      document.addEventListener('mousemove', handleGlobalDrag)
      document.addEventListener('mouseup', handleGlobalEndDrag)
    }

    // 修改色标的点击处理
    const handleTagClick = (index, e) => {
      if (isDragging.value) return

      e.stopPropagation()

      activeIndex.value = index
      lastClickedWasTag.value = true

      // 添加延迟重置，确保渐变条双击能捕获
      setTimeout(() => {
        lastClickedWasTag.value = false
      }, 200)
    }

    // 添加色标
    const addColorStop = (e) => {
      if (lastClickedWasTag.value) {
        lastClickedWasTag.value = false
        return
      }

      const bar = e.currentTarget
      const rect = bar.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetPercent = Math.min(100, Math.max(0, Math.round((offsetX / rect.width) * 100)))

      let insertIndex = colorStops.value.findIndex(stop => stop.offset >= offsetPercent)
      if (insertIndex === -1) insertIndex = colorStops.value.length

      const prevColor = colorStops.value[Math.max(0, insertIndex - 1)]?.color || '#ffffff'
      const nextColor = colorStops.value[Math.min(colorStops.value.length - 1, insertIndex)]?.color || '#000000'

      const newColor = mixColors(prevColor, nextColor, offsetPercent / 100)

      colorStops.value.splice(insertIndex, 0, {
        color: newColor,
        offset: offsetPercent
      })

      activeIndex.value = insertIndex
      emitUpdate()
    }

    // 混合颜色
    const mixColors = (color1, color2, ratio) => {
      return ratio < 0.5 ? color1 : color2
    }

    // 删除色标
    const removeColorStop = (index, e) => {
      e.stopPropagation()
      if (colorStops.value.length <= 2) return

      colorStops.value.splice(index, 1)

      if (activeIndex.value >= index) {
        activeIndex.value = Math.max(0, Math.min(colorStops.value.length - 1, activeIndex.value - 1))
      }

      emitUpdate()
    }

    // 全局拖动处理
    const handleGlobalDrag = (e) => {
      if (!isDragging.value || !props.gradient || !gradientBarRef.value) return

      const bar = gradientBarRef.value
      const rect = bar.getBoundingClientRect()
      let offsetX = e.clientX - rect.left
      offsetX = Math.max(0, Math.min(offsetX, rect.width))
      const offsetPercent = Math.round((offsetX / rect.width) * 100)

      // 保存当前操作的色标对象
      const currentStop = colorStops.value[activeIndex.value]

      // 更新当前色标位置（通过对象引用直接修改）
      if (activeIndex.value === 0) {
        currentStop.offset = Math.min(offsetPercent, colorStops.value[1]?.offset - 1 || 99)
      } else if (activeIndex.value === colorStops.value.length - 1) {
        currentStop.offset = Math.max(
          offsetPercent,
          colorStops.value[colorStops.value.length - 2]?.offset + 1 || 1
        )
      } else {
        currentStop.offset = Math.max(
          colorStops.value[activeIndex.value - 1]?.offset + 1 || 0,
          Math.min(
            offsetPercent,
            colorStops.value[activeIndex.value + 1]?.offset - 1 || 100
          )
        )
      }

      // 排序并更新索引
      colorStops.value.sort((a, b) => a.offset - b.offset)
      activeIndex.value = colorStops.value.findIndex(stop => stop === currentStop) // 通过引用匹配
      isTagMoved.value = true
    }

    // 全局结束拖动处理
    const handleGlobalEndDrag = () => {
      if (isDragging.value && isTagMoved.value) {
        emitUpdate()
      }

      isDragging.value = false
      isTagMoved.value = false

      // 移除全局事件监听
      document.removeEventListener('mousemove', handleGlobalDrag)
      document.removeEventListener('mouseup', handleGlobalEndDrag)
    }

    // 组件卸载时清理事件监听
    onUnmounted(() => {
      document.removeEventListener('mousemove', handleGlobalDrag)
      document.removeEventListener('mouseup', handleGlobalEndDrag)
    })

    // 更新颜色值
    const updateColor = (color) => {
      colorStops.value[activeIndex.value].color = color
      emitUpdate()
    }

    // 提交更新
    const emitUpdate = () => {
      let value

      if (props.gradient) {
        value = gradientBarStyle.value
      } else {
        value = colorStops.value[0]?.color || '#ffffff'
      }

      console.log(value)

      emit('update:value', value)
      emit('change', value)
    }

    return () => (
      <div class="tg-designer-property-comp tg-designer-property-comp-color-picker">
        {
          props.gradient
            ? (
              <div class="tg-designer-property-comp-gradient-picker-compact">
                <TGColorPicker
                  {...props}
                  {...attrs}
                  value={colorStops.value[activeIndex.value]?.color}
                  defaultValue={props.defaultValue}
                  onChange={updateColor}
                />
                <div
                  ref={gradientBarRef} // 绑定DOM引用
                  class="tg-designer-property-comp-gradient-bar"
                  style={{ '--background-image': gradientBarStyle.value }}
                  onClick={addColorStop}
                >
                  {
                    colorStops.value.map((stop, index) => (
                      <div
                        key={index}
                        class={[
                          'tg-designer-property-comp-gradient-color-tag',
                          { active: index === activeIndex.value }
                        ]}
                        style={{ left: `${stop.offset}%` }}
                        onClick={e => handleTagClick(index, e)}
                        onDblclick={(e) => removeColorStop(index, e)}
                        onMousedown={(e) => handleTagMouseDown(index, e)}
                      >
                        <div
                          class={'tag-indicator'}
                          style={{ backgroundColor: stop.color }}
                          data-offset={`${stop.offset}%`}
                        />
                      </div>
                    ))
                  }
                </div>
              </div>
            )
            : (
              <div class="tg-designer-property-comp-color-picker-wrapper">
                <TGColorPicker
                  {...props}
                  {...attrs}
                  value={props.value}
                  defaultValue={props.defaultValue}
                  onChange={updateColor}
                />
              </div>
            )
        }
      </div>
    )
  }
}
