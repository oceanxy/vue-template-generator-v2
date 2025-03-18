/**
 * 权限按钮组件
 * @Author: Omsber
 * @Email: xyzsyx@163.com
 * @Date: 2024-04-01 周一 10:32:43
 */
import { Button } from 'ant-design-vue'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import configs from '@/configs'
import { computed } from 'vue'
import router from '@/router'

const appName = getFirstLetterOfEachWordOfAppName()
let buttonPermissions

try {
  buttonPermissions = JSON.parse(localStorage.getItem(`${appName}-buttonPermissions`))
} catch (err) {
  buttonPermissions = {}
}

/**
 * 枚举：权限按钮无效状态显示方式
 * @readonly
 * @enum {number}
 */
export const disabledType = {
  DISABLE: 1,
  HIDE: 2
}

/**
 * 获取按钮或模块权限
 * @global
 * @param moduleName {string} - 要获取权限的目标所在模块名称
 * @param identification {string} - 权限标识符
 * @returns {boolean}
 */
export function getButtonPermission(moduleName, identification) {
  return !configs.buttonPermissions || !!buttonPermissions?.[moduleName]?.includes(identification)
}

export default {
  name: 'TGPermissionsButton',
  props: {
    // 解构 ant-design-vue Button props
    ...Button.props,
    // 权限按钮标识
    identification: {
      type: String,
      required: true
    },
    // 权限按钮无效状态显示方式
    disabledType: {
      type: Number,
      default: disabledType.HIDE
    }
  },
  setup(props, { slots, events }) {
    const innerDisabled = computed(() => {
      if (!configs.buttonPermissions) return false

      return !buttonPermissions?.[router.currentRoute.value.name]?.includes(props.identification)
    })

    const innerProps = computed(() => {
      const {
        identification,
        disabledType,
        ...buttonProps
      } = props

      return {
        identification,
        disabledType,
        buttonProps: {
          ...buttonProps,
          // 按钮的 disabled 属性被本组件掌控，
          // 优先取用后台返回的按钮权限，当优先值为 false 时，再取用组件传递的 disabled 值
          disabled: innerDisabled.value || buttonProps.disabled
        }
      }
    })

    return () => innerProps.value.disabledType === disabledType.HIDE && innerDisabled.value
      ? null
      : (
        <Button
          {...innerProps.value.buttonProps}
          {...events}
        >
          {slots.icon?.()}
          {slots.default?.()}
        </Button>
      )
  }
}
