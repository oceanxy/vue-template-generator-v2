/**
 * @type {import('prettier').Config}
 * @see https://www.prettier.cn/docs/options.html
 */
export default {
  // 注意以下4项会自动使用EditorConfig内的对应配置，所以不需重复配置
  endOfLine: 'lf',
  useTabs: false,
  tabWidth: 2,
  printWidth: 120,
  // 使用分号, 默认true
  semi: false,
  // 使用单引号, 默认false(在jsx中配置无效, 默认都是双引号)
  singleQuote: true,
  // 尾随逗号（包括函数参数）,默认none,可选 none|es5|all
  // es5 包括es5中的数组、对象
  // all 包括函数对象等所有可选
  trailingComma: 'none',
  // 箭头函数参数括号 默认avoid 可选 avoid | always
  arrowParens: 'avoid',
  // 仅在必需时为对象的key添加引号
  quoteProps: 'as-needed',
  // jsx中使用单引号
  jsxSingleQuote: false,
  // 在对象前后添加空格，默认true eg: { foo: bar }
  bracketSpacing: true,
  // JSX多属性标签的‘>’同行放置
  jsxBracketSameLine: false,
  // 无需顶部注释即可格式化
  requirePragma: false,
  // 在已被 prettier 格式化的文件顶部加上标注
  insertPragma: false,
  // 不对vue中的script及style标签缩进
  vueIndentScriptAndStyle: false,
  // 对引用代码进行格式化
  embeddedLanguageFormatting: 'auto',
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // 根据显示样式决定 html 要不要折行
  htmlWhitespaceSensitivity: 'ignore',
  // 不让prettier使用eslint的代码格式进行校验
  eslintIntegration: false,
  // 不让prettier使用stylelint的代码格式进行校验
  stylelintIntegration: false,
  // 代码的解析引擎，默认为babylon，与babel相同
  parser: 'babylon'
}
