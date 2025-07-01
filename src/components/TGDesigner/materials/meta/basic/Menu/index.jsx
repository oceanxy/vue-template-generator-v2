import { Menu } from 'ant-design-vue'
import { omit, range } from 'lodash'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import getPropertyConfig from '@/components/TGDesigner/properties'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'
import { ref, watch } from 'vue'
import './index.scss'

export const MenuComp = {
  name: 'MenuComp',
  props: {
    previewType: { type: String, required: true },
    style: { type: Object, default: () => ({}) },
    hoverColor: { type: String, default: '' },
    selectedColor: { type: String, default: '' },
    selectedKeys: { type: [Array, undefined], default: undefined },
    fieldNames: {
      type: Object,
      default: () => ({
        key: 'key',
        title: 'title',
        disabled: 'disabled'
      })
    },
    dataSource: {
      type: Array,
      default: () => range(1, 7, 1).map(item => ({ key: item, title: `导航样例${item}` }))
    }
  },
  setup(props, { emit }) {
    const _props = ref(props)
    const style = ref({})

    watch(
      _props,
      newProps => {
        _props.value = newProps
        style.value = styleWithUnits(newProps.style || {})
        style.value['--tg-designer-navigation-font-size'] = newProps.fontSize

        if (newProps.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL_PREVIEW) {
          if (!style.value.width || style.value.width === '100%') {
            style.value.width = '640px'
            style.value.height = 'auto'
          }
        } else {
          style.value['--tg-designer-navigation-color-selected'] = newProps.selectedColor
          style.value['--tg-designer-navigation-color-hover'] = newProps.hoverColor
        }
      },
      { deep: true, immediate: true }
    )

    const handleMenuClick = e => {
      emit('menuClick', e)
    }

    return () => (
      <div
        class={'tg-designer-navigation-wrapper'}
        style={style.value}
      >
        <Menu
          class={'tg-designer-navigation'}
          mode={'horizontal'}
          selectedKeys={_props.value.selectedKeys}
          onClick={handleMenuClick}
        >
          {
            _props.value.dataSource.map(item => (
              <Menu.Item
                {...omit(item, 'children')}
                disabled={item[props.fieldNames.disabled]}
                key={item[props.fieldNames.key]}
                title={item[props.fieldNames.title]}
              >
                {item[props.fieldNames.title]}
              </Menu.Item>
            ))
          }
        </Menu>
      </div>
    )
  }
}

/**
 * Menu基础组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'a-menu',
  category: TG_MATERIAL_CATEGORY.BASIC,
  name: '导航菜单',
  preview: props => {
    if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <IconFont type="icon-designer-material-menu" />
    }

    return <MenuComp {...props} />
  },
  defaultProps: {
    hoverColor: '#000000e0',
    selectedColor: '#1677ff'
  },
  style: {
    width: '100%',
    height: '',
    color: '#000000e0',
    fontSize: 14,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    backgroundColor: '',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  class: '',
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
      label: '前景',
      items: [
        getPropertyConfig('inputNumber', {
          label: '字号',
          title: '导航文字字体大小(font-size)',
          prop: 'fontSize',
          props: {
            placeholder: '14px',
            allowClear: true
          }
        }),
        getPropertyConfig('colorPicker', {
          label: '颜色',
          title: '导航文字正常状态下的颜色(color)',
          prop: 'color'
        }),
        getPropertyConfig('colorPicker', {
          label: '悬浮颜色',
          title: '导航文字鼠标悬浮状态下的颜色(color)',
          prop: 'hoverColor'
        }),
        getPropertyConfig('colorPicker', {
          label: '选中颜色',
          title: '导航文字选中状态下的颜色(color)',
          prop: 'selectedColor'
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
