const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const inquirer = require('inquirer')
const { readdirSync, statSync } = require('node:fs')
const args = require('minimist')(process.argv.slice(2))
const { resolve, join } = require('node:path')
const AppNameInjectionPlugin = require('./plugins/AppNameInjectionPlugin')
const { merge } = require('lodash')
const chalk = require('chalk')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const appNames = readdirSync(resolve(join(__dirname, `../src/apps`)))
  .filter(file => statSync(resolve(join(__dirname, '../src/apps', file))).isDirectory())

let appName = null
const { NODE_ENV, BASE_ENV } = process.env
const ENV_TEXT = NODE_ENV === 'development' ? '启动' : '编译'

// 检测命令行是否传递了项目名称或项目简称，且是否存在。例如：--app=project-name 或者 --app project-name
if (args.app) {
  for (const _appName of appNames) {
    let abbreviation = null

    if (_appName.includes('-')) {
      abbreviation = _appName.split('-').map(item => item.charAt(0).toUpperCase()).join('')
    }

    if ([abbreviation, _appName].includes(args.app)) {
      appName = _appName

      break
    }
  }
}

if (appName) {
  getConfig(appName)
} else {
  // 定义项目选项
  const options = appNames.map(item => ({ name: item, value: item }))

  // 使用 inquirer 创建菜单
  inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: `请选择要${ENV_TEXT}的项目名称：`,
      choices: options
    }
  ]).then(answers => {
    getConfig(answers.choice)
  })
}

function getConfig(appName) {
  // 扩展环境变量
  try {
    const env = dotenv.config({
      path: resolve(join(__dirname, `../src/apps/${appName}/configs/.env.${BASE_ENV}`))
    })

    env.parsed['TG_APP_NAME'] = appName
    dotenvExpand.expand(env)
  } catch (err) {
    if (err.toString().indexOf('ENOENT') < 0) {
      console.error(err)
    }

    process.exit(0)
  }

  let config

  // 现在可以继续执行Webpack编译过程
  if (NODE_ENV === 'development') {
    config = require('./webpack.dev.conf')
  } else if (NODE_ENV === 'production' && BASE_ENV === 'analysis') {
    config = require('./webpack.analy.conf')
  } else {
    config = require('./webpack.prod.conf')
  }

  const ignoreApp = []

  appNames.forEach(_appName => {
    if (appName !== _appName) {
      ignoreApp.push(_appName)
    }
  })

  // 新增 IgnorePlugin，过滤掉`/apps`下其他子项目的文件
  config.plugins.push(new webpack.IgnorePlugin({
    checkResource(resource, context) {
      if (
        resource.includes('@app') &&
        ignoreApp.some(app => context.match(new RegExp(`src[/\\\\]apps[/\\\\]${app}`)))
      ) {
        return true
      }

      if (ignoreApp.some(app => resource.match(new RegExp(`[/\\\\]${app}[/\\\\]`)))) {
        return true
      }

      // 排除子项目的 .md 和 .ico 资源
      return /\.(md|ico)$/.test(resource)
    }
  }))

  // 调用注入 appName 的插件
  config.plugins.unshift(new AppNameInjectionPlugin({ appName }))

  // 复制 public 内静态文件
  config.plugins.push(new CopyWebpackPlugin({
    patterns: [
      {
        force: true,
        from: resolve(join(__dirname, `../src/apps/${appName}/public`)),
        to: resolve(join(__dirname, '../dist', appName))
      }
    ]
  }))

  const compiler = webpack(config)

  if (NODE_ENV === 'development') {
    try {
      const devServer = require(resolve(join(__dirname, `../src/apps/${appName}/configs/devServer.js`)))
      const devServerOptions = merge(config.devServer, devServer)
      const server = new WebpackDevServer(devServerOptions, compiler)

      console.log(
        chalk.hex('#1fb0ff')('编译信息：') +
        chalk.gray(`检测到 Dev Server 配置文件（src/apps/${appName}/configs/devServer.js），已成功加载。`)
      )

      const runServer = async () => {
        await server.start()
      }

      runServer()
    } catch (err) {
      /** */
      console.error(err.toString())
    }
  } else {
    compiler.run((err, stats) => {
      if (err) {
        console.error('Error during Webpack build:', err)
        return
      }

      console.log('Webpack build completed.')

      // 打印构建统计信息
      console.log(stats.toString())
    })
  }
}
