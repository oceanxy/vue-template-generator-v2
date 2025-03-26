import { defineStore } from 'pinia'
import { Button, Input, Select } from 'ant-design-vue'
import { TG_COMPONENT_CATEGORY } from '../templateComponents'
import ProductCardMeta from '../templateComponents/meta/ProductCard'
import { cloneDeep } from 'lodash'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    selectedComponent: null,
    nearestElement: null,
    lastDirection: '',
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
        className: 'tg-editor-base-component',
        configForm: {
          fields: [
            {
              type: 'input',
              label: '按钮文本',
              prop: 'slot',
              component: () => Input
            },
            {
              type: 'select',
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
        className: 'tg-editor-base-component',
        configForm: {
          fields: [
            {
              type: 'input',
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
      const componentDef = this.getComponentByType(newComponent.type, newComponent.category)

      if (componentDef) {
        componentDef.id = newComponent.id
      }

      this.selectedComponent = componentDef

      return componentDef
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
    },
    setDraggingComponent(component) {
      this.selectedComponent = component
    }
  }
})
