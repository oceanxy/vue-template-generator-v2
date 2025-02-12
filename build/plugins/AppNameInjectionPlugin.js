const path = require('path')

class AppNameInjectionPlugin {
  constructor(options) {
    this.appName = options.appName
  }

  /**
   * @param compiler {import('webpack').Compiler}
   */
  apply(compiler) {
    compiler.hooks.afterEnvironment.tap('AppNameInjectionPlugin', compilation => {
      compiler.options.appName = this.appName
      compiler.options.resolve.alias = {
        ...compiler.options.resolve.alias,
        '@app': path.join(__dirname, `../../src/apps/${this.appName}`)
      }
    })
  }
}

module.exports = AppNameInjectionPlugin
