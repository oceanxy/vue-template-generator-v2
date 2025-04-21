import { defineStore } from 'pinia'
import { Button, Input, InputNumber, Select } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY } from '../materials'
import ProductCardMeta from '../materials/meta/ProductCard'
import FlexLayoutMeta from '../materials/meta/FlexLayout'
import { cloneDeep } from 'lodash'
import TGColorPicker from '@/components/TGColorPicker'
import { schema } from '../schemas'
import { getUUID } from '@/utils/utilityFunction'

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
      modelProp: 'value',
      component: () => InputNumber
    },
    {
      type: 'number',
      label: '边距',
      title: '内边距（padding）',
      prop: 'padding',
      modelProp: 'value',
      component: () => InputNumber
    },
    {
      type: 'color',
      label: '背景颜色',
      title: '画布背景颜色（backgroundColor）',
      prop: 'backgroundColor',
      modelProp: 'value',
      component: () => TGColorPicker
    }
  ]
}

export const useEditorStore = defineStore('editor', {
  state: () => ({
    isSaving: false,
    selectedComponent: null,
    canvasConfigForm: canvasConfigForm,
    schema: cloneDeep(schema),
    indicator: {
      containerType: 'canvas', // 'canvas' | 'layout'
      layoutDirection: 'vertical', // 'horizontal' | 'vertical'
      nestedLevel: 0, // 嵌套层级
      type: 'none', // 'none' | 'placeholder' | 'container'
      display: 'none', // 显示状态
      lastValidIndex: -1,
      top: 0, // 垂直布局定位
      left: 0, // 水平布局定位
      width: 0,
      height: 0
    },
    actionBar: {
      visible: false,
      position: { x: 0, y: 0 }
    },
    /**
     * 组件注册中心
     * @type {{ [key in keyof TG_MATERIAL_CATEGORY]: TGComponentMeta[] }}
     */
    components: {
      basic: [
        {
          type: 'a-button',
          category: TG_MATERIAL_CATEGORY.BASIC,
          icon: '',
          preview: props => <Button {...props}>{props.slot}</Button>,
          defaultProps: {
            type: 'primary',
            slot: '按钮'
          },
          style: {},
          class: '',
          configForm: {
            fields: [
              {
                type: 'input',
                title: '按钮文本',
                label: '按钮文本',
                prop: 'slot',
                modelProp: 'value',
                component: () => Input
              },
              {
                type: 'select',
                title: '按钮类型',
                label: '按钮类型',
                prop: 'type',
                modelProp: 'value',
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
          category: TG_MATERIAL_CATEGORY.BASIC,
          icon: '',
          preview: props => <Input {...props} />,
          defaultProps: {
            placeholder: '请输入',
            readOnly: true
          },
          style: {},
          class: '',
          configForm: {
            fields: [
              {
                type: 'input',
                title: '文本框占位符',
                label: '占位符',
                prop: 'placeholder',
                modelProp: 'value',
                component: () => Input
              }
            ]
          }
        }
      ],
      template: [
        ProductCardMeta
      ],
      layout: [FlexLayoutMeta]
    }
  }),
  actions: {
    /**
     * 创建schema
     * @param componentMeta {TGComponentMeta} - 用来复制props的组件元数据
     * @param parentId {string} - 父组件ID
     * @returns {TGComponentSchema}
     */
    createComponentSchema(componentMeta, parentId) {
      return {
        id: `comp_${Date.now()}_${getUUID()}`,
        parentId,
        type: componentMeta.type,
        category: componentMeta.category,
        props: {
          ...componentMeta.defaultProps,
          style: {
            ...componentMeta.defaultProps.style,
            ...componentMeta.style
          }
        },
        children: componentMeta.category === TG_MATERIAL_CATEGORY.LAYOUT ? [] : undefined
      }
    },
    /**
     * 复制schema
     * @param [fromSchema] {TGComponentSchema} - 用来复制props的schema
     * @returns {TGComponentSchema}
     */
    copyLayoutComponentSchema(fromSchema) {
      const newSchema = cloneDeep(fromSchema)
      newSchema.id = `comp_${Date.now()}_${getUUID()}`

      const copy = schema => {
        if (schema.children?.length) {
          for (const child of schema.children) {
            child.id = `comp_${Date.now()}_${getUUID()}`
            child.parentId = schema.id

            copy(child, child.id)
          }
        }
      }

      copy(newSchema, newSchema.id)

      return newSchema
    },
    /**
     * 更新选中的组件元数据
     * @param newComponent {{
     *  id: string,
     *  type: string,
     *  category: TG_MATERIAL_CATEGORY
     * }} - 组件类型和物料类型（用来筛选组件元数据）
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
     * @param category {TG_MATERIAL_CATEGORY} - 物料类型
     * @returns {TGComponentMeta|null} 组件元数据
     */
    getComponentByType(type, category) {
      const component = this.components[category].find(component => component.type === type)

      if (component) {
        return cloneDeep(component)
      } else {
        return null
      }
    }
  }
})
