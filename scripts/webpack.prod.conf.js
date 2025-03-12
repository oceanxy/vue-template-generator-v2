const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.conf.js')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const globAll = require('glob-all')

const TG_APP_NAME = process.env.TG_APP_NAME

module.exports = merge(baseConfig, {
  mode: 'production', // 生产模式，会开启tree-shaking和压缩代码，以及其他优化

  optimization: {
    minimizer: [
      // 抽离css插件
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css'
      }),
      // 压缩css
      new CssMinimizerPlugin({
        parallel: true,      // 启用多进程
        minimizerOptions: {
          preset: ['default', { discardComments: { removeAll: true } }]
        }
      }),
      // 压缩js
      new TerserPlugin({
        parallel: true, // 开启多线程压缩
        terserOptions: {
          compress: {
            pure_funcs: [
              'console.log' // 删除console.log
            ]
          }
        }
      }),
      // 清理无用css
      new PurgeCSSPlugin({
        // 检测src下所有vue文件和public下index.html中使用的类名和id和标签名称
        // 只打包这些文件中用到的样式
        paths: globAll.sync([
          `${path.join(__dirname, '../src')}/**/*.vue`,
          path.join(__dirname, '../public/index.html')
        ]),
        safelist: {
          standard: [/^ant-/] // 过滤以ant-开头的类名，即使没用到也不删除
        }
      }),
      new CompressionPlugin({
        test: /.(js|css)$/, // 只生成css,js压缩文件
        filename: '[path][base].gz', // 文件命名
        algorithm: 'gzip', // 压缩格式,默认是gzip
        threshold: 10240, // 只有大小大于该值的资源会被处理。默认值是 10k
        minRatio: 0.8 // 压缩率,默认值是 0.8
      })
    ],
    splitChunks: { // 分隔代码
      cacheGroups: {
        vendors: { // 提取node_modules代码
          test: /node_modules/, // 只匹配node_modules里面的模块
          name: 'vendors', // 提取文件命名为vendors,js后缀和chunkhash会自动加
          minChunks: 1, // 只要使用一次就提取出来
          chunks: 'initial', // 只提取初始化就能获取到的模块,不管异步的
          minSize: 0, // 提取代码体积大于0就提取出来
          priority: 1 // 提取优先级为1
        },
        commons: { // 提取页面公共代码
          name: 'commons', // 提取文件命名为commons
          minChunks: 2, // 只要使用两次就提取出来
          chunks: 'initial', // 只提取初始化就能获取到的模块,不管异步的
          minSize: 0 // 提取代码体积大于0就提取出来
        }
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css' // 抽离css的输出目录和名称
    })
  ],
  cache: {
    type: 'filesystem', // 使用文件缓存
    name: `${TG_APP_NAME}-prod-cache`, // 缓存名称（按子项目）
    cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/webpack', TG_APP_NAME), // 自定义缓存路径
    // 自动失效策略（关键配置）
    buildDependencies: {
      config: [__filename], // 当 webpack 配置文件变更时自动失效缓存
      package: [path.resolve(__dirname, '../package.json')] // 当依赖变更时自动失效
    },
    // 缓存版本控制
    version: require('../package.json').version // 当项目版本变更时自动失效
  }
})
