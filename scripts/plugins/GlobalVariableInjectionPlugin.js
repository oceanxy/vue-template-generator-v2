const { ProvidePlugin } = require('webpack')
const chalk = require('chalk')
const { resolve, join } = require('path')
const { accessSync, constants } = require('node:fs')

class GlobalVariableInjectionPlugin {
  constructor() {}

  log(text) {
    console.info(chalk.hex('#1fb0ff')('编译信息：') + chalk.gray(`检测到${text}，已成功加载。`))
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

  apply(compiler) {
    compiler.hooks.compilation.tap('GlobalVariableInjectionPlugin', compilation => {
      if (compilation.options.plugins) {
        const appName = compiler.options.appName

        // 修改现有插件的配置
        const existingPlugins = compilation.options.plugins

        // 修改 ProvidePlugin 插件的参数
        for (const plugin of existingPlugins) {
          if (plugin instanceof ProvidePlugin) {
            // 预加载配置文件
            if (!plugin.definitions.__TG_APP_CONFIG__) {
              this.preloadResources(
                `src/apps/${appName}/configs/index.js`,
                resource => {
                  this.log(`配置文件（src/apps/${appName}/configs/index.js）`)
                  plugin.definitions.__TG_APP_CONFIG__ = resource
                }
              )
            }

            // 预加载路由文件
            if (!plugin.definitions.__TG_APP_ROUTES__) {
              this.preloadResources(
                `src/apps/${appName}/router/index.js`,
                resource => {
                  this.log(`路由文件（src/apps/${appName}/router/index.js）`)
                  plugin.definitions.__TG_APP_ROUTES__ = resource
                }
              )
            }

            // 预加载登录组件
            if (!plugin.definitions.__TG_APP_LOGIN_COMPONENT__) {
              this.preloadResources(
                `src/apps/${appName}/views/Login/index.jsx`,
                resource => {
                  this.log(`登录组件（src/apps/${appName}/views/index.jsx）`)
                  plugin.definitions.__TG_APP_LOGIN_COMPONENT__ = resource
                },
                () => {
                  this.preloadResources(
                    `src/apps/${appName}/views/Login/index.vue`,
                    resource => {
                      this.log(`登录组件（src/apps/${appName}/views/Login/index.vue）`)
                      plugin.definitions.__TG_APP_LOGIN_COMPONENT__ = resource
                    },
                    () => {
                      this.preloadResources(
                        `src/views/Login/index.jsx`,
                        resource => {
                          plugin.definitions.__TG_APP_LOGIN_COMPONENT__ = resource
                        },
                        () => {
                          this.preloadResources(
                            `src/views/Login/index.vue`,
                            resource => {
                              plugin.definitions.__TG_APP_LOGIN_COMPONENT__ = resource
                            }
                          )
                        }
                      )
                    }
                  )
                }
              )
            }

            // 预加载 App 入口文件
            if (!plugin.definitions.__TG_APP_COMPONENT__) {
              this.preloadResources(
                `src/apps/${appName}/App.jsx`,
                resource => {
                  this.log(`入口组件（src/apps/${appName}/App.jsx）`)
                  plugin.definitions.__TG_APP_COMPONENT__ = resource
                },
                (e) => {
                  this.preloadResources(
                    `src/apps/${appName}/App.vue`,
                    resource => {
                      this.log(`入口组件（src/apps/${appName}/App.vue）`)
                      plugin.definitions.__TG_APP_COMPONENT__ = resource
                    },
                    () => {
                      this.preloadResources(
                        'src/App.jsx',
                        resource => {
                          plugin.definitions.__TG_APP_COMPONENT__ = resource
                        },
                        () => {
                          this.preloadResources(
                            'src/App.vue',
                            resource => {
                              plugin.definitions.__TG_APP_COMPONENT__ = resource
                            }
                          )
                        }
                      )
                    }
                  )
                }
              )
            }

            // 预加载 IconFont 文件
            if (!plugin.definitions.__TG_APP_ICON_FONT__) {
              this.preloadResources(
                `src/apps/${appName}/assets/iconfont.js`,
                resource => {
                  this.log(`图标文件（src/apps/${appName}/assets/iconfont.js）`)
                  plugin.definitions.__TG_APP_ICON_FONT__ = resource
                },
                () => {
                  this.preloadResources(
                    'src/assets/iconfont.js',
                    resource => plugin.definitions.__TG_APP_ICON_FONT__ = resource
                  )
                }
              )
            }

            /**
             * 预加载 echarts.min.js。
             * - 生产环境推荐使用定制的 echarts.min.js 文件，定制地址：https://echarts.apache.org/zh/builder.html。
             * - 非生产环境先尝试寻找 echarts.min.js，如果不存在则直接引用 node_modules 下的 echarts 包。
             */
            if (!plugin.definitions.__TG_APP_CUSTOMIZE_PROD_TINY_ECHARTS__) {
              // let isExistCustomizeProdTinyEcharts = false

              this.preloadResources(
                `src/apps/${appName}/assets/echarts.min.js`,
                resource => {
                  this.log(`定制 eCharts（src/apps/${appName}/assets/echarts.min.js）`)
                  // isExistCustomizeProdTinyEcharts = true
                  plugin.definitions.__TG_APP_CUSTOMIZE_PROD_TINY_ECHARTS__ = resource
                },
                () => {
                  plugin.definitions.__TG_APP_CUSTOMIZE_PROD_TINY_ECHARTS__ = resolve(join(
                    __dirname,
                    '../..',
                    'node_modules/echarts'
                  ))
                }
              )
            }
          }
        }
      }
    })
  }
}

module.exports = GlobalVariableInjectionPlugin
