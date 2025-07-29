import { Button, Input } from 'ant-design-vue'
import { reactive, ref, watch } from 'vue'
import { debounce, omitBy } from 'lodash'
import './index.scss'

export default {
  name: 'MultiInput',
  props: {
    ...omitBy(Input.props, (value, key) => key.startsWith('on')),
    value: {
      type: [String, Number],
      default: 0
    },
    defaultValue: {
      type: [String, Number],
      default: 0
    },
    // 可选值：CSS中支持单值、双值、四值写法的属性
    prop: {
      type: String,
      required: true
    },
    layout: {
      type: String,
      default: 'full' // 可选 full half
    },
    // 支持的模式，目前支持单值、双值、四值（暂未适配三值）
    modes: {
      type: Array,
      default: () => ['singleValue', 'dualValue', 'quadValue'], // 默认支持所有模式
      validator: value => {
        const validModes = ['singleValue', 'dualValue', 'quadValue']
        return value.every(mode => validModes.includes(mode))
      }
    }
  },
  setup(props, { emit, slots }) {
    const { layout, prop, modes, ...restProps } = props
    // 初始模式：取 modes 的第一个有效模式
    const mode = ref(modes[0] || 'singleValue')
    const valueArr = reactive({ values: [] }) // 上、右、下、左
    const isInternalUpdate = ref(false)

    // 根据当前模式格式化输出值
    const formatOutputValue = () => {
      switch (mode.value) {
        case 'singleValue':
          return valueArr.values[0] // 返回第一个值
        case 'dualValue':
          return `${valueArr.values[0]} ${valueArr.values[1]}` // 返回前两个值
        case 'quadValue':
          return valueArr.values.join(' ') // 返回所有四个值
        default:
          return valueArr.values.join(' ')
      }
    }

    // 检查当前模式是否可用
    const isModeAvailable = targetMode => modes.includes(targetMode)

    // 解析父组件传入的值
    const parseInputValue = (val) => {
      if (typeof val === 'number' || !val?.includes?.(' ')) {
        return {
          values: [val, val, val, val],
          detectedMode: 'singleValue'
        }
      }

      const vals = val.split(' ')
      if (vals.length === 1) {
        return {
          values: [vals[0], vals[0], vals[0], vals[0]],
          detectedMode: 'singleValue'
        }
      } else if (vals.length === 2) {
        return {
          values: [vals[0], vals[1], vals[0], vals[1]],
          detectedMode: 'dualValue'
        }
      } else {
        return {
          values: vals.slice(0, 4),
          detectedMode: 'quadValue'
        }
      }
    }

    watch(
      () => props.value,
      val => {
        if (isInternalUpdate.value) {
          isInternalUpdate.value = false
          return
        }

        const { values, detectedMode } = parseInputValue(val)

        // 更新值数组
        valueArr.values = values

        // 自动设置匹配的模式（如果该模式可用）
        if (isModeAvailable(detectedMode)) {
          mode.value = detectedMode
        } else {
          // 如果检测到的模式不可用，使用第一个可用模式
          mode.value = modes[0]
        }
      },
      { immediate: true }
    )

    const handleInput = (e, sort) => {
      const newValue = e?.target?.value || props.defaultValue

      // 单值模式：更新所有方向的值
      if (mode.value === 'singleValue') {
        valueArr.values = [newValue, newValue, newValue, newValue]
      }

      // 双值模式联动更新
      else if (mode.value === 'dualValue') {
        if (sort === 0) { // 上 → 同步下
          valueArr.values[0] = newValue
          valueArr.values[2] = newValue
        } else { // 右 → 同步左
          valueArr.values[1] = newValue
          valueArr.values[3] = newValue
        }
      }
      // 四值模式正常更新
      else {
        valueArr.values[sort] = newValue
      }

      // 触发更新（使用防抖）
      debouncedUpdateValue()
    }

    const updateValue = () => {
      isInternalUpdate.value = true
      emit('change', formatOutputValue())
    }

    // 创建防抖版本
    const debouncedUpdateValue = debounce(updateValue, 200)

    const handleModeChange = () => {
      // 获取下一个模式
      const currentIndex = modes.indexOf(mode.value)
      const nextIndex = (currentIndex + 1) % modes.length
      const nextMode = modes[nextIndex]

      // 更新模式
      mode.value = nextMode

      // 立即更新父组件值
      updateValue()
    }

    const MInput = (_props) => {
      return (
        <Input
          {...restProps}
          disabled={props.disabled}
          value={valueArr.values[_props.sort]}
          onClick={e => e.currentTarget.select()}
          onInput={e => handleInput(e, _props.sort)}
          onChange={debouncedUpdateValue}
          onCompositionstart={e => e.target.composing = true}
          onCompositionend={e => {
            e.target.composing = false
            e.target.dispatchEvent(new Event('input'))
          }}
        >
          {{ prefix: slots[_props.iconType] }}
        </Input>
      )
    }

    const getInputs = () => {
      if (mode.value === 'singleValue') {
        return [<MInput sort={0} key="all" iconType="all" />]
      } else if (mode.value === 'dualValue') {
        return [
          <MInput sort={0} key="tb" iconType="tb" />,
          <MInput sort={1} key="lr" iconType="lr" />
        ]
      } else if (mode.value === 'quadValue') {
        return [
          <MInput sort={0} key="top" iconType="top" />,
          <MInput sort={3} key="left" iconType="left" />,
          <MInput sort={2} key="bottom" iconType="bottom" />,
          <MInput sort={1} key="right" iconType="right" />
        ]
      }
    }

    // 模式名称映射
    const modeNames = {
      singleValue: '单值',
      dualValue: '双值',
      quadValue: '四值'
    }

    return () => (
      <div
        class={{
          'tg-designer-property-comp': true,
          'tg-designer-property-comp-multi-input': true,
          'disabled': props.disabled
        }}
        onChange={e => e.preventDefault = true}
      >
        <div
          class={{
            'tg-designer-property-comp-multi-input-wrapper': true,
            [mode.value === 'singleValue' ? 'full' : layout]: true
          }}
        >
          {getInputs()}
        </div>
        {/* 当有多个模式时才显示切换按钮 */}
        {modes.length > 1 && (
          <div class={'tg-designer-property-expend'}>
            <Button
              type={'text'}
              title={`切换为${modeNames[modes[(modes.indexOf(mode.value) + 1) % modes.length]]}模式`}
              disabled={props.disabled}
              onClick={handleModeChange}
            >
              <IconFont type={'icon-designer-property-multi-input-expend'} />
            </Button>
          </div>
        )}
      </div>
    )
  }
}
