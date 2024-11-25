const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.conf.js')
const ESLintPlugin = require('eslint-webpack-plugin')

// 合并公共配置,并添加开发环境配置
module.exports = merge(baseConfig, {
  mode: 'development', // 开发模式，打包更加快速，省了代码优化步骤
  devtool: 'eval-cheap-module-source-map', // 源码调试模式
  // 注意此处的配置仅为默认值，会被子项目的配置覆盖，如需修改，请到子项目的 configs/devServer.js 文件中修改
  devServer: {
    port: 3000, // 服务端口号
    compress: false, // gzip压缩，开发环境不开启，提升热更新速度
    hot: true, // 开启热更新，后面会讲vue3模块热替换具体配置
    historyApiFallback: true, // 解决history路由404问题
    static: {
      directory: path.join(__dirname, '../public') // 托管静态资源public文件夹
    }
  },
  plugins: [
    new ESLintPlugin({
      context: path.resolve(__dirname, 'src'),
      extensions: ['js', 'vue', 'jsx'], // 指定要检查的文件类型
      fix: true, // 启用自动修复功能
      cache: true, // 启用缓存，提高检查性能
      failOnError: true // 如果有错误则使构建失败
    })
  ]
})
