import { defineStore } from 'pinia'
import { Button, Input, Select } from 'ant-design-vue'
import { TG_COMPONENT_CATEGORY } from '../templateComponents'
import ProductCardMeta from '../templateComponents/meta/ProductCard'
import { cloneDeep } from 'lodash'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    selectedComponent: null,
    /**
     * 组件注册中心
     * @type {TGComponentMeta[]}
     */
    baseComponentList: [
      {
        type: 'a-button',
        category: TG_COMPONENT_CATEGORY.base,
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
      }
    ],
    templateComponentList: [
      ProductCardMeta
    ],
    layoutComponentList: []
  }),
  actions: {
    /**
     * 更新选中的组件元数据
     * @param component {TGComponentMeta} - 需要选中的组件元数据
     */
    updateComponent(component) {
      this.selectedComponent = component
    },
    /**
     * 根据组件类型获取组件元数据
     * @param type {string} - 组件类型
     * @param category {TG_COMPONENT_CATEGORY} - 组件类别
     * @returns {TGComponentMeta} 组件元数据
     */
    getComponentByType(type, category) {
      let componentList = []

      switch (category) {
        case TG_COMPONENT_CATEGORY.template:
          componentList = this.templateComponentList
          break
        case TG_COMPONENT_CATEGORY.base:
          componentList = this.baseComponentList
          break
        case TG_COMPONENT_CATEGORY.layout:
        default:
          componentList = this.layoutComponentList
          break
      }

      const component = componentList.find(component => component.type === type)

      return cloneDeep(component)
    }
  }
})
