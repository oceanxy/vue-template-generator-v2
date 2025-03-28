import { Cascader } from 'ant-design-vue'
import { computed, watch, ref } from 'vue'

export default {
  name: 'TGCascader',
  props: {
    // 解构 ant-design-vue Cascader props
    ...Cascader.props,
  },
  setup(props, { slots, events }) {
    const { fieldNames, options } = props
    const selectedPath = ref(null)

    // props.value 通过传入最后一级遍历回显前面一级或者多级的数据
    function findPath(tree, targetValue, path = []) {
      for (const node of tree) {
        const currentPath = [...path, node[fieldNames.value]];
        if (node[fieldNames.value] === targetValue) {
          return currentPath; // 找到目标，返回路径
        }
        if (node[props.fieldNames.children]) {
          const found = findPath(node[props.fieldNames.children], targetValue, currentPath);
          if (found) return found; // 子节点中找到目标，传递路径
        }
      }
      return null; // 未找到目标
    }


    const updateSelectedPath = (value) => {
      if (value && value.length > 0) {
        selectedPath.value = findPath(options, value[value.length - 1])
      } else {
        selectedPath.value = null
      }
    }

    updateSelectedPath(props.value)

    watch(() => props.value, (newValue) => {
      updateSelectedPath(newValue)
    })

    const innerProps = computed(() => {
      const {
        identification,
        ...cascaderProps
      } = props

      return {
        identification,
        cascaderProps: {
          ...cascaderProps,
          value: selectedPath.value
        }
      }
    })

    return () => (
      <Cascader
        {...innerProps.value.cascaderProps}
        slots={slots}
        {...events}
      >
      </Cascader>
    )
  }
}
