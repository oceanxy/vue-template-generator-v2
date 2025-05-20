import { Menu } from 'ant-design-vue'
import { computed, nextTick, onBeforeMount } from 'vue'
import useStore from '@/composables/tgStore'
import { useRoute, useRouter } from 'vue-router'
import { range } from 'lodash'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import getPropertyField from '@/components/TGDesigner/properties'
import './index.scss'

/**
 * Navigation模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-template-navigation',
  category: TG_MATERIAL_CATEGORY.TEMPLATE,
  name: '导航',
  preview: props => {
    if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.PORTAL) {
      return <Navigation {...props} />
    } else if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <IconFont type="icon-designer-material-navigation" />
    } else if (
      props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL_PREVIEW ||
      props.previewType === TG_MATERIAL_PREVIEW_TYPE.CANVAS
    ) {
      const style = props.style || {}

      if (!style.width || style.width === '100%') {
        style.width = '640px'
      }

      if (!props.isBuiltInHeader) {
        style.backgroundImage = 'linear-gradient(0deg,#31549c, #253a66, #191b25)'
      }

      return (
        <Menu
          class={'tg-designer-template-navigation'}
          mode={'horizontal'}
          style={style}
          items={range(1, 7, 1).map(item => ({ key: item, label: `导航样例${item}` }))}
        />
      )
    }
  },
  defaultProps: {
    contentWidth: '100%'
  },
  style: {
    width: '100%',
    height: '',
    paddingTop: 30,
    paddingBottom: 30,
    margin: 0,
    backgroundColor: '',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  class: '',
  configForm: {
    fields: [
      {
        label: '尺寸',
        items: [
          getPropertyField('input', {
            label: '宽度',
            title: '容器宽度（支持百分比和像素单位）',
            prop: 'width',
            props: {
              placeholder: '自适应',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '高度',
            title: '容器高度（支持像素单位，默认自适应）',
            prop: 'height',
            props: {
              placeholder: '自适应',
              allowClear: true
            }
          })
        ]
      },
      {
        label: '布局',
        items: [
          getPropertyField('input', {
            label: '内容宽度',
            title: 'Header内展示内容区域容器的宽度',
            prop: 'contentWidth',
            props: {
              placeholder: '100%',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '上边距',
            title: '头部容器的上边距(padding-top/padding-bottom)',
            prop: 'paddingTop',
            props: {
              placeholder: '30px',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '下边距',
            title: '头部容器的下边距(padding-bottom)',
            prop: 'paddingBottom',
            props: {
              placeholder: '30px',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '外边距',
            title: '画布的外边距（margin）',
            prop: 'margin',
            props: {
              placeholder: '0px',
              allowClear: true
            }
          })
        ]
      },
      {
        label: '背景',
        items: [
          getPropertyField('colorPicker', {
            label: '颜色',
            title: '背景颜色(background-color)',
            prop: 'backgroundColor'
          }),
          getPropertyField('input', {
            label: '图片',
            title: '背景图片(background-image)',
            prop: 'backgroundImage',
            props: {
              placeholder: '请输入图片地址',
              maxLength: 250,
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '图片尺寸',
            title: '背景图片尺寸(background-size)',
            prop: 'backgroundSize',
            props: {
              maxLength: 20,
              placeholder: '自动',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '图片位置',
            title: '背景图片位置(background-position)',
            prop: 'backgroundPosition',
            props: {
              maxLength: 20,
              allowClear: true
            }
          }),
          getPropertyField('select', {
            label: '图片重复',
            title: '背景图片重复(background-repeat)',
            prop: 'backgroundRepeat',
            props: {
              options: [
                { label: '不重复', value: 'no-repeat', title: 'no-repeat' },
                { label: '重复(裁剪&全覆盖)', value: 'repeat', title: 'repeat' },
                { label: '重复(不裁剪&非全覆盖)', value: 'space', title: 'space' },
                { label: '重复(伸缩铺满)', value: 'round', title: 'round' },
                { label: '沿X轴重复', value: 'repeat-x', title: 'repeat-x' },
                { label: '沿Y轴重复', value: 'repeat-y', title: 'repeat-y' }
              ]
            }
          })
        ]
      }
    ]
  }
}

const Navigation = {
  name: 'Navigation',
  setup() {
    const store = useStore('portal')
    const router = useRouter()
    const route = useRoute()
    const pageRoute = computed(() => store.search.pageRoute)
    const navs = computed(() => store.dataSource.list)

    const handleMenuClick = async ({ key, item }) => {
      await switchRoute(key, item.title, item.id)
    }

    const switchRoute = async (key, title, pageId) => {
      store.search.pageId = pageId
      store.search.pageRoute = key

      await router.push({
          name: 'PortalPage',
          params: { pageRoute: key },
          query: { title: encodeURIComponent(title) }
        }
      )
    }

    onBeforeMount(async () => {
      await store.getList({
        apiName: 'getPortalNavs',
        paramsForGetList: { sceneConfigId: route.params.sceneConfigId }
      })

      await nextTick()

      const home = navs.value.find(route => route.routeInfo.includes('-home'))

      if (home) {
        await switchRoute(home.routeInfo, home.navName, home.relScenePageId)
      } else {
        await switchRoute(
          navs.value[0].routeInfo,
          navs.value[0].title,
          navs.value[0].relScenePageId
        )
      }
    })

    return () => (
      <Menu
        class={'tg-designer-template-navigation'}
        mode={'horizontal'}
        selectedKeys={[pageRoute.value]}
        onClick={handleMenuClick}
      >
        {
          navs.value.map(item => (
            <Menu.Item
              key={item.routeInfo}
              title={item.navName}
              id={item.relScenePageId}
            >
              {item.navName}
            </Menu.Item>
          ))
        }
      </Menu>
    )
  }
}
