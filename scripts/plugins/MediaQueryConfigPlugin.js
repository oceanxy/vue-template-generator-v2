const fs = require('node:fs')
const { resolve, join } = require('node:path')
const BasePlugin = require('./BasePlugin')

/**
 * 媒体查询配置插件
 *
 * 读取项目配置文件，将配置注入环境变量，用于在构建时提取媒体查询
 */
class MediaQueryConfigPlugin extends BasePlugin {
  constructor({ appName }) {
    super({ appName })
    this.envVariableName = 'TG_APP_EXTRACT_MEDIA_QUERIES_CONFIG'
  }

  apply(compiler) {
    // 在环境准备阶段读取配置
    compiler.hooks.environment.tap('MediaQueryConfigPlugin', () => {
      try {
        const configPath = resolve(join(__dirname, '../../src/apps', this.appName, 'configs/index.js'))
        if (fs.existsSync(configPath)) {
          const config = require(configPath)

          if (config.extractMediaQueries) {
            // 将配置序列化后注入环境变量
            process.env[this.envVariableName] = JSON.stringify(config.extractMediaQueries)

            this.tips('Media query configuration loaded successfully')
          }
        } else {
          console.warn(`Config file not found: ${configPath}`)
          process.env[this.envVariableName] = '{}'
        }
      } catch (error) {
        console.error('Failed to load media query config:', error.message)
        process.env[this.envVariableName] = '{}'
      }
    })

    // 在编译完成后清理
    compiler.hooks.done.tap('MediaQueryConfigPlugin', () => {
      delete process.env[this.envVariableName]
    })
  }
}

module.exports = MediaQueryConfigPlugin
