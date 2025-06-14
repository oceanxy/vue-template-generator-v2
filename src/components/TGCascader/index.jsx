import { Cascader } from 'ant-design-vue'
import { ref, useAttrs, watch } from 'vue'

export default {
  name: 'TGCascader',
  props: {
    // 解构 ant-design-vue Cascader props
    value: {
      type: Array,
      default: () => []
    },
    options: {
      type: Array,
      default: () => []
    },
  },
  emits: ['update:value', 'change'],
  setup(props, { slots, emit }) {
    const attrs = useAttrs()
    const { fieldNames } = attrs
    const selectedPath = ref([])

    const getTreePath = (
      value,
      dataSource,
      { key = "id", resultKey, children = "children" } = {},
      complete = false,
      isFullForEach = false
    ) => {
      const result = [];
      const temporary = [];
      const _resultKey = resultKey || key;

      if (!value) {
        return result;
      }

      const fn = (list) => {
        let isFind = false;

        for (let i = 0; i < list.length; i++) {
          const item = list[i];

          if (complete) {
            temporary.push(item);
          } else {
            temporary.push(item[_resultKey]);
          }

          if (item[_resultKey] == value) {
            result.push(...temporary);
            isFind = true;
          }

          if (isFullForEach || !isFind) {
            if (item[children] && item[children].length > 0) {
              isFind = fn(item[children]);
            }
          }

          temporary.pop();

          if (!isFullForEach && isFind) {
            break;
          }
        }

        return isFind;
      };

      fn(dataSource);

      return result;
    };

    const updateSelectedPath = (value) => {
      if (value && value.length > 0) {
        selectedPath.value = getTreePath(value, props.options, {
          key: fieldNames.value, children: fieldNames.children
        }, false)
      }
    }

    watch(() => props.options, (newOptions) => {
      if (props.value.length && newOptions.length) {
        updateSelectedPath(props.value)
      }
    }, { immediate: true })

    watch(() => props.value, (newValue) => {
      if (!newValue.length) {
        selectedPath.value = []
      }
    })

    return () => (
      <Cascader
        {...attrs}
        vModel:value={selectedPath.value}
        options={props.options}
        onChange={(value, selectedOptions) => {
          emit('update:value', value)
          emit('change', value, selectedOptions)
        }}
      >
      </Cascader>
    )
  }
}
