import { computed, ref, watch } from 'vue'
import './index.scss'

export default {
  name: 'MultiSelect',
  props: {
    // 选项配置
    options: {
      type: Array,
      default: () => [],
      required: true,
      validator: (options) => {
        return options.every(option =>
          typeof option === 'object' &&
          'label' in option &&
          'value' in option
        )
      }
    },
    // 当前选中的值（数组）
    value: {
      type: [Array, Object],
      default: () => []
    },
    // 是否禁用整个组件
    disabled: {
      type: Boolean,
      default: false
    },
    // 尺寸
    size: {
      type: String,
      default: 'middle',
      validator: value => ['small', 'middle', 'large'].includes(value)
    },
    // 新增属性：控制返回值格式
    returnObject: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value', 'change'],
  setup(props, { emit }) {
    // 内部选中的值（数组形式）
    const selectedValues = ref([])

    // 根据 returnObject 属性格式化输出值
    const formatOutputValue = () => {
      if (props.returnObject) {
        // 只返回 options 中定义的键
        return props.options.reduce((obj, option) => {
          const isSelected = selectedValues.value.includes(option.value)
          obj[option.value] = option.negate ? !isSelected : isSelected
          return obj
        }, {})
      } else {
        // 返回数组格式
        return [...selectedValues.value]
      }
    }

    // 解析父组件传入的值
    const parseInputValue = (val) => {
      if (Array.isArray(val)) {
        return val
      } else if (typeof val === 'object' && val !== null) {
        // 只处理 options 中定义的键
        return props.options.reduce((result, option) => {
          const optionValue = option.value

          // 只处理 options 中存在的键
          if (Object.prototype.hasOwnProperty.call(val, optionValue)) {
            const isSet = val[optionValue] === true

            if (option.negate) {
              if (!isSet) result.push(optionValue)
            } else {
              if (isSet) result.push(optionValue)
            }
          }

          return result
        }, [])
      }
      return []
    }

    // 初始化选中值
    watch(
      () => props.value,
      (newValue) => {
        selectedValues.value = parseInputValue(newValue)
      },
      { immediate: true, deep: true }
    )

    // 处理选项点击
    const handleOptionClick = (optionValue) => {
      if (props.disabled) return

      const index = selectedValues.value.indexOf(optionValue)

      if (index === -1) {
        // 添加选中项
        selectedValues.value.push(optionValue)
      } else {
        // 移除选中项
        selectedValues.value.splice(index, 1)
      }

      // 格式化并更新父组件
      const outputValue = formatOutputValue()
      emit('update:value', outputValue)
      emit('change', outputValue)
    }

    // 检查选项是否被选中
    const isSelected = (value) => selectedValues.value.includes(value)

    // 检查选项是否禁用
    const isDisabled = (option) => props.disabled || option.disabled

    // 尺寸类名
    const sizeClass = computed(() => {
      switch (props.size) {
        case 'small':
          return 'tg-designer-multi-select-small'
        case 'large':
          return 'tg-designer-multi-select-large'
        default:
          return 'tg-designer-multi-select-middle'
      }
    })

    return () => {
      return (
        <div
          class={{
            'tg-designer-multi-select': true,
            'tg-designer-multi-select-disabled': props.disabled,
            [sizeClass.value]: true
          }}
          role="group"
          aria-label="多选分段控件"
        >
          {props.options.map(option => (
            <div
              key={option.value}
              class={{
                'tg-designer-multi-select-item': true,
                'tg-designer-multi-select-item-selected': isSelected(option.value),
                'tg-designer-multi-select-item-disabled': isDisabled(option)
              }}
              onClick={() => !isDisabled(option) && handleOptionClick(option.value)}
              aria-checked={isSelected(option.value)}
              aria-disabled={isDisabled(option)}
              tabindex={isDisabled(option) ? -1 : 0}
              onKeydown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleOptionClick(option.value)
                }
              }}
              title={option.title}
            >
              {
                typeof option.label === 'function'
                  ? option.label()
                  : option.label
              }
            </div>
          ))}
        </div>
      )
    }
  }
}
