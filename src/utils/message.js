import { message as Message, Modal } from 'ant-design-vue'

export function showMessage(option) {
  if (!option.message) {
    option.content = '发生未知错误，请稍后再试！'
  } else if (option.message.includes('Network Error') || option.message.includes('500')) {
    option.content = '请检查网络或服务是否异常，或稍后再试！'
  } else if (option.message.includes('503') || option.message.includes('504')) {
    option.content = `发生错误，请联系系统管理员！(错误码${option.code})`
    console.error(option.message)
  } else if (option.message.includes('403')) {
    option.content = '没有权限进入系统！(错误码403)'
  } else if (option.message.includes('404')) {
    option.content = '请检查服务是否异常，或联系管理员处理！(错误码404)'
  } else if (option.message.includes('timeout')) {
    option.content = '连接超时，请稍后再试！'
  } else {
    option.content = option.message
  }

  Message.error(option)
}

/**
 * 执行批量操作前的表格多选非空验证
 * @param selection {[]} 列表选择项
 * @param [callback] {Function} 询问内容对应的回调函数
 * @param [content] {string} 询问的内容
 */
export async function verifySelected(selection, callback, content) {
  if (!selection.length) {
    Message.warning('请至少勾选一项！')

    return
  }

  if (typeof callback === 'function') {
    if (content) {
      await this.verificationDialog(callback, content)
    } else {
      callback()
    }
  }
}

/**
 * 显示询问对话框
 * @param callback {() => Promise<boolean>} 点击确认按钮对应的回调函数，回调函数返回一个布尔类型的值，表示回调成功或失败
 * @param content {string | JSX.Element | (() => JSX.Element)} 询问的内容
 * @param [successfulPrompt] {string|JSX.Element|JSX.Element[]} 操作成功的提示内容
 * @returns {void}
 */
export function verificationDialog(callback, content, successfulPrompt) {
  Modal.confirm({
    title: '请确认',
    content,
    okText: '确定',
    cancelText: '取消',
    onOk: async close => {
      if (typeof callback === 'function') {
        const status = await callback()

        successfulPrompt && message(status, successfulPrompt)
      }

      close()
    }
  })
}

/**
 * 消息框
 * @param status {boolean} 操作状态
 * @param [prompt] {string} 提示内容
 * @param [force=false] {boolean} 强制显示错误信息
 */
export function message(status, prompt, force) {
  if (status) {
    Message.success(prompt || '操作成功！')
  } else if (force) {
    Message.error(prompt || '操作失败！')
  } else {
    // 全局拦截有对失败的处理，这里不再重复处理
    // Message.error('操作失败！')
  }
}
