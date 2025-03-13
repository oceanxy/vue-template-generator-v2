import useFunction, { FunctionButtonEnum } from '@/composables/tgFunction'

export default {
  name: 'AccountFunctions',
  setup() {
    const { TGFunction } = useFunction()

    return () => <TGFunction functionButtons={FunctionButtonEnum.ADD} />
  }
}
