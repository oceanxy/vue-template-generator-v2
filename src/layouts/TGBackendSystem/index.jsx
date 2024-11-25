import './assets/styles/index.scss'
import { Layout, Spin } from 'ant-design-vue'
import TGHeader from '@/components/TGHeader'
import { RouterView } from 'vue-router'
import { computed, Suspense } from 'vue'
import { useCommonStore } from '@/stores/modules/common'
import TGMenu from '@/components/TGMenu'
import configs from '@/configs'
import TGBreadcrumb from '@/components/TGBreadcrumb'
import router from '@/router'

export default {
  name: 'TGBackendSystemLayout',
  mounted() {
    // 注册全局扩展组件
    // this.$nextTick(async () => {
    //   await import('@/extend')
    // })
  },
  setup() {
    const store = useCommonStore()
    const showMenu = computed(() => store.showMenu)
    const collapsed = computed(() => store.collapsed)

    return () => (
      <Layout id="tg-responsive-layout" class={'tg-layout'}>
        <TGHeader />
        <Layout>
          <Layout.Sider
            theme={'light'}
            collapsible
            collapsed={collapsed.value}
            trigger={null}
            class={`tg-responsive-layout-sider${
              showMenu.value
                ? collapsed.value ? ' collapsed' : ' normal'
                : ''
            }`}
          >
            {showMenu.value ? <TGMenu /> : null}
          </Layout.Sider>
          <Layout.Content class="tg-responsive-layout-content">
            {
              configs.hideBreadCrumb || router.currentRoute.value.meta.hideBreadCrumb || !showMenu.value
                ? null
                : <TGBreadcrumb />
            }
            {/*{this.$config.enableTabPage && showMenu ? <TGPageTabs /> : null}*/}
            <Suspense>
              {{
                default: () => <RouterView key={router.currentRoute.value.name} />,
                fallback: () => <Spin />
              }}
            </Suspense>
          </Layout.Content>
        </Layout>
      </Layout>
    )
  }
}
