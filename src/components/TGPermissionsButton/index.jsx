/**
 * 权限按钮组件
 * @Author: Omsber
 * @Email: xyzsyx@163.com
 * @Date: 2024-04-01 周一 10:32:43
 */
import { Button } from 'ant-design-vue'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'

const appName = getFirstLetterOfEachWordOfAppName()

/**
 * 枚举：权限按钮无效状态显示方式
 * @readonly
 * @enum {number}
 */
export const disabledType = {
  DISABLE: 1,
  HIDE: 2
}

export default {
  inject: { moduleName: { default: '' } },
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
  computed: {
    innerDisabled() {
      if (!this.$config.buttonPermissions) return false

      const { identification } = this._props
      const buttonPermissions = JSON.parse(localStorage.getItem(`${appName}-buttonPermissions`))

      return !buttonPermissions?.[this.moduleName]?.includes(identification)
    },
    innerProps() {
      const {
        identification,
        disabledType,
        ...buttonProps
      } = this._props

      return {
        identification,
        disabledType,
        buttonProps: {
          ...buttonProps,
          // 按钮的 disabled 属性被本组件掌控，
          // 优先取用后台返回的按钮权限，当优先值为 false 时，再取用组件传递的 disabled 值
          disabled: this.innerDisabled || buttonProps.disabled
        }
      }
    }
  },
  render() {
    return this.innerProps.disabledType === disabledType.HIDE && this.innerDisabled
      ? null
      : (
        <Button
          {...{
            props: this.innerProps.buttonProps,
            on: this._events
          }}
        >
          {this.$slots.default}
        </Button>
      )
  }
}
