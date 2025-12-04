const removeScreenMedia = require('./scripts/plugins/postcss/RemoveScreenMedia')

module.exports = module.exports = ({ env }) => {
  // 获取 Webpack 插件注入的配置
  const configJson = process.env.TG_APP_EXTRACT_MEDIA_QUERIES_CONFIG || '{}'
  const mediaQueryConfig = JSON.parse(configJson)

  const plugins = [require('autoprefixer')]

  // 动态添加媒体查询处理插件
  if (mediaQueryConfig && Object.keys(mediaQueryConfig).length > 0) {
    plugins.push(
      removeScreenMedia({
        ...mediaQueryConfig,
        logRemoved: process.env.NODE_ENV === 'development'
      })
    )
  }

  return { plugins }
}
