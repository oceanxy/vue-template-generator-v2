const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.conf.js')
const ESLintPlugin = require('eslint-webpack-plugin')

const TG_APP_NAME = process.env.TG_APP_NAME

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
  ],
  cache: {
    type: 'filesystem', // 使用文件缓存
    name: `${TG_APP_NAME}-dev-cache`, // 缓存名称（按子项目）
    cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/webpack', TG_APP_NAME), // 自定义缓存路径
    // 自动失效策略（关键配置）
    buildDependencies: {
      config: [__filename], // 当 webpack 配置文件变更时自动失效缓存
      package: [path.resolve(__dirname, '../package.json')] // 当依赖变更时自动失效
    },
    // 缓存版本控制
    version: require('../package.json').dependencies.webpack, // 当 webpack 版本变更时自动失效
    // 允许垃圾回收
    allowCollectingMemory: true,
    // 空闲超时(ms)
    idleTimeout: 10000
  }
})
