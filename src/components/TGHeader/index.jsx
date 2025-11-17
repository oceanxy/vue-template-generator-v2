import { computed, getCurrentInstance, onUnmounted, ref } from 'vue'
import { Avatar, Button, Checkbox, Divider, Dropdown, Layout, Menu, Popover, Radio, RadioGroup, Slider, Space, Spin, Switch, theme } from 'ant-design-vue'
import TGLogo from '@/components/TGLogo'
import { useRouter } from '@/router'
import useStore from '@/composables/tgStore'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import configs from '@/configs'
import useThemeVars from '@/composables/themeVars'
import { COMPONENT_SIZE } from '@/configs/enums'
import { getScreenInfo } from '@/stores/modules/common'
import { LoadingOutlined } from '@ant-design/icons-vue'
import './assets/images/svgComp/moon.svg'
import './assets/images/svgComp/sun.svg'
import './assets/styles/index.scss'

export default {
  name: 'TGLayoutHeader',
  setup() {
    let instance
    const { proxy } = getCurrentInstance()
    const appName = getFirstLetterOfEachWordOfAppName()
    const activeKey = ref(1)
    const { push } = useRouter()
    const commonStore = useStore('/common')
    const loginStore = useStore('/login')
    const { adjustHexBrightness } = useThemeVars()
    const collapsed = computed(() => commonStore.collapsed)
    const showMenu = computed(() => commonStore.showMenu)
    const loading = computed(() => loginStore.loading)
    const userInfo = computed(() => loginStore.details.userInfo || {})
    const fontSize = computed({
      get: () => commonStore.fontSize,
      set: val => commonStore.fontSize = val
    })
    const avatarForLetter = computed(() => {
      const name = userInfo.value.nickName || userInfo.value.fullName

      return name ? name.at(-1).toUpperCase() : ''
    })

    const { useToken } = theme
    const { token: themeToken } = useToken()
    const headerTheme = computed(() => {
      return commonStore.algorithm === 'defaultAlgorithm'
        ? {
          background: adjustHexBrightness(themeToken.value.colorPrimary, -10),
          color: themeToken.value.colorWhite,
          fontSize: themeToken.value.fontSizeLG
        }
        : {
          background: adjustHexBrightness(themeToken.value.colorPrimary, -80),
          color: themeToken.value.colorWhite,
          fontSize: themeToken.value.fontSizeLG
        }
    })

    const currentThemeName = ref(
      localStorage.getItem(`${appName}-theme`) ||
      loginStore?.userInfo?.themeFileName ||
      configs.header?.buttons?.theme.default
    )

    const BodyFunctions = proxy.headerBodyFunctions
    const GlobalFunctions = proxy.globalFunctions
    const UserFunctions = proxy.userFunctions

    onUnmounted(() => {
      instance?.unmount?.()
    })

    /**
     * 注销
     * @returns {Promise<void>}
     */
    async function onLogOutClick() {
      await loginStore.logout()
    }

    /**
     *
     * @param activeKey
     */
    function handleChange(activeKey) {
      this.activeKey = activeKey
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

    async function updateAlgorithm(algorithm, isCompactAlgorithm) {
      await updateThemeConfig({
        algorithm,
        isCompactAlgorithm: isCompactAlgorithm ? 1 : 0
      })

      commonStore.algorithm = algorithm
      commonStore.isCompactAlgorithm = isCompactAlgorithm
    }

    async function resetFontSize() {
      const screenInfo = getScreenInfo()

      await updateThemeConfig({
        componentSize: screenInfo.componentSize,
        fontSize: screenInfo.fontSize
      })

      commonStore.componentSize = screenInfo.componentSize
      commonStore.fontSize = screenInfo.fontSize
    }

    async function updateFontSize(val) {
      await updateThemeConfig({ fontSize: val })
      commonStore.fontSize = val
    }

    async function updateComponentSize(val) {
      await updateThemeConfig({ componentSize: val.target.value })
      commonStore.componentSize = val.target.value
    }

    async function switchThemes(themeFileName) {
      await updateThemeConfig({ themeFileName })

      currentThemeName.value = themeFileName
      localStorage.setItem(`${appName}-theme`, themeFileName)
      loginStore.details.userInfo.themeFileName = themeFileName
      commonStore.themeName = themeFileName
    }

    async function updateThemeConfig(config) {
      await commonStore.fetch({
        loading: false,
        apiName: 'updateThemeConfig',
        params: config
      })
    }

    return () => (
      <Layout.Header class={'tg-layout-header'} style={headerTheme.value}>
        <TGLogo style={`font-size: ${themeToken.value.fontSizeLG}px`} />
        <div class={'tg-layout-header-content'}>
          {
            showMenu.value && (
              <IconFont
                type={'icon-global-sq'}
                class={
                  [
                    'tg-header-layout-menu-toggle',
                    'menu-btn-fold',
                    { 'reverse': collapsed.value }
                  ]
                }
                onClick={commonStore.setCollapsed}
                title={!collapsed.value ? '折叠菜单' : '展开菜单'}
              />
            )
          }
          <div class="tg-header-body">
            {
              !!BodyFunctions && <BodyFunctions />
            }
          </div>
          <div class={'tg-header-info'}>
            {
              !!BodyFunctions && (
                <Divider
                  type={'vertical'}
                  class={'tg-header-divider'}
                  style={{ background: themeToken.value.colorSplit }}
                />
              )
            }
            <Dropdown
              overlayClassName={'tg-header-user-overlay'}
              arrow={{ pointAtCenter: true }}
            >
              {{
                default: () => (
                  <div class={'tg-header-user-content'}>
                    <Spin
                      spinning={loading.value}
                      indicator={<LoadingOutlined />}
                      wrapperClassName={`tg-header-user-spin-content${loading.value ? ' blur' : ''}`}
                    >
                      <Avatar
                        shape={'circle'}
                        style={{
                          backgroundColor: themeToken.value.colorPrimaryBgHover,
                          color: themeToken.value.colorPrimary,
                          fontWeight: 'bolder',
                          fontSize: `${themeToken.value.fontSizeLG}px`
                        }}
                      >
                        {avatarForLetter.value}
                      </Avatar>
                      <div class={'tg-user-info'}>
                        <div class={'tg-header-username'} style={`font-size: ${themeToken.value.fontSizeLG}px`}>
                          {userInfo.value.nickName || userInfo.value.fullName || '暂无用户名'}
                        </div>
                        <div class={'tg-header-tel'}>
                          {userInfo.value.loginName}
                        </div>
                      </div>
                      <IconFont type={'icon-global-down'} style={{ color: '#ffffff' }} />
                    </Spin>
                  </div>
                ),
                overlay: () => (
                  <Menu>
                    {!!UserFunctions && <UserFunctions />}
                    {
                      configs.header?.buttons?.logout?.show && (
                        <Menu.Item onClick={onLogOutClick}>
                          {configs.header?.buttons?.logout?.text}
                        </Menu.Item>
                      )
                    }
                  </Menu>
                )
              }}
            </Dropdown>
            {!!GlobalFunctions && <GlobalFunctions />}
            {
              (
                configs.header?.buttons?.algorithm?.show ||
                configs.header?.buttons?.fontSize?.show ||
                configs.header?.buttons?.theme?.show
              ) && (
                <Divider
                  type={'vertical'}
                  class={'tg-header-divider'}
                  style={{ background: themeToken.value.colorSplit }}
                />
              )
            }
            {/* 主题/皮肤/字号/布局等设置区域 */}
            <Space class={'tg-header-functions'} size={themeToken.value.fontSizeSM}>
              {
                configs.header?.buttons?.algorithm?.show && (
                  <Popover
                    style={{ width: '8ic' }}
                    placement="bottomRight"
                    title={'布局模式配置'}
                  >
                    {{
                      default: () => (
                        <Switch
                          vModel:checked={commonStore.algorithm}
                          checkedValue={'defaultAlgorithm'}
                          unCheckedValue={'darkAlgorithm'}
                          onChange={val => updateAlgorithm(val, commonStore.isCompactAlgorithm)}
                        >
                          {{
                            checkedChildren: () => (
                              <svg>
                                <use xlinkHref={'#tg-icon-sun'} />
                              </svg>
                            ),
                            unCheckedChildren: () => (
                              <svg>
                                <use xlinkHref={'#tg-icon-moon'} />
                              </svg>
                            )
                          }}
                        </Switch>
                      ),
                      content: () => (
                        <Space direction={'vertical'}>
                          <div>当前为{commonStore.algorithm === 'defaultAlgorithm' ? '亮色' : '暗色'}模式</div>
                          <div>
                            启用紧凑布局：
                            <Checkbox
                              vModel:checked={commonStore.isCompactAlgorithm}
                              onChange={val => updateAlgorithm(commonStore.algorithm, val.target.checked)}
                            />
                          </div>
                        </Space>
                      )
                    }}
                  </Popover>
                )
              }
              {
                configs.header?.buttons?.fontSize?.show && (
                  <Popover
                    placement="bottomRight"
                    title={configs.header?.buttons?.fontSize.text}
                  >
                    {{
                      default: () => (
                        <IconFont
                          type={'icon-global-font-size'}
                          title={configs.header?.buttons?.fontSize?.text}
                        />
                      ),
                      content: () => (
                        <Space direction={'vertical'}>
                          <div>当前全局字号：{commonStore.fontSize}px</div>
                          <Slider
                            vModel:value={fontSize.value}
                            onAfterChange={updateFontSize}
                            min={12}
                            max={20}
                          />
                          <div>当前组件尺寸：{COMPONENT_SIZE[commonStore.componentSize]}</div>
                          <RadioGroup
                            vModel:value={commonStore.componentSize}
                            class={'tg-header-component-size'}
                            size={'default'}
                            onChange={updateComponentSize}
                          >
                            <Radio value={'small'}>小</Radio>
                            <Radio value={'middle'}>中</Radio>
                            <Radio value={'large'}>大</Radio>
                          </RadioGroup>
                          {
                            (
                              commonStore.componentSize !== getScreenInfo().componentSize ||
                              commonStore.fontSize !== getScreenInfo().fontSize
                            ) && (
                              <div style={{ marginTop: '10px' }}>
                                <Button
                                  type={'primary'}
                                  onClick={resetFontSize}
                                >
                                  恢复默认值
                                </Button>
                              </div>
                            )
                          }
                        </Space>
                      )
                    }}
                  </Popover>
                )
              }
              {
                configs.header?.buttons?.theme?.show && (
                  <Dropdown placement="bottomRight" arrow>
                    {{
                      default: () => (
                        <IconFont
                          type={'icon-global-hf'}
                          title={configs.header?.buttons?.theme?.text}
                        />
                      ),
                      overlay: () => (
                        <Menu>
                          {
                            configs.header?.buttons?.theme?.availableThemes.map(item => (
                              <Menu.Item
                                disabled={currentThemeName.value === item.fileName}
                                onClick={() => switchThemes(item.fileName)}
                              >
                                {item.name}
                              </Menu.Item>
                            ))
                          }
                        </Menu>
                      )
                    }}
                  </Dropdown>
                )
              }
            </Space>
          </div>
        </div>
      </Layout.Header>
    )
  }
}
