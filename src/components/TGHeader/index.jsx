import './styles/index.scss'
import { computed, inject, ref } from 'vue'
import { Avatar, Divider, Dropdown, Layout, Menu, Space, Spin, theme } from 'ant-design-vue'
import TGLogo from '@/components/TGLogo'
import { useRouter } from '@/router'
import useStore from '@/composables/tgStore'

export default {
  name: 'TGLayoutHeader',
  setup(props) {
    const activeKey = ref(1)
    const { push, replace } = useRouter()
    const commonStore = useStore('/common')
    const loginStore = useStore('/login')
    const collapsed = computed(() => commonStore.collapsed)
    const showMenu = computed(() => commonStore.showMenu)
    const loading = computed(() => commonStore.loading)
    const userInfo = computed(() => commonStore.userInfo)
    const avatarForLetter = computed(() => {
      const name = userInfo.value.nickName || userInfo.value.fullName

      return name ? name.at(-1).toUpperCase() : ''
    })
    const { useToken } = theme
    const { token } = useToken()
    const { header } = inject('customTheme')

    /**
     * 注销
     * @returns {Promise<void>}
     */
    async function onLogOutClick() {
      const response = await loginStore.logout()

      if (response.status) {
        await replace({
          name: 'Login',
          // 提供给子项目的登录页面处理注销后的逻辑
          params: { logout: '1' }
        })
      }
    }

    /**
     *
     * @param activeKey
     */
    function handleChange(activeKey) {
      this.activeKey = activeKey
    }

    /**
     *
     * @param id
     * @param targetAddress
     * @returns {Promise<void>}
     */
    async function onClick({ id, targetAddress }) {
      if (targetAddress) {
        const split = targetAddress.split('?')
        const path = this.$router.resolve({ name: split[0] }).href
        const paramArr = split[1].split('&')

        const query = paramArr.reduce((params, str) => {
          const p = str.split('=')

          return { ...params, [p[0]]: p[1] }
        }, {})

        await this.$store.dispatch('custom', {
          payload: { ids: id },
          customApiName: 'setMessageToRead'
        })

        await push({ path, query })
      }
    }

    /**
     * 去登录
     * @returns {Promise<void>}
     */
    async function toLogin() {
      await push({
        name: 'Login',
        query: { redirect: this.$route.path }
      })
    }

    function resetPwd() {}

    return () => (
      <Layout.Header
        class={'tg-layout-header'}
        style={{
          background: header.colorPrimaryBg,
          color: header.colorPrimary,
          fontSize: token.value.fontSizeLG
        }}
      >
        <TGLogo style={`font-size: ${token.value.fontSizeLG}px`} />
        <Space class={'tg-layout-header-content'}>
          {
            showMenu.value && (
              <IconFont
                type={'icon-global-sq'}
                class={`tg-layout-header-menu-btn menu-btn-fold${collapsed.value ? ' reverse' : ''}`}
                onClick={commonStore.setCollapsed}
                title={!collapsed.value ? '折叠菜单' : '展开菜单'}
              />
            )
          }
          {/*<div class={'tg-layout-header-search'}>*/}
          {/*  <Input placeholder={'搜功能'} class={'tg-search-input'}>*/}
          {/*    <IconFont type={'icon-global-search'} slot={'addonAfter'} />*/}
          {/*  </Input>*/}
          {/*</div>*/}
          <div class={'tg-header-info'}>
            <Dropdown overlayClassName={'tg-header-user-overlay'} arrow={{ pointAtCenter: true }}>
              {{
                default: () => (
                  <div class={'tg-header-user-content'}>
                    <Spin
                      spinning={loading.value}
                      wrapperClassName={`tg-header-user-spin-content${loading.value ? ' blur' : ''}`}
                    >
                      <Avatar shape={'circle'} style={{ backgroundColor: header.colorBgAvatar }}>
                        {avatarForLetter.value}
                      </Avatar>
                      <div class={'tg-user-info'}>
                        <div class={'tg-header-username'} style={`font-size: ${token.value.fontSizeLG}px`}>
                          {userInfo.value.nickName || userInfo.value.fullName || '暂无用户名'}
                        </div>
                        <div class={'tg-header-tel'} style={{ color: header.colorTextSecondary }}>
                          {userInfo.value.loginName}
                        </div>
                      </div>
                      <IconFont type={'icon-global-down'} style={{ color: '#ffffff' }} />
                    </Spin>
                  </div>
                ),
                overlay: () => (
                  <Menu>
                    <Menu.Item key={'1'} onClick={resetPwd}>
                      重置密码
                    </Menu.Item>
                    <Menu.Item key={'2'} onClick={onLogOutClick}>
                      注销
                    </Menu.Item>
                  </Menu>
                )
              }}
            </Dropdown>
            <Divider
              type={'vertical'}
              class={'tg-header-divider'}
              style={{ background: header.colorTextSecondary }}
            />
          </div>
        </Space>
      </Layout.Header>
    )
  }
}
