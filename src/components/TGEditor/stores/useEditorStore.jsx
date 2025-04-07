import { defineStore } from 'pinia'
import { Button, Col, Flex, Input, InputNumber, Row, Select, Switch } from 'ant-design-vue'
import { TG_COMPONENT_CATEGORY } from '../templateComponents'
import ProductCardMeta from '../templateComponents/meta/ProductCard'
import { cloneDeep } from 'lodash'
import TGColorPicker from '@/components/TGColorPicker'
import { schema } from '../schemas'

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
    isSaving: false,
    selectedComponent: null,
    canvasConfigForm: canvasConfigForm,
    schema: cloneDeep(schema),
    indicator: {
      type: 'none', // 'none' | 'placeholder' | 'container'
      display: 'none', // 显示状态
      top: '0px', // 位置
      lastValidIndex: -1
    },
    actionBar: {
      visible: false,
      position: { x: 0, y: 0 }
    },
    /**
     * 组件注册中心
     * @type {{ [key in keyof TG_COMPONENT_CATEGORY]: TGComponentMeta[] }}
     */
    components: {
      basic: [
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
      layout: [
        {
          type: 'a-flex-container',
          category: TG_COMPONENT_CATEGORY.LAYOUT,
          icon: '',
          preview: props => (
            <Flex
              gap={props.gap}
              vertical={props.vertical}
              style={{
                padding: '8px',
                background: '#f0f2f5',
                minHeight: '80px',
                border: '1px dashed #d9d9d9'
              }}
            >
              <div style={{ flex: 1, background: '#d9d9d9', height: '20px' }} />
              <div style={{ flex: 1, background: '#bfbfbf', height: '20px' }} />
            </Flex>
          ),
          defaultProps: {
            gap: 'middle',
            vertical: false,
            wrap: false
          },
          configForm: {
            fields: [
              {
                type: 'select',
                title: '排列方向',
                label: '方向',
                prop: 'vertical',
                modelProp: 'checked',
                component: () => Switch,
                props: {
                  checkedValue: true,
                  unCheckedValue: false
                }
              },
              {
                type: 'select',
                title: '间距大小',
                label: '间距',
                prop: 'gap',
                modelProp: 'value',
                component: () => Select,
                props: {
                  options: [
                    { label: '小', value: 'small' },
                    { label: '中', value: 'middle' },
                    { label: '大', value: 'large' }
                  ]
                }
              }
            ]
          }
        },
        {
          type: 'a-grid-container',
          category: TG_COMPONENT_CATEGORY.LAYOUT,
          preview: props => (
            <Row
              gutter={[props.gutterX || 16, props.gutterY || 16]}
              style={{
                minHeight: '80px',
                background: '#f0f2f5',
                padding: '8px'
              }}
            >
              <Col span={12}>
                <div style={{ background: '#d9d9d9', height: '100%' }} />
              </Col>
              <Col span={12}>
                <div style={{ background: '#bfbfbf', height: '100%' }} />
              </Col>
            </Row>
          ),
          defaultProps: {
            gutterX: 16,
            gutterY: 16
          },
          configForm: {
            fields: [
              {
                type: 'number',
                title: '水平间距',
                label: '列间距',
                prop: 'gutterX',
                modelProp: 'value',
                component: () => InputNumber
              },
              {
                type: 'number',
                title: '垂直间距',
                label: '行间距',
                prop: 'gutterY',
                modelProp: 'value',
                component: () => InputNumber
              }
            ]
          }
        },
        {
          type: 'a-grid-row',
          category: TG_COMPONENT_CATEGORY.LAYOUT,
          preview: props => (
            <Row
              gutter={[16, 16]}
              style={{
                minHeight: '60px',
                background: '#f0f2f5',
                padding: '8px'
              }}
            >
              <Col span={12}>
                <div style={{ background: '#d9d9d9', height: '100%' }} />
              </Col>
              <Col span={12}>
                <div style={{ background: '#bfbfbf', height: '100%' }} />
              </Col>
            </Row>
          ),
          defaultProps: {
            gutter: [16, 16]
          },
          configForm: {
            fields: [
              {
                type: 'number',
                title: '列间距',
                label: '水平间距',
                prop: 'gutter.0',
                modelProp: 'value',
                component: () => InputNumber
              },
              {
                type: 'number',
                title: '行间距',
                label: '垂直间距',
                prop: 'gutter.1',
                modelProp: 'value',
                component: () => InputNumber
              }
            ]
          }
        },
        {
          type: 'a-grid-col',
          category: TG_COMPONENT_CATEGORY.LAYOUT,
          preview: (props) => (
            <Col
              span={props.span}
              style={{
                background: '#f0f2f5',
                border: '2px dashed #d9d9d9',
                minHeight: '40px'
              }}
            />
          ),
          defaultProps: {
            span: 12
          },
          configForm: {
            fields: [
              {
                type: 'number',
                title: '栅格占位',
                label: '占位列数',
                prop: 'span',
                modelProp: 'value',
                component: () => InputNumber,
                props: {
                  min: 1,
                  max: 24
                }
              }
            ]
          }
        }
      ]
    }
  }),
  actions: {
    /**
     * 创建组件schema
     * @param componentMeta {TGComponentMeta} - 用来复制props的组件元数据
     * @param [formSchema] {TGComponentSchema} - 用来复制props的schema
     * @returns {TGComponentSchema}
     */
    createComponentSchema(componentMeta, formSchema) {
      let props = {}

      if (formSchema) {
        props = cloneDeep(formSchema.props)
      }

      return {
        id: `comp_${Date.now()}`,
        type: componentMeta.type,
        category: componentMeta.category,
        props: { ...componentMeta.defaultProps, ...props }
      }
    },
    /**
     * 更新选中的组件元数据
     * @param newComponent {{
     *  id: string,
     *  type: string,
     *  category: TG_COMPONENT_CATEGORY
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
     * @param category {TG_COMPONENT_CATEGORY} - 物料类型
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
