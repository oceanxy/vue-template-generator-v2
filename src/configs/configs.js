/**
 * 该配置文件作为基准配置的默认值，所有子项目的配置文件都是基于这个文件做配置合并。
 */

module.exports = {
  // 打包后生成压缩包的名称（默认为子项目仓库名）
  zipName: '',
  // 要使用的布局组件名，位于 src/layouts。默认 TGBackendSystem 组件，后台管理系统。
  layout: 'TGBackendSystem',
  // mock数据开关。开发模式下生效
  mock: false,
  // 接口请求超时时间，默认30秒
  timeout: 30000,
  // mock请求延迟时间，默认0.4秒
  mockDelay: 400,
  // 路由模式：hash 或者 history 模式，本框架默认 history 模式
  routeMode: 'history',
  // 动态路由（从后台获取权限菜单）
  dynamicRouting: false,
  // 按钮级权限， 默认false。此功能需配合 src/components/TGPermissionsButton 组件使用。
  buttonPermissions: false,
  // 默认跳转的页面路由名称（route.name），默认null，即进入根路由（“/”）指定的页面。（如果启用了动态路由，则为登录后系统跳转的页面路由名称，优先以后台设置的数据为准）
  defaultRouteName: null,
  // 根路由（"/"）的访问权限。默认true，代表根路由需要权限才能访问。注意当后端返回的菜单数据中包含了根路由时，根路由的访问权限以后端返回的为准。
  homePermissions: true,
  // VUE 的 KeepAlive 组件最大缓存数量，当缓存的数量超过该值时，会优先清空最久未被激活的页面，默认值：3
  keepAliveMaxCount: 3,
  // iconfont在线图标链接，请从 https://www.iconfont.cn/ 获取。
  // 为空时将按照优先级从大到小自动调用本地文件：src/apps/{appName}/assets/iconfont.js 或 src/assets/iconfont.js
  iconFontSymbol: '',
  /**
   * iconfont菜单图标在 active 状态下的后缀。该后缀会直接加到iconfont图标名称的最后，需在iconfont中预先定义好该图标；
   * - 如果留空则自动根据主题色填充该图标在active状态下的颜色；
   * - 可根据主题色动态设置选中态的图标，'{themeName}'为当前主题色占位符；
   *   例如：'{themeName}-active'
   */
  activeSuffixForMenuIcon: '-active',
  // 是否启用登录验证码功能
  enableLoginVerification: true,
  // 是否隐藏面包屑
  hideBreadCrumb: false,
  // 启用标签页
  enableTabPage: false,
  // 面包屑分隔符，如：首页 / 首页
  breadCrumbSeparator: '/',
  // 文件上传地址
  uploadPath: {
    common: '',
    file: '',
    image: '',
    video: ''
  },
  // 系统名称
  systemName: '后台管理系统快速启动模板',
  systemNameEn: 'vue-template-generator',
  /**
   * 菜单样式配置，可选值：
   * - bordered 边框线 默认边框显示
   * - background 背景颜色
   */
  menuStyle: 'bordered',
  // 页面筛选树配置（如果存在筛选树）
  siderTree: {
    // 是否显示筛选树折叠按钮，当不显示该按钮时，可以通过 store.state.common.treeCollapsed 自定义展开/折叠逻辑。
    showTrigger: true,
    /**
     * 折叠按钮位置。可选值：
     * - inInquiry 在搜索栏内展示，默认
     * - hasTree 在树的右侧展示
     */
    togglePosition: 'inInquiry'
  },
  // HEADER 相关设置
  header: {
    // HTTP Request HEADER 内传递的额外参数配置
    params: {
      // 是否需要在 HTTP Request HEADER 内携带额外参数。启用时会自动在 TGHeader 组件内注入一个下拉选择列表，作为选取额外参数的入口。
      // 注意：本框架会始终在 HTTP Request HEADER 中携带 token 字段，不受此处配置影响。
      show: false,
      // 下拉列表的占位符提示语
      placeholder: '请选择',
      // 需要在 HTTP Request HEADER 内携带额外参数的名称，其值为下拉列表选取的值
      fieldName: ''
    },
    // TGHeader 组件内右上角功能区的按钮配置
    buttons: {
      // 重置密码
      resetPwd: {
        // 是否显示修改密码按钮，默认 false。此功能需要配合 src/extend 和子项目的 extend 使用
        show: false,
        // 按钮文本，默认“重置密码”
        text: '重置密码'
      },
      // 消息（暂未实现）
      news: {
        // 是否显示消息通知按钮，默认 false。
        show: false,
        // 按钮文本，默认“消息”
        text: '消息'
      },
      // 注销
      logout: {
        // 是否显示消息通知按钮，默认 true。
        show: true,
        // 按钮文本，默认“退出登录”
        text: '退出登录'
      },
      // 网站指引（暂未实现）
      guide: {
        // 是否显示网站指引，默认 false。
        show: false,
        // 按钮文本，默认“网站指引”
        text: '网站指引'
      },
      // 主题
      theme: {
        // 是否显示切换主题按钮，默认 true。
        show: true,
        // 按钮文本，默认“切换主题”
        text: '切换主题',
        // 默认主题文件名
        default: 'tech-blue',
        // 可用的主题文件 （位于 @/assets/styles/theme）
        availableThemes: [
          { name: '科技蓝', fileName: 'tech-blue' }
        ]
      },
      algorithm: {
        show: true,

      },
      fontSize: {
        show: true,
        text: '全局文字配置'
      },
      /**
       * 自定义按钮对象
       * @global
       * @typedef HeaderExtarButtons
       * @property {string} text - 按钮显示文本
       * @property {string} icon - 按钮图标名称
       * @property {string} iconType - icon 图标来源
       * - font：来自项目加载的 iconfont 文件
       * - antd：来自 ant-design-vue 的内置图标
       * @property {string} event - eventHandlerName（按钮事件处理函数名称）。
       *  此配置中的所有事件 handler 需要在该子项目中定义映射文件：config/eventMapping.js，
       *  该文件采用 CommonJS 模块规范编写。例如：
       *
       *  ```
       *    module.exports = {
       *      [eventHandlerName]: function() {
       *        // 在这里处理对应按钮的事件
       *      }
       *    }
       *  ```
       */
      /**
       * 需要显示的额外按钮
       * @type HeaderExtarButtons[]
       */
      extraButtons: []
    }
  },
  // 登录令牌相关设置
  tokenConfig: {
    // 是否额外在接口的请求url中拼接token（为了适配一些奇葩第三方在 POST 方式的 URL 中携带 token 的要求）
    isInUrl: false,
    // 从其他渠道获取登录令牌的字段，它们通常保存于 URL/cookie/localStorage/sessionStorage 等地方。
    fieldName: 'token',
    // TOKEN鉴权超时时间，单位：毫秒
    timeout: 10000
  },
  /**
   * 生产环境(process.env.NODE_ENV === 'production')是否可配置环境变量，注意：
   * - 该配置开发环境下无效。
   * - 该配置生产环境下运行时有效，编译时无效。
   * @global
   * @typedef ProdEnvVar
   * @property {boolean} configurable - 打包后是否生成一个配置文件，该文件位于打包目录的根路径下（一般是`dist/`）。
   * 注意：该配置值为`true`时，
   * - 会将`loadFiles`中使用到的环境变量同步生成到打包后的配置文件中，不管`prodEnvVar.envVars`中是否配置了该环境变量。
   * - 获取环境变量的方式为`utils/env.js`内的`getEnvVar`方法，该方法可传递一个参数`envName`，默认为`BASE_ENV`。
   *
   * @property {string[]} envVars - 需要同步到打包后的配置文件中的环境变量名，`prodEnvVar.configurable`值为`true`时生效。默认值/固定值（不需要手动配置）：
   * - `BASE_ENV`：生产环境不同阶段的变量。
   * - `loadFiles`中使用到的环境变量。
   *
   * 注意并不是所有配置的环境变量都会生效，注意区分运行时环境变量（生效）和编译时环境变量（不生效）。比如：
   *
   * - `webpack`打包需要的公共资源路径（`TG_APP_PUBLIC_PATH`）属于编译时环境变量，所以不会生效。
   * - 网关地址前缀/接口地址前缀（`TG_APP_BASE_API`）属于运行时环境变量，所以会生效。
   *
   * @property {string} filename - 打包后生成的配置文件的名称，默认`.env.production`，注意：文件名命名规范及其内容请遵循 dotenv 规则。
   * 文件内用于保存网关地址的字段名同环境变量文件（`.env.*`）中的网关字段名
   */
  /**
   * 生产环境是否可配置环境变量
   * @type ProdEnvVar
   */
  prodEnvVar: {
    configurable: false,
    envVars: [],
    filename: '.env.production'
  },
  /**
   * 要加载的第三方文件信息
   * @global
   * @typedef LoadFiles
   * @property {string} host - 资源文件的默认host，也可使用 '{环境变量}' 的方式加载指定的环境变量的值
   * @property {string} filePath - 文件地址
   * @property {string} filename - 文件备注
   */
  /**
   * 加载第三方文件集合
   * @type LoadFiles[]
   */
  loadFiles: [],
  // 生产模式下是否抽离网关地址（接口地址）成单独的配置文件，位于打包后的根目录（通常是 dist/）下的 env.production.json 文件。
  configurableGateways: false,
  // 全局消息最大显示个数
  maxMessageCount: 1,
  // 是开启水印 在需要加水印APP项目的app.jsx文件混淆全局的watermark
  isWatermark: false,
  // 账号密码加密key
  publicKey: ''
}
