import { Menu } from 'ant-design-vue'
import { omit, range } from 'lodash'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { predefinedProperties } from '@/components/TGDesigner/properties'
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
    padding: 0,
    margin: 0,
    backgroundColor: '',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  class: '',
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
        predefinedProperties.padding(),
        predefinedProperties.margin()
      ]
    },
    {
      label: '前景',
      items: [
        predefinedProperties.fontSize(),
        ...predefinedProperties.foreground()
      ]
    },
    {
      label: '背景',
      items: predefinedProperties.background(null, propertyValues)
    }
  ]
}
