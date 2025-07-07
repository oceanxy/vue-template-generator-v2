import { predefinedProperties } from '@/components/TGDesigner/properties'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'
import { ref, watch } from 'vue'
import './assets/styles/index.scss'

/**
 * Header模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-layout-header',
  category: TG_MATERIAL_CATEGORY.LAYOUT,
  name: '页头容器',
  preview: props => {
    if (props.previewType !== TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <Header {...props} />
    }

    return <IconFont type="icon-designer-header" />
  },
  defaultProps: {
    contentWidth: '100%',
    contentPadding: 0
  },
  style: {
    width: '100%',
    height: '',
    padding: 5,
    margin: 0,
    backgroundColor: '',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  class: '',
  children: [],
  propConfigForm: propertyValues => [
    {
      label: '尺寸',
      items: [
        predefinedProperties.width(),
        predefinedProperties.height()
      ]
    },
    {
      label: '布局',
      items: [
        predefinedProperties.width({
          label: '内容宽度',
          title: 'Header内展示内容区域容器的宽度（width）',
          prop: 'contentWidth',
          props: {
            placeholder: '100%'
          }
        }),
        predefinedProperties.padding({
          label: '内容区域内边距',
          title: 'Header内展示内容区域的容器内边距值（padding）',
          prop: 'contentPadding'
        }),
        predefinedProperties.padding(),
        predefinedProperties.margin()
      ]
    },
    {
      label: '背景',
      items: predefinedProperties.background(null, propertyValues)
    }
  ]
}

export const Header = {
  name: 'Header',
  props: ['contentWidth', 'contentPadding', 'style', 'previewType', 'children'],
  setup(props) {
    const style = ref({})
    const isDesignPatterns = props.previewType === TG_MATERIAL_PREVIEW_TYPE.CANVAS ||
      props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL_PREVIEW

    watch(() => props.style, val => {
      style.value = styleWithUnits(val)

      // 当未设置背景色时，使用一个默认的内置背景色
      if (!style.value.backgroundColor && !style.value.backgroundImage) {
        style.value.backgroundImage = 'linear-gradient(0deg,#31549c, #253a66, #191b25)'
      }
    }, { immediate: true })

    const findChild = cellPosition => {
      return props.children?.find(child => child.props?.['data-cell-position'] === cellPosition)
    }

    return () => (
      <div
        class="tg-designer-layout-header"
        style={style.value}
      >
        <div
          class="tg-designer-layout-header-content"
          style={styleWithUnits({
            width: props.contentWidth || '100%',
            padding: props.contentPadding || 0
          })}
        >
          <div class={'tg-designer-layout-header-logo'}>
            <div
              data-cell-position="image"
              class={{
                'tg-designer-layout-container': true,
                'tg-designer-layout-image': true,
                'is-design-patterns': isDesignPatterns
              }}
            >
              {findChild('image')}
            </div>
            <div
              data-cell-position="title"
              class={{
                'tg-designer-layout-container': true,
                'tg-designer-layout-header-title': true,
                'is-design-patterns': isDesignPatterns
              }}
            >
              {findChild('title')}
            </div>
          </div>
          <div
            data-cell-position="nav"
            class={{
              'tg-designer-layout-container': true,
              'tg-designer-layout-header-nav': true,
              'is-design-patterns': isDesignPatterns
            }}
          >
            {findChild('nav')}
          </div>
        </div>
      </div>
    )
  }
}
