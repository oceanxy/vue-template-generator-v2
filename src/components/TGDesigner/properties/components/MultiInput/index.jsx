import { Button, Input } from 'ant-design-vue'
import './index.scss'
import { computed, reactive, ref, watch } from 'vue'
import { debounce, omitBy } from 'lodash'

export default {
  name: 'MultiInput',
  props: {
    ...omitBy(Input.props, (value, key) => key.startsWith('on')),
    value: {
      type: [String, Number],
      default: 0
    },
    prop: {
      type: String,
      required: true // 可选值 padding margin
    },
    layout: {
      type: String,
      default: 'full' // 可选 full half
    }
  },
  setup(props, { emit }) {
    const { layout, prop, ...restProps } = props
    const iconPrefix = computed(() => `icon-designer-property-${prop}`)
    const mode = ref('dualValue') // 可选 dualValue quadValue
    const valueArr = reactive({ values: [] }) // 上、右、下、左
    const isInternalUpdate = ref(false)

    watch(
      () => props.value,
      val => {
        if (isInternalUpdate.value) {
          isInternalUpdate.value = false
          return
        }

        if (typeof val === 'number' || !isNaN(!val ? 0 : val)) {
          if (mode.value === 'dualValue') {
            valueArr.values = [val, val]
          } else {
            valueArr.values = [val, val, val, val]
          }
        } else {
          const vals = val.split(' ')

          if (vals.length < 4) {
            mode.value = 'dualValue'
            valueArr.values = [vals[0], vals[1]]
          } else {
            mode.value = 'quadValue'
            valueArr.values = [vals[0], vals[1], vals[2], vals[3]]
          }
        }
      },
      { immediate: true }
    )

    const handleInput = (e, sort) => {
      valueArr.values[sort] = e?.target.value || 0
    }

    const updateValue = debounce(() => {
      isInternalUpdate.value = true
      emit('change', valueArr.values.join(' '))
    }, 200)

    const handleModeChange = () => {
      if (mode.value === 'dualValue') {
        mode.value = 'quadValue'
        valueArr.values = [valueArr.values[0], valueArr.values[1], valueArr.values[0], valueArr.values[1]]
      } else {
        mode.value = 'dualValue'
        valueArr.values = [valueArr.values[0], valueArr.values[1]]
      }

      updateValue()
    }

    const MInput = (_props) => {
      return (
        <Input
          {...restProps}
          value={valueArr.values[_props.sort]}
          prefix={<IconFont type={`${iconPrefix.value}-${_props.iconType}`} />}
          onClick={e => e.currentTarget.select()}
          onInput={e => handleInput(e, _props.sort)}
          onChange={updateValue}
          onCompositionstart={e => e.target.composing = true}
          onCompositionend={e => {
            e.target.composing = false
            e.target.dispatchEvent(new Event('input'))
          }}
        />
      )
    }

    const getInputs = () => {
      if (mode.value === 'dualValue') {
        return [
          <MInput sort={0} iconType={'tb'} />,
          <MInput sort={1} iconType={'lr'} />
        ]
      }

      return [
        <MInput sort={0} iconType={'top'} />,
        <MInput sort={3} iconType={'left'} />,
        <MInput sort={2} iconType={'bottom'} />,
        <MInput sort={1} iconType={'right'} />
      ]
    }

    return () => (
      <div
        onChange={e => e.preventDefault = true}
        class={{
          'tg-designer-property-comp-multi-input': true,
          'dual-value': mode.value === 'dualValue',
          'quad-value': mode.value === 'quadValue'
        }}
      >
        <div
          class={{
            'tg-designer-property-comp-multi-input-wrapper': true,
            [layout]: true
          }}
        >
          {getInputs()}
        </div>
        <div class={'tg-designer-property-expend'}>
          <Button
            type={'text'}
            title={`切换为${mode.value === 'dualValue' ? '四值' : '双值'}输入模式`}
            icon={<IconFont type={'icon-designer-property-multi-input-expend'} />}
            onClick={handleModeChange}
          />
        </div>
      </div>
    )
  }
}
