const { ProvidePlugin, DefinePlugin } = require('webpack')
const { resolve, join } = require('path')
const BasePlugin = require('./BasePlugin')

class GlobalVariableInjectionPlugin extends BasePlugin {
  constructor() {
    super({ appName: '' })
  }

  // 查找所有DefinePlugin插件中，是否存在指定变量
  checkDefinePlugin(compilation, key) {
    const definePlugins = compilation.options.plugins?.filter(plugin => plugin instanceof DefinePlugin) ?? []

    for (const plugin of definePlugins) {
      if (key in plugin.definitions) {
        return true
      }
    }

    return false
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('GlobalVariableInjectionPlugin', compilation => {
      if (compilation.options.plugins) {
        this.appName = compiler.options.appName

        // 修改现有插件的配置
        const existingPlugins = compilation.options.plugins

        // 修改 ProvidePlugin 插件的参数
        for (const plugin of existingPlugins) {
          if (plugin instanceof ProvidePlugin) {
            // 预加载配置文件
            if (!plugin.definitions.__TG_APP_CONFIG__) {
              this.preloadResources(
                `src/apps/${this.appName}/configs/index.js`,
                resource => {
                  this.log(`配置文件（src/apps/${this.appName}/configs/index.js）`)
                  plugin.definitions.__TG_APP_CONFIG__ = resource

                  const version = require(resource).version
                  version && this.tips(`当前编译的项目版本（v${version}）`)
                }
              )
            }

            // 预加载接口映射器
            if (!plugin.definitions.__TG_APP_INTERFACE_MAPPINGS__) {
              this.preloadResources(
                `src/apps/${this.appName}/configs/interfaceMappings.js`,
                resource => {
                  this.log(`接口映射文件（src/apps/${this.appName}/configs/interfaceMappings.js）`)
                  plugin.definitions.__TG_APP_INTERFACE_MAPPINGS__ = resource
                }, () => {
                  if (!this.checkDefinePlugin(compilation, '__TG_APP_INTERFACE_MAPPINGS__')) {
                    const _plugin = existingPlugins.find(plugin => plugin instanceof DefinePlugin)

                    if (_plugin) {
                      _plugin.definitions.__TG_APP_INTERFACE_MAPPINGS__ = undefined
                    }
                  }
                }
              )
            }

            // 预加载用户信息和菜单信息映射器
            if (!plugin.definitions.__TG_APP_USER_INFO_MAPPINGS__) {
              this.preloadResources(
                `src/apps/${this.appName}/configs/userInfoMappings.js`,
                resource => {
                  this.log(`动态菜单映射文件（src/apps/${this.appName}/configs/userInfoMappings.js）`)
                  plugin.definitions.__TG_APP_USER_INFO_MAPPINGS__ = resource
                }, () => {
                  if (!this.checkDefinePlugin(compilation, '__TG_APP_USER_INFO_MAPPINGS__')) {
                    const _plugin = existingPlugins.find(plugin => plugin instanceof DefinePlugin)

                    if (_plugin) {
                      _plugin.definitions.__TG_APP_USER_INFO_MAPPINGS__ = undefined
                    }
                  }
                }
              )
            }

            // 预加载事件映射器
            if (!plugin.definitions.__TG_APP_EVENT_MAPPINGS__) {
              this.preloadResources(
                `src/apps/${this.appName}/configs/eventMappings.js`,
                resource => {
                  this.log(`动态菜单映射文件（src/apps/${this.appName}/configs/eventMappings.js）`)
                  plugin.definitions.__TG_APP_EVENT_MAPPINGS__ = resource
                }, () => {
                  if (!this.checkDefinePlugin(compilation, '__TG_APP_EVENT_MAPPINGS__')) {
                    const _plugin = existingPlugins.find(plugin => plugin instanceof DefinePlugin)

                    if (_plugin) {
                      _plugin.definitions.__TG_APP_EVENT_MAPPINGS__ = undefined
                    }
                  }
                }
              )
            }

            // 预加载路由文件
            if (!plugin.definitions.__TG_APP_ROUTES__) {
              this.preloadResources(
                `src/apps/${this.appName}/router/index.js`,
                resource => {
                  this.log(`路由文件（src/apps/${this.appName}/router/index.js）`)
                  plugin.definitions.__TG_APP_ROUTES__ = resource
                }
              )
            }

            // 预加载登录组件
            if (!plugin.definitions.__TG_APP_LOGIN_COMPONENT__) {
              this.preloadResources(
                `src/apps/${this.appName}/views/Login/index.jsx`,
                resource => {
                  this.log(`登录组件（src/apps/${this.appName}/views/index.jsx）`)
                  plugin.definitions.__TG_APP_LOGIN_COMPONENT__ = resource
                },
                () => {
                  this.preloadResources(
                    `src/apps/${this.appName}/views/Login/index.vue`,
                    resource => {
                      this.log(`登录组件（src/apps/${this.appName}/views/Login/index.vue）`)
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
                `src/apps/${this.appName}/App.jsx`,
                resource => {
                  this.log(`入口组件（src/apps/${this.appName}/App.jsx）`)
                  plugin.definitions.__TG_APP_COMPONENT__ = resource
                },
                (e) => {
                  this.preloadResources(
                    `src/apps/${this.appName}/App.vue`,
                    resource => {
                      this.log(`入口组件（src/apps/${this.appName}/App.vue）`)
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
                `src/apps/${this.appName}/assets/iconfont.js`,
                resource => {
                  this.log(`图标文件（src/apps/${this.appName}/assets/iconfont.js）`)
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
                `src/apps/${this.appName}/assets/echarts.min.js`,
                resource => {
                  this.log(`定制 eCharts（src/apps/${this.appName}/assets/echarts.min.js）`)
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
