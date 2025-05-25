import './assets/styles/index.scss'
import { Layout, Spin } from 'ant-design-vue'
import TGHeader from '@/components/TGHeader'
import { RouterView } from 'vue-router'
import { computed, Suspense } from 'vue'
import TGMenu from '@/components/TGMenu'
import configs from '@/configs'
import TGBreadcrumb from '@/components/TGBreadcrumb'
import router from '@/router'
import useStore from '@/composables/tgStore'

export default {
  name: 'TGBackendSystemLayout',
  setup() {
    const store = useStore('/common')
    const showMenu = computed(() => store.showMenu)

    return () => (
      <Layout id="tg-responsive-layout" class={'tg-layout'}>
        <TGHeader />
        <Layout>
          <Layout.Sider
            vModel:collapsed={store.collapsed}
            theme={'light'}
            collapsible
            trigger={null}
            width={235}
            class={`tg-responsive-layout-sider${
              showMenu.value
                ? store.collapsed ? ' collapsed' : ' normal'
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
