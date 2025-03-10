const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin, ProvidePlugin } = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const GlobalVariableInjectionPlugin = require('./plugins/GlobalVariableInjectionPlugin')
const CopyPlugin = require('copy-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development' // 是否是开发模式

/**
 * 获取符合前缀规则的环境变量对象
 */
const resolveClientEnv = () => {
  const env = {}

  Object.keys(process.env).forEach((key) => {
    if (/^TG_APP_/.test(key) || key === 'NODE_ENV' || key === 'BASE_ENV') {
      env[key] = JSON.stringify(process.env[key])
    }
  })

  return env
}

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, '../src/main.js'),
  output: {
    filename: 'static/js/[name].[chunkhash:8].js', // 每个输出js的名称
    path: path.join(__dirname, '../dist'), // 打包结果输出路径
    clean: true, // webpack4需要配置clean-webpack-plugin来删除dist文件,webpack5内置了
    publicPath: '/' // 打包后文件的公共前缀路径
  },
  resolve: {
    extensions: ['.vue', '.js', '.jsx', '.json'],
    fallback: { 'process/browser': require.resolve('process/browser') },
    alias: {
      '@': path.join(__dirname, '../src'),
      'process': 'process/browser'
    },
    // 如果用的是 pnpm 就暂时不要配置这个，会有幽灵依赖的问题，访问不到很多模块。
    modules: [path.resolve(__dirname, '../node_modules')] // 查找第三方模块只在本项目的node_modules中查找
  },
  module: {
    rules: [
      {
        test: /\.css$/, // 匹配 css 文件
        include: [path.resolve(__dirname, '../node_modules/ant-design-vue/dist'), path.resolve(__dirname, '../src')],
        use: [
          // 开发环境使用style-loader，打包模式抽离css
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/, // 匹配所有的 scss 文件
        include: path.resolve(__dirname, '../src'),
        use: [
          // 开发环境使用style-loader，打包模式抽离css
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.vue$/, // 匹配.vue文件
        include: path.resolve(__dirname, '../src'), // 只对项目src文件的vue进行loader解析
        use: ['thread-loader', 'vue-loader'] // thread-loader启用多线程loader解析 用vue-loader去解析vue文件
      },
      {
        test: /.js(x)$/,
        include: path.resolve(__dirname, '../src'), // 只对项目src文件的ts进行loader解析,
        use: ['thread-loader', 'babel-loader']
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [new RegExp(path.resolve(__dirname, '../src', '.*', 'svgComp', '.*.svg').replace(/\\/g, '\\\\'))],
        options: { symbolId: 'tg-icon-[name]' }
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/, // 匹配图片文件
        type: 'asset', // type选择asset
        exclude: [new RegExp(path.resolve(__dirname, '../src', '.*', 'svgComp', '.*.svg').replace(/\\/g, '\\\\'))], // 排除src/**/svgComp/*.svg路径的SVG文件
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 小于10kb转base64位
          }
        },
        generator: {
          filename: 'static/images/[name].[contenthash:8][ext]' // 文件输出目录和命名
        }
      },
      {
        test: /.(woff2?|eot|ttf|otf)$/, // 匹配字体图标文件
        type: 'asset', // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 小于10kb转base64位
          }
        },
        generator: {
          filename: 'static/fonts/[name].[contenthash:8][ext]' // 文件输出目录和命名
        }
      },
      {
        test: /.(mp4|webm|ogg|mp3|wav|flac|aac)$/, // 匹配媒体文件
        type: 'asset', // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 小于10kb转base64位
          }
        },
        generator: {
          filename: 'static/media/[name].[contenthash:8][ext]' // 文件输出目录和命名
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(), // vue-loader插件
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'), // 模板取定义root节点的模板
      inject: true // 自动注入静态资源
    }),
    new DefinePlugin({
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      'process.env': resolveClientEnv()
    }),
    new ProvidePlugin({
      process: 'process/browser'
    }),
    // 复制文件插件
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'), // 复制public下文件
          to: path.resolve(__dirname, '../dist'), // 复制到dist目录中
          filter: source => {
            return !source.includes('index.html') // 忽略index.html
          }
        }
      ]
    }),
    // 注意：根据 webpack 插件调用机制，此内部插件必须在 DefinePlugin 和 ProvidePlugin 插件之后调用
    new GlobalVariableInjectionPlugin()
  ],
  cache: {
    type: 'filesystem' // 使用文件缓存
  }
}
