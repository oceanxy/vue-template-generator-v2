import { inject, ref } from 'vue'

export const moduleName = Symbol('moduleName')

export default function useModuleName() {
  const _moduleName = ref(null)

  // 由路由提供（router.currentRoute.value.name）
  _moduleName.value = inject(moduleName)

  if (!_moduleName.value) {
    throw new Error('No provided moduleName！')
  }

  return _moduleName
}
