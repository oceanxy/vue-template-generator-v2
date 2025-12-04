const chalk = require('chalk')
const { accessSync, constants } = require('node:fs')
const { resolve, join } = require('path')

class BasePlugin {
  constructor({ appName }) {
    this.appName = appName
  }

  log(text) {
    console.info(chalk.hex('#1fb0ff')(`<i> [${this.appName}] `) + chalk.gray(`检测到${text}，已成功加载。`))
  }

  tips(text) {
    console.info(chalk.hex('#fcca6b')(`<tip> [${this.appName}] `) + chalk.hex('#fcca6b')(text))
  }

  /**
   * 预加载资源文件（基于 webpack.ProvidePlugin 插件）
   * @param {string} url - 资源地址
   * @param {(string) => void} onSuccess - 资源读取成功的回调函数
   * @param {(Error) => void} [onError] - 资源读取失败的回调函数
   */
  preloadResources(url, onSuccess, onError) {
    const resource = resolve(join(__dirname, '../..', url))

    try {
      accessSync(resource, constants.F_OK)
      onSuccess?.(resource)
    } catch (e) {
      if (typeof onError === 'function') {
        onError?.(e)
      } else {
        throw new Error(e)
      }
    }
  }
}

module.exports = BasePlugin
