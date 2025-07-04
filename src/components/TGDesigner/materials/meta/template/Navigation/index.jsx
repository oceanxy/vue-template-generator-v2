import { computed, onBeforeMount } from 'vue'
import useStore from '@/composables/tgStore'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { useRoute } from 'vue-router'
import BasicMenu, { MenuComp } from '../../basic/Menu'

/**
 * Navigation模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-template-menu',
  category: TG_MATERIAL_CATEGORY.TEMPLATE,
  name: '导航菜单',
  preview: props => {
    if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <IconFont type="icon-designer-material-navigation" />
    }

    return <Navigation {...props} />
  },
  defaultProps: BasicMenu.defaultProps,
  style: BasicMenu.style,
  class: '',
  propConfigForm: BasicMenu.propConfigForm
}

const Navigation = {
  name: 'Navigation',
  props: MenuComp.props,
  setup(props, { attrs }) {
    const store = useStore('portal')
    const search = computed(() => store.search)
    const route = useRoute()
    const navs = computed(() => store.dataSource.list || [])
    const isInitDataSource = props.previewType === TG_MATERIAL_PREVIEW_TYPE.PORTAL ||
      props.previewType === TG_MATERIAL_PREVIEW_TYPE.PREVIEW

    const handleMenuClick = route => {
      if (isInitDataSource) {
        store.$patch({
          search: {
            pageRoute: route.item.routeInfo,
            pageId: route.item.relScenePageId,
            title: route.item.navName,
            isLoginRequired: route.item.outLoginFlag
          }
        })
      }
    }

    onBeforeMount(async () => {
      if (isInitDataSource) {
        await store.getList({
          apiName: 'getPortalNavs',
          paramsForGetList: { sceneConfigId: search.value.sceneConfigId || route.params.sceneConfigId }
        })

        let targetRoute

        if (route.params.pageRoute) {
          const currentRoute = navs.value.find(nav => nav.routeInfo === route.params.pageRoute)

          targetRoute = {
            pageRoute: currentRoute.routeInfo,
            pageId: currentRoute.relScenePageId,
            title: currentRoute.navName,
            isLoginRequired: currentRoute.outLoginFlag
          }
        } else {
          const home = navs.value.find(nav => nav.homeFlag === 1)

          if (home) {
            targetRoute = {
              pageRoute: home.routeInfo,
              pageId: home.relScenePageId,
              title: home.navName,
              isLoginRequired: home.outLoginFlag
            }
          } else if (navs.value[0]) {
            targetRoute = {
              pageRoute: navs.value[0].routeInfo,
              pageId: navs.value[0].relScenePageId,
              title: navs.value[0].navName,
              isLoginRequired: navs.value[0].outLoginFlag
            }
          }
        }

        if (targetRoute) {
          store.$patch({ search: targetRoute })
        }
      }
    })

    return () => {
      if (attrs.device === 'h5') {
        return null
      }

      return (
        <MenuComp
          {...props}
          {
            ...(
              isInitDataSource
                ? {
                  dataSource: navs.value,
                  fieldNames: {
                    key: 'routeInfo',
                    title: 'navName',
                    disabled: 'disabled'
                  },
                  selectedKeys: [route.params.pageRoute || search.value.pageRoute]
                }
                : undefined
            )
          }
          onMenuClick={handleMenuClick}
        />
      )
    }
  }
}
