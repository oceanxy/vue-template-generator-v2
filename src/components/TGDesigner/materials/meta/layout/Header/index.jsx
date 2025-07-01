import getPropertyConfig from '@/components/TGDesigner/properties'
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
  name: '页头',
  preview: props => {
    if (props.previewType !== TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <Header {...props} />
    }

    return <IconFont type="icon-designer-header" />
  },
  defaultProps: {
    contentWidth: '100%',
    contentPadding: ''
  },
  style: {
    width: '100%',
    height: '',
    paddingTop: 5,
    paddingBottom: 5,
    margin: 0,
    backgroundColor: '',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  class: '',
  children: [],
  configForm: [
    {
      label: '尺寸',
      items: [
        getPropertyConfig('input', {
          label: '宽度',
          title: '容器宽度（支持百分比和像素单位）',
          prop: 'width',
          props: {
            placeholder: '自适应',
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
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
        getPropertyConfig('input', {
          label: '内容宽度',
          title: 'Header内展示内容区域容器的宽度(width)',
          prop: 'contentWidth',
          props: {
            placeholder: '100%',
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
          label: '内容左右内边距',
          title: 'Header内展示内容区域容器的左侧和右侧的内边距值(padding-left & padding-right)',
          prop: 'contentPadding',
          props: {
            placeholder: '0px',
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
          label: '上边距',
          title: '头部容器的上边距(padding-top/padding-bottom)',
          prop: 'paddingTop',
          props: {
            placeholder: '30px',
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
          label: '下边距',
          title: '头部容器的下边距(padding-bottom)',
          prop: 'paddingBottom',
          props: {
            placeholder: '30px',
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
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
        getPropertyConfig('colorPicker', {
          label: '颜色',
          title: '背景颜色(background-color)',
          prop: 'backgroundColor'
        }),
        getPropertyConfig('input', {
          label: '图片',
          title: '背景图片(background-image)',
          prop: 'backgroundImage',
          props: {
            placeholder: '请输入图片地址',
            maxLength: 250,
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
          label: '图片尺寸',
          title: '背景图片尺寸(background-size)',
          prop: 'backgroundSize',
          props: {
            maxLength: 20,
            placeholder: '自动',
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
          label: '图片位置',
          title: '背景图片位置(background-position)',
          prop: 'backgroundPosition',
          props: {
            maxLength: 20,
            allowClear: true
          }
        }),
        getPropertyConfig('select', {
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

export const Header = {
  name: 'Header',
  props: ['contentWidth', 'contentPadding', 'style', 'previewType', 'children'],
  setup(props) {
    const style = ref({})
    const isDesignPatterns = props.previewType === TG_MATERIAL_PREVIEW_TYPE.CANVAS ||
      props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL_PREVIEW

    watch(() => props.style, val => {
      style.value = styleWithUnits(val)

      if (!style.value.backgroundColor && !style.value.backgroundImage) {
        style.value.backgroundImage = 'linear-gradient(0deg,#31549c, #253a66, #191b25)'
      }
    }, { immediate: true })

    const findChild = cellPosition => {
      return props.children?.find(child => child.props['data-cell-position'] === cellPosition)
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
            'paddingLeft': props.contentPadding || 0,
            'paddingRight': props.contentPadding || 0
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
