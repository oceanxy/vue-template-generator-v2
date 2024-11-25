import './assets/styles/index.scss'
import { nextTick, onMounted, ref, watch } from 'vue'
import Icon from '@ant-design/icons-vue'
import { Menu } from 'ant-design-vue'
import configs from '@/configs'
import router, { useRouter } from '@/router'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'

export default {
  name: 'TGMenu',
  setup() {
    const appName = getFirstLetterOfEachWordOfAppName('shm')
    const openKeys = ref([])
    const selectedKeys = ref([])
    const menuRoutes = ref([])
    const menuScrollTop = ref(0)
    const collapsed = ref(false)
    const menuDomRef = ref()
    const { push } = useRouter()

    watch(router.currentRoute, async route => {
      // 修复通过帐号密码登录，当token过期后重新登录无法跳转到首页的问题
      // 具体原因是 store/login/jumpAfterLogin 函数获取到错误的 selectedKey 而出现跳转异常
      if (route.name !== 'Login' && route.name !== 'NoAccess' && route.name !== 'NotFound') {
        selectedKeys.value = getSelectedKeys(route)
        localStorage.setItem(`${appName}-selectedKey`, route.path)

        await nextTick()

        openKeys.value = selectedKeys.value.toReversed().slice(1) // 排除最后一级（最后一级一般不是可展开的菜单层级）
        localStorage.setItem(`${appName}-openKeys`, JSON.stringify(openKeys.value))
      }
    }, { immediate: true })

    function getActiveSuffixForMenuIcon() {
      return configs.activeSuffixForMenuIcon.replace(
        '{themeName}',
        `-${localStorage.getItem(`${appName}-theme`) || configs.header.buttons.theme.default}`
      )
    }

    function getPopupSubMenuClassName() {
      return `tg-menu-popup ${configs.menuStyle}`
    }

    function addKey(menuRoutes, parent = '/') {
      return menuRoutes.map(route => {
        route.key = `${parent}/${route.path}`.replace('//', '/')

        if (Array.isArray(route.children) && route.children.length) {
          route.children = addKey(route.children, route.key)
        }

        return route
      })
    }

    function getSelectedKeys(currentRoute) {
      const keyPath = []

      // 根据当前进入页面的路由设置菜单的 selectedKeys 和 openKeys 值
      for (let i = 0; i < currentRoute.matched.length; i++) {
        if (currentRoute.matched[i].path !== '') {
          keyPath.push(currentRoute.matched[i].path)
        }
      }

      return keyPath
    }

    async function onMenuClick({ key }) {
      const toPath = key
        // 替换path中所有 '//'
        .replaceAll('//', '/')
        // 替换以 '/' 结尾的 path
        .replace(/(\S+)\/$/, '$1')

      // 检测是否是跳转到本路由
      if (toPath !== router.currentRoute.value.path) {
        await push(toPath)
        menuScrollTop.value = menuDomRef.value.$el.scrollTop

        setTimeout(() => {
          if (router.currentRoute.value.path !== key) {
            selectedKeys.value = getSelectedKeys(router.currentRoute.value)
          }

          document.getElementById('menu')?.scrollTo({
            top: menuScrollTop.value,
            behavior: 'smooth'
          })
        }, 200)
      }
    }

    async function onTitleClick(domEvent, key) {
      /**
       *  ---------------------- Event.path 的兼容处理 ---------------------------
       *  从 chrome v108 升级到 v109 后发现 Event.path 的值为 undefined，
       *  查阅文档发现 Chrome 在最近版本中删除了该属性！！！！
       *  具体信息参考：https://bugs.chromium.org/p/chromium/issues/detail?id=1277431
       */
      let { path } = domEvent

      if (!path) {
        path = domEvent.composedPath()
      }

      // ------------------------------------------------------------------------

      let keyPath = []

      if (key) {
        if (openKeys.value.includes(key)) {
          keyPath = [...openKeys.value]
          keyPath.splice(
            openKeys.value.findIndex(i => i === key),
            1
          )
        } else {
          if (domEvent.currentTarget?.parentNode?.parentNode?.classList?.contains('ant-menu-sub')) {
            keyPath = [key].concat(openKeys.value)
          } else {
            keyPath = [key]
          }
        }
      } else {
        // 获取当前点击的折叠菜单的keyPath
        keyPath = path
          .filter(dom => dom.classList?.contains('ant-menu-submenu'))
          .filter((dom, index) => (!index && !dom.__vue__.$props.isOpen) || (index > 0 && dom.__vue__.$props.isOpen))
          .map(dom => dom.__vue__.$props.eventKey)
          .reverse()
      }

      // 将当前打开的父级菜单存入缓存中
      localStorage.setItem(`${appName}-openKeys`, JSON.stringify(keyPath))

      // 等待菜单打开动画执行完成，在下一次渲染周期执行
      // 将当前菜单的pathKey赋值给openKeys，以实现只打开一个折叠菜单的功能
      await nextTick()

      openKeys.value = keyPath
    }

    function getIcon(route) {
      return (
        <IconFont
          type={
            route.meta.icon + (
              selectedKeys.value.includes(route.key)
                ? getActiveSuffixForMenuIcon()
                : ''
            )
          }
        />
      )
    }

    function getMenuItem(routes) {
      const _menuRoutes = routes || menuRoutes.value

      return _menuRoutes.map(route => {
        if (!route.meta.hideChildren && route.children?.length) {
          return (
            <Menu.SubMenu
              title={route.meta.title}
              key={route.key}
              popupClassName={getPopupSubMenuClassName()}
              onTitleClick={onTitleClick}
              icon={getIcon(route)}
            >
              {getMenuItem(route.children)}
            </Menu.SubMenu>
          )
        }

        return (
          <Menu.Item
            key={route.key}
            style={route.meta.hide ? { display: 'none' } : ''}
          >
            {getMenuItemTitle(route)}
          </Menu.Item>
        )
      })
    }

    function getMenuItemTitle(route) {
      return (
        <div class="ant-menu-item-title">
          {
            route.meta.icon
              ? (
                typeof route.meta.icon !== 'string'
                  ? (
                    <Icon theme={'filled'}>
                      {{ component: () => <span>{route.meta.icon}</span> }}
                    </Icon>
                  )
                  : getIcon(route)
              )
              : null
          }
          <span>{route.meta && route.meta.title}</span>
        </div>
      )
    }

    onMounted(() => {
      // 从缓存中取出openKeys，设置到菜单中
      const _openKeys = localStorage.getItem(`${appName}-openKeys`)

      if (_openKeys) {
        openKeys.value = JSON.parse(_openKeys)
      }

      menuRoutes.value = addKey(router.getRoutes().find(route => route.path === '/').children)
    })

    return () => (
      <Menu
        id={'menu'}
        ref={menuDomRef}
        mode="inline"
        inlineIndent={18}
        class={['tg-menu-container', configs.menuStyle]}
        openKeys={openKeys.value}
        selectedKeys={selectedKeys.value}
        inlineCollapsed={collapsed.value}
        onClick={onMenuClick}
      >
        {getMenuItem()}
      </Menu>
    )
  }
}
