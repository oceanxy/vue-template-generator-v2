import { defineStore } from 'pinia'
import { Button, Input, InputNumber, Select } from 'ant-design-vue'
import { TG_COMPONENT_CATEGORY } from '../templateComponents'
import ProductCardMeta from '../templateComponents/meta/ProductCard'
import { cloneDeep } from 'lodash'
import TGColorPicker from '@/components/TGColorPicker'

/**
 * @type TGComponentMeta[]
 */
const canvasConfigForm = {
  fields: [
    {
      type: 'number',
      label: '宽度',
      title: '画布宽度（width）',
      prop: 'width',
      component: () => InputNumber
    },
    {
      type: 'number',
      label: '边距',
      title: '内边距（padding）',
      prop: 'padding',
      component: () => InputNumber
    },
    {
      type: 'color',
      label: '背景颜色',
      title: '画布背景颜色（backgroundColor）',
      prop: 'backgroundColor',
      component: () => TGColorPicker
    }
  ]
}

export const useEditorStore = defineStore('editor', {
  state: () => ({
    selectedComponent: null,
    canvasConfigForm: canvasConfigForm,
    /**
     * 组件注册中心
     * @type {TGComponentMeta[]}
     */
    basicComponents: [
      {
        type: 'a-button',
        category: TG_COMPONENT_CATEGORY.BASIC,
        icon: '',
        preview: props => <Button {...props}>{props.slot}</Button>,
        defaultProps: {
          type: 'primary',
          slot: '按钮'
        },
        style: {},
        class: 'tg-editor-base-component',
        configForm: {
          fields: [
            {
              type: 'input',
              title: '按钮文本',
              label: '按钮文本',
              prop: 'slot',
              component: () => Input
            },
            {
              type: 'select',
              title: '按钮类型',
              label: '按钮类型',
              prop: 'type',
              component: () => Select,
              props: {
                options: [
                  { label: '主要按钮', value: 'primary' },
                  { label: '次级按钮', value: 'default' },
                  { label: '虚线按钮', value: 'dashed' }
                ]
              }
            }
          ]
        }
      },
      {
        type: 'a-input',
        category: TG_COMPONENT_CATEGORY.BASIC,
        icon: '',
        preview: props => <Input {...props} />,
        defaultProps: {
          placeholder: '请输入',
          readOnly: true
        },
        style: {},
        class: 'tg-editor-base-component',
        configForm: {
          fields: [
            {
              type: 'input',
              title: '文本框占位符',
              label: '占位符',
              prop: 'placeholder',
              component: () => Input
            }
          ]
        }
      }
    ],
    templateComponents: [
      ProductCardMeta
    ],
    layoutComponents: []
  }),
  actions: {
    createComponent(template, position) {
      return {
        id: `comp_${Date.now()}`,
        type: template.type,
        category: template.category,
        props: { ...template.defaultProps, style: { ...position } }
      }
    },
    /**
     * 更新选中的组件元数据
     * @param newComponent {TGComponentMeta} - 需要选中的组件元数据
     * @returns {TGComponentMeta|null}
     */
    updateComponent(newComponent) {
      if (!newComponent) return null

      if (newComponent.type === 'canvas') {
        this.selectedComponent = newComponent
      } else {
        const componentDef = this.getComponentByType(newComponent.type, newComponent.category)

        if (componentDef) {
          componentDef.id = newComponent.id
        }

        this.selectedComponent = componentDef

        return componentDef
      }
    },
    /**
     * 根据组件类型获取组件元数据
     * @param type {string} - 组件类型
     * @param category {TG_COMPONENT_CATEGORY} - 组件类别
     * @returns {TGComponentMeta|null} 组件元数据
     */
    getComponentByType(type, category) {
      let components = []

      switch (category) {
        case TG_COMPONENT_CATEGORY.TEMPLATE:
          components = this.templateComponents
          break
        case TG_COMPONENT_CATEGORY.BASIC:
          components = this.basicComponents
          break
        case TG_COMPONENT_CATEGORY.LAYOUT:
        default:
          components = this.layoutComponents
          break
      }

      const component = components.find(component => component.type === type)

      if (component) {
        return cloneDeep(component)
      } else {
        return null
      }
    }
  }
})
