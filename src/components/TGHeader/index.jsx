import './assets/styles/index.scss'
import { computed, getCurrentInstance, onBeforeMount, onUnmounted, ref, watch } from 'vue'
import { Avatar, Button, Checkbox, Divider, Dropdown, Layout, Menu, Popover, Radio, RadioGroup, Slider, Space, Spin, Switch, theme, Select, Badge } from 'ant-design-vue'
import TGLogo from '@/components/TGLogo'
import { useRouter } from '@/router'
import useStore from '@/composables/tgStore'
import { getFirstLetterOfEachWordOfAppName } from '@/utils/utilityFunction'
import configs from '@/configs'
import dayjs from 'dayjs'
import { dynamicCompMount } from '@/utils/dynamicCompMount'
import './assets/images/svgComp/moon.svg'
import './assets/images/svgComp/sun.svg'
import useThemeVars from '@/composables/themeVars'
import { COMPONENT_SIZE } from '@/configs/enums'

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
    const lastLoginTime = computed(() => loginStore.lastLoginTime)
    const lastLoginToken = computed(() => loginStore.lastLoginToken)
    const showMenu = computed(() => commonStore.showMenu)
    const loading = computed(() => loginStore.loading)
    const userInfo = computed(() => loginStore.userInfo)
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
    const localStorageHeaderId = computed(() => {
      return commonStore.headerId || localStorage.getItem(`${appName}-headerId`)
    })
    const fontSize = ref(commonStore.fontSize)
    const currentThemeName = ref(
      localStorage.getItem(`${appName}-theme`) ||
      loginStore?.userInfo?.themeFileName ||
      configs.header?.buttons?.theme.default
    )

    watch(userInfo, async (val) => {
      if (Object.keys(val).length) {
        // 获取header上的代办信息暂时先放在login文件
        if (proxy.GlobalShowNewDrawerPopup) {
          // 判断config配置中buttons里的extraButtons text为消息的配置
          const isNewBtn = configs.header?.buttons?.extraButtons?.some(item => item.text == '消息')
          if (isNewBtn) {
            loginStore.getMessageList()
          }
        } else {
          console.warn('未找到可用的全局注册组件：GlobalShowNewDrawerPopup')
        }
      }
    }, { immediate: true })

    watch(() => localStorageHeaderId, async value => {
      if (value) {
        // 当用户切换组织成功之后 后端保存当前组织信息
        const res = await loginStore.switchUserOrg()

        if (res.status) {
          // clearRoutes()
          const token = localStorage.getItem(`${appName}-${configs.tokenConfig.fieldName}`)
          await loginStore.trilateralLogin({ token })
          // loginStore.jumpAfterLogin()
          // if (document.querySelector('#tg-responsive-layout')) {
          //   document.querySelector('#tg-responsive-layout').style.display = 'none'
          // }

          window.location.reload()
          // loginStore.jumpAfterLogin()
        }
      }
    }, { deep: true })

    onBeforeMount(async () => {
      await verifyUserInfo()
    })

    onUnmounted(() => {
      instance?.unmount?.()
    })

    /**
     * 预防页面刷新丢失用户信息
     * @returns {Promise<void>}
     */
    async function verifyUserInfo() {
      if (!loading.value) {
        const token = localStorage.getItem(`${appName}-${configs.tokenConfig.fieldName}`)
        const loginTime = localStorage.getItem(`${appName}-lastLoginTime`) || lastLoginTime.value
        const loginTimeDiff = dayjs().diff(dayjs(loginTime), 'hour')
        const {
          NODE_ENV,
          VUE_APP_DEVELOPMENT_ENVIRONMENT_SKIPPING_PERMISSIONS
        } = process.env.NODE_ENV !== 'production'

        if (
          (
            // 验证token是否存在
            token ||
            // 验证开发环境是否开启跳过权限
            (NODE_ENV === 'development' && VUE_APP_DEVELOPMENT_ENVIRONMENT_SKIPPING_PERMISSIONS === 'on')
          ) &&
          (
            token !== lastLoginToken.value || // 兼容第三方携带token登录的方式
            loginTimeDiff >= 2 || // 与上一次登录时间间隔大于2小时之后刷新一下用户信息
            !Object.keys(userInfo.value).length
          )
        ) {
          const res = await loginStore.getUserInfo({ token })

          return res
        }
      }
    }

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

    async function resetPwd() {
      if (proxy.GlobalUpdatePassword) {
        instance = await dynamicCompMount(proxy.GlobalUpdatePassword, { type: 'global' })

        loginStore.setVisibilityOfModal({
          modalStatusFieldName: 'showModalForChangePassword',
          location: 'modalForChangePassword',
          value: true
        })
      } else {
        console.warn('未找到可用的全局注册组件：GlobalUpdatePassword')
      }
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
      await updateThemeConfig({
        componentSize: 'middle',
        fontSize: 14
      })

      commonStore.componentSize = 'middle'
      commonStore.fontSize = 14
      fontSize.value = 14
    }

    async function updateFontSize(val) {
      await updateThemeConfig({ fontSize: val })
      commonStore.fontSize = val
    }

    async function switchThemes(themeFileName) {
      await updateThemeConfig({ themeFileName })

      currentThemeName.value = themeFileName
      localStorage.setItem(`${appName}-theme`, themeFileName)
      loginStore.userInfo.themeFileName = themeFileName
      commonStore.themeName = themeFileName
    }

    async function updateThemeConfig(config) {
      await commonStore.fetch({
        loading: false,
        apiName: 'updateThemeConfig',
        params: config
      })
    }

    async function onOrgSelectChange(val) {
      localStorage.setItem(`${appName}-headerId`, val)
      localStorage.removeItem(`${appName}-selectedKey`)
      localStorage.removeItem(`${appName}-menu`)
    }

    return () => (
      <Layout.Header class={'tg-layout-header'} style={headerTheme.value}>
        <TGLogo style={`font-size: ${themeToken.value.fontSizeLG}px`} />
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
            <div class="tg-header-user-content">
              <Spin
                spinning={loading.value}
                wrapperClassName={`tg-header-user-spin-content${loading.value ? ' blur' : ''}`}>
                {
                  configs.header?.params?.show
                    ? [
                      <Select
                        vModel:value={commonStore.headerId}
                        placeholder={configs.header?.params?.placeholder ?? '请选择'}
                        class={'tg-header-params'}
                        suffixIcon={<IconFont type={'icon-global-down'} />}
                        onChange={onOrgSelectChange}
                      >
                        {
                          commonStore.organListForHeader.list?.map(item => (
                            <Select.Option
                              value={item.orgId}
                              title={item.orgName}>
                              {item.orgName || '暂无组织名称'}
                            </Select.Option>
                          ))
                        }
                      </Select>,
                      <Divider type={'vertical'} class={'tg-header-divider'} />
                    ]
                    : null
                }
              </Spin>
            </div>
            <Dropdown
              overlayClassName={'tg-header-user-overlay'}
              arrow={{ pointAtCenter: true }}
            >
              {{
                default: () => (
                  <div class={'tg-header-user-content'}>
                    <Spin
                      spinning={loading.value}
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
                    {
                      configs.header?.buttons?.resetPwd?.show && (
                        <Menu.Item key={'1'} onClick={resetPwd}>
                          {configs.header?.buttons?.resetPwd?.text}
                        </Menu.Item>
                      )
                    }
                    {
                      configs.header?.buttons?.logout?.show && (
                        <Menu.Item key={'2'} onClick={onLogOutClick}>
                          {configs.header?.buttons?.logout?.text}
                        </Menu.Item>
                      )
                    }
                  </Menu>
                )
              }}
            </Dropdown>
            <Divider
              type={'vertical'}
              class={'tg-header-divider'}
              style={{ background: themeToken.value.colorSplit }}
            />
            <Space class={'tg-header-functions'} size={themeToken.value.fontSizeSM}>
              {
                configs.header?.buttons?.extraButtons?.map(button => (
                  <Badge dot={loginStore[button.BadgeDot]} offset={[-4, 2]}>
                    <Button
                      shape="circle"
                      type={'link'}
                      title={button.text}
                      class={'tg-header-icon'}
                      onClick={e => { __TG_APP_EVENT_MAPPINGS__?.[button.event]?.call(this, proxy, e) }}
                    >
                      {
                        button.iconType === 'antd'
                          ? <Icon style={{ fontSize: '0.84em' }} type={button.icon} />
                          : <IconFont type={button.icon} />
                      }
                    </Button>
                  </Badge>
                ))
              }
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
                          >
                            <Radio value={'small'}>小</Radio>
                            <Radio value={'middle'}>中</Radio>
                            <Radio value={'large'}>大</Radio>
                          </RadioGroup>
                          {
                            (commonStore.componentSize !== 'middle' || commonStore.fontSize !== 14) && (
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
        </Space>
      </Layout.Header>
    )
  }
}
