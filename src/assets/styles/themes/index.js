// https://webpack.js.org/guides/dependency-management/#requirecontext

const themeFiles = require.context('./modules', true, /\.js$/)

const modules = themeFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = themeFiles(modulePath)

  modules[moduleName] = value.default
  modules[moduleName].customTheme = value.customTheme

  return modules
}, {})

export default modules
