import { predefinedProperties } from '@/components/TGDesigner/properties'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'
import { ref, watch } from 'vue'
import './assets/styles/index.scss'

/**
 * Footer模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-layout-footer',
  category: TG_MATERIAL_CATEGORY.LAYOUT,
  name: '页尾容器',
  preview: props => {
    if (props.previewType !== TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <Footer {...props} />
    }

    return <IconFont type="icon-designer-footer" />
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
          title: 'Footer内展示内容区域容器的宽度（width）',
          prop: 'contentWidth',
          props: {
            placeholder: '100%'
          }
        }),
        predefinedProperties.padding({
          label: '内容区域内边距',
          title: 'Footer内展示内容区域的容器内边距值（padding）',
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

export const Footer = {
  name: 'Footer',
  props: ['contentWidth', 'contentPadding', 'style', 'previewType', 'children'],
  setup(props, { attrs }) {
    const style = ref({})
    const isDesignPatterns = props.previewType === TG_MATERIAL_PREVIEW_TYPE.CANVAS ||
      props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL_PREVIEW

    watch(() => props.style, val => {
      style.value = styleWithUnits(val)

      // 当未设置背景色时，使用一个默认的内置背景色
      if (!style.value.backgroundColor && !style.value.backgroundImage) {
        style.value.backgroundColor = '#101e75'
      }
    }, { immediate: true })

    const findChild = cellPosition => {
      return props.children?.find(child => child.props?.['data-cell-position'] === cellPosition)
    }

    return () => (
      <div
        class="tg-designer-layout-footer"
        style={style.value}
      >
        <div
          class="tg-designer-layout-footer-content"
          style={styleWithUnits({
            width: props.contentWidth || '100%',
            padding: props.contentPadding || 0
          })}
        >
          <div class={'tg-designer-layout-footer-content-left'}>
            <div
              data-cell-position="logo"
              class={{
                'tg-designer-layout-container': true,
                'tg-designer-layout-logo': true,
                'is-design-patterns': isDesignPatterns
              }}
            >
              {findChild('logo')}
            </div>
            <div
              data-cell-position="text"
              class={{
                'tg-designer-layout-container': true,
                'tg-designer-layout-text': true,
                'is-design-patterns': isDesignPatterns
              }}
            >
              {findChild('text')}
            </div>
          </div>
          {
            attrs.device !== 'h5' && (
              <div
                data-cell-position="qrcode"
                class={{
                  'tg-designer-layout-container': true,
                  'tg-designer-layout-qrcode': true,
                  'is-design-patterns': isDesignPatterns
                }}
              >
                {findChild('qrcode')}
              </div>
            )
          }
        </div>
      </div>
    )
  }
}
