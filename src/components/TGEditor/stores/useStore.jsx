import { defineStore } from 'pinia'
import { Button, Input, Select } from 'ant-design-vue'
import { TG_COMPONENT_CATEGORY } from '../templateComponents'
import ProductCardMeta from '../templateComponents/meta/ProductCard'

export const useStore = defineStore('editor', {
  state: () => ({
    /**
     * 组件注册中心
     * @type {TGComponentMeta[]}
     */
    componentList: [
      // 模板组件
      ProductCardMeta,
      {
        type: 'a-button',
        category: TG_COMPONENT_CATEGORY.base,
        icon: '',
        style: {},
        className: 'tg-editor-base-component',
        preview: props => <Button {...props}>按钮</Button>,
        defaultProps: { type: 'primary' },
        configForm: {
          fields: [
            {
              type: 'input',
              label: '按钮文本',
              prop: 'children',
              component: Input
            },
            {
              type: 'select',
              label: '按钮类型',
              prop: 'type',
              component: Select,
              options: [
                { label: '主要按钮', value: 'primary' },
                { label: '次级按钮', value: 'default' },
                { label: '虚线按钮', value: 'dashed' }
              ]
            }
          ]
        }
      }
    ]
  }),
  actions: {
    getComponentByType(type) {
      return this.componentList.find(c => c.type === type)
    }
  }
})
