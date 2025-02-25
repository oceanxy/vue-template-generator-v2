/**
 * ant design vue 组件相关设置
 */

import { message as Message } from 'ant-design-vue'
import configs from '@/configs'
import { createFromIconfontCN } from '@ant-design/icons-vue'
import ICON_FONT from '@app/assets/iconfont'

export default function antDesignConfig(app) {
  // 全局消息数量设置
  Message.config({ maxCount: configs.maxMessageCount })

  // 自定义图标
  let iconfontUrl = configs.iconFontSymbol

  if (!iconfontUrl) {
    iconfontUrl = ICON_FONT
  }

  const IconFont = createFromIconfontCN({
    scriptUrl: iconfontUrl
  })

  app.component('IconFont', IconFont)
}

