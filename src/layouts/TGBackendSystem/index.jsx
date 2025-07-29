import { Layout, Spin } from 'ant-design-vue'
import TGHeader from '@/components/TGHeader'
import { RouterView } from 'vue-router'
import { computed, Suspense } from 'vue'
import TGMenu from '@/components/TGMenu'
import configs from '@/configs'
import TGBreadcrumb from '@/components/TGBreadcrumb'
import router from '@/router'
import useStore from '@/composables/tgStore'
import './assets/styles/index.scss'

export default {
  name: 'TGBackendSystemLayout',
  setup() {
    const store = useStore('/common')
    const showMenu = computed(() => store.showMenu)
    const siderWidth = computed(() => {
      if (store.componentSize === 'small') {
        return 180
      } else if (store.componentSize === 'large') {
        return 230
      } else {
        return 200
      }
    })

    const collapsedWidth = computed(() => {
      if (store.componentSize === 'small') {
        return 60
      }

      return 90
    })

    return () => (
      <Layout id="tg-responsive-layout" class={'tg-layout'}>
        <TGHeader />
        <Layout>
          <Layout.Sider
            vModel:collapsed={store.collapsed}
            theme={'light'}
            collapsible
            trigger={null}
            width={siderWidth.value}
            collapsedWidth={collapsedWidth.value}
            class={[
              'tg-responsive-layout-sider',
              {
                collapsed: showMenu.value && store.collapsed,
                normal: showMenu.value && !store.collapsed
              }
            ]}
          >
            {showMenu.value ? <TGMenu /> : null}
          </Layout.Sider>
          <Layout.Content class="tg-responsive-layout-content">
            {
              configs.hideBreadCrumb || router.currentRoute.value.meta.hideBreadCrumb || !showMenu.value
                ? null
                : <TGBreadcrumb />
            }
            {/*{configs.enableTabPage && showMenu ? <TGPageTabs /> : null}*/}
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
