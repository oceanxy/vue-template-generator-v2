import { toRaw } from 'vue'
import { cloneDeep } from 'lodash'

export default function resetFieldsPlugin(context) {
  // 保存初始状态
  const initialState = cloneDeep(toRaw(context.store.$state))

  // 提供一个方法来获取初始状态
  context.store.getInitialState = () => initialState

  // 提供一个方法来重置特定的多层级状态字段
  context.store.$resetFields = (fields) => {
    fields.forEach(fieldPath => {
      const pathParts = fieldPath.split('.')
      let currentState = context.store.$state
      let initialStateCopy = initialState

      for (let i = 0; i < pathParts.length - 1; i++) {
        if (currentState[pathParts[i]]) {
          currentState = currentState[pathParts[i]]
          initialStateCopy = initialStateCopy[pathParts[i]]
        } else {
          return // 路径不存在，跳过
        }
      }

      const lastPart = pathParts[pathParts.length - 1]
      currentState[lastPart] = initialStateCopy[lastPart] // 重置到初始值
    })
  }
}
