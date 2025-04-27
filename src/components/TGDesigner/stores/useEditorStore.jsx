import { defineStore } from 'pinia'
import { Button, Divider, Image, Input, TypographyText } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY } from '../materials'
import ProductCardMeta from '../materials/meta/ProductCard'
import FlexLayoutMeta from '../materials/meta/FlexLayout'
import { cloneDeep } from 'lodash'
import { schema } from '../schemas'
import { getUUID } from '@/utils/utilityFunction'
import getPropertyField from '@/components/TGDesigner/properties'

/**
 * @type TGComponentMeta[]
 */
const canvasConfigForm = {
  fields: [
    {
      label: '尺寸',
      items: [
        getPropertyField('input', {
          label: '宽度',
          title: '画布宽度（width）',
          prop: 'width'
        }),
        getPropertyField('input', {
          label: '高度',
          title: '画布高度（height）',
          prop: 'height',
          props: {
            placeholder: '自适应'
          }
        })
      ]
    },
    {
      label: '布局',
      items: [
        getPropertyField('input', {
          label: '组件间距',
          title: '组件之间的间隔距离（gap）',
          prop: 'gap',
          props: {
            placeholder: '0px'
          }
        }),
        getPropertyField('input', {
          label: '内边距',
          title: '画布的内边距（padding）',
          prop: 'padding',
          props: {
            placeholder: '0px'
          }
        }),
        getPropertyField('input', {
          label: '外边距',
          title: '画布的外边距（margin）',
          prop: 'margin',
          props: {
            placeholder: '0px'
          }
        }),
        getPropertyField('select', {
          label: '水平',
          title: '水平对齐方式（align-items）',
          prop: 'alignItems'
        }),
        getPropertyField('select', {
          label: '垂直',
          title: '垂直对齐方式（justify-content）',
          prop: 'justifyContent'
        })
      ]
    },
    {
      label: '背景',
      items: [
        getPropertyField('colorPicker', {
          label: '颜色',
          title: '背景颜色(background-color)',
          prop: 'backgroundColor'
        }),
        getPropertyField('input', {
          label: '图片',
          title: '背景图片(background-image)',
          prop: 'backgroundImage',
          props: {
            placeholder: '请输入图片地址',
            maxLength: 250
          }
        }),
        getPropertyField('input', {
          label: '图片尺寸',
          title: '背景图片尺寸(background-size)',
          prop: 'backgroundSize',
          props: {
            maxLength: 20,
            placeholder: '自动'
          }
        }),
        getPropertyField('input', {
          label: '图片位置',
          title: '背景图片位置(background-position)',
          prop: 'backgroundPosition',
          props: {
            maxLength: 20
          }
        }),
        getPropertyField('select', {
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
          style: {
            width: '',
            height: ''
          },
          class: '',
          configForm: {
            fields: [
              {
                label: '尺寸',
                items: [
                  getPropertyField('input', {
                    label: '宽度',
                    title: '容器宽度（支持百分比和像素单位）',
                    prop: 'width',
                    props: {
                      placeholder: '自适应'
                    }
                  }),
                  getPropertyField('input', {
                    label: '高度',
                    title: '容器高度（支持像素单位，默认自适应）',
                    prop: 'height',
                    props: {
                      placeholder: '自适应'
                    }
                  })
                ]
              },
              {
                label: '数据',
                items: [
                  getPropertyField('input', {
                    title: '按钮文本',
                    label: '按钮文本',
                    prop: 'slot'
                  })
                ]
              },
              {
                label: '外观',
                items: [
                  getPropertyField('select', {
                    title: '按钮类型',
                    label: '按钮类型',
                    prop: 'type',
                    props: {
                      options: [
                        { label: '主要按钮', value: 'primary' },
                        { label: '次级按钮', value: 'default' },
                        { label: '虚线按钮', value: 'dashed' }
                      ]
                    }
                  })
                ]
              }
            ]
          }
        },
        {
          type: 'a-input',
          category: TG_MATERIAL_CATEGORY.BASIC,
          icon: '',
          preview: props => <Input {...props} readonly={props.previewType !== 'preview'} />,
          defaultProps: {
            placeholder: '请输入'
          },
          style: {
            width: '100%'
          },
          class: '',
          configForm: {
            fields: [
              {
                label: '尺寸',
                items: [
                  getPropertyField('input', {
                    label: '宽度',
                    title: '容器宽度（支持百分比和像素单位）',
                    prop: 'width',
                    props: {
                      placeholder: '自适应'
                    }
                  }),
                  getPropertyField('input', {
                    label: '高度',
                    title: '容器高度（支持像素单位，默认自适应）',
                    prop: 'height',
                    props: {
                      placeholder: '自适应'
                    }
                  })
                ]
              },
              {
                label: '外观',
                items: [
                  getPropertyField('input', {
                    title: '文本框占位符',
                    label: '占位符',
                    prop: 'placeholder'
                  })
                ]
              }
            ]
          }
        },
        {
          type: 'a-typography-text',
          category: TG_MATERIAL_CATEGORY.BASIC,
          icon: '',
          preview: props => <TypographyText {...props}>{props.slot}</TypographyText>,
          defaultProps: {
            slot: '这里是文本内容...',
            underline: false,
            type: '',
            strong: false,
            mark: false,
            delete: false,
            ellipsis: false
          },
          style: {
            width: 'auto',
            height: 'auto',
            fontSize: 14
          },
          class: '',
          configForm: {
            fields: [
              {
                label: '尺寸',
                items: [
                  getPropertyField('input', {
                    label: '宽度',
                    title: '容器宽度（支持百分比和像素单位）',
                    prop: 'width',
                    props: {
                      placeholder: '自适应'
                    }
                  }),
                  getPropertyField('input', {
                    label: '高度',
                    title: '容器高度（支持像素单位，默认自适应）',
                    prop: 'height',
                    props: {
                      placeholder: '自适应'
                    }
                  })
                ]
              },
              {
                label: '数据',
                items: [
                  getPropertyField('input', {
                    title: '文本内容（最大长度限制100）',
                    label: '文本内容',
                    prop: 'slot',
                    props: {
                      maxLength: 100,
                      placeholder: '无'
                    }
                  })
                ]
              },
              {
                label: '外观',
                items: [
                  getPropertyField('inputNumber', {
                    title: '字号',
                    label: '字号',
                    prop: 'fontSize'
                  }),
                  getPropertyField('switch', {
                    title: '下划线',
                    label: '下划线',
                    prop: 'underline',
                    modelProp: 'checked'
                  }),
                  getPropertyField('select', {
                    title: '文本类型',
                    label: '文本类型',
                    prop: 'type',
                    props: {
                      options: [
                        { label: '主文本', value: '' },
                        { label: '次级文本', value: 'secondary' },
                        { label: '成功', value: 'success' },
                        { label: '警告', value: 'warning' },
                        { label: '失败', value: 'danger' }
                      ]
                    }
                  }),
                  getPropertyField('switch', {
                    title: '加粗',
                    label: '加粗',
                    prop: 'strong',
                    modelProp: 'checked'
                  }),
                  getPropertyField('switch', {
                    title: '标记',
                    label: '标记',
                    prop: 'mark',
                    modelProp: 'checked'
                  }),
                  getPropertyField('switch', {
                    title: '删除线',
                    label: '删除线',
                    prop: 'delete',
                    modelProp: 'checked'
                  }),
                  getPropertyField('switch', {
                    title: '自动溢出省略（需要配合宽度使用，当文本内容超过设置的宽度后生效）',
                    label: '自动溢出省略',
                    prop: 'ellipsis',
                    modelProp: 'checked'
                  })
                ]
              }
            ]
          }
        },
        {
          type: 'a-divider',
          category: TG_MATERIAL_CATEGORY.BASIC,
          icon: '',
          preview: props => <Divider {...props}>{props.slot}</Divider>,
          defaultProps: {
            slot: '分割线',
            dashed: false,
            orientation: 'center',
            plain: false,
            type: 'horizontal'
          },
          style: {
            width: '100%',
            height: 'auto'
          },
          class: '',
          configForm: {
            fields: [
              {
                label: '尺寸',
                items: [
                  getPropertyField('input', {
                    label: '宽度',
                    title: '容器宽度（支持百分比和像素单位）',
                    prop: 'width',
                    props: {
                      placeholder: '自适应'
                    }
                  }),
                  getPropertyField('input', {
                    label: '高度',
                    title: '容器高度（支持像素单位，默认自适应）',
                    prop: 'height',
                    props: {
                      placeholder: '自适应'
                    }
                  })
                ]
              },
              {
                label: '数据',
                items: [
                  getPropertyField('input', {
                    title: '分割线标题（显示在线条上的文本内容，最大长度限制10）',
                    label: '分割线标题',
                    prop: 'slot',
                    props: {
                      maxLength: 10,
                      placeholder: '无'
                    }
                  })
                ]
              },
              {
                label: '外观',
                items: [
                  getPropertyField('switch', {
                    title: '虚线',
                    label: '虚线',
                    prop: 'dashed',
                    modelProp: 'checked'
                  }),
                  getPropertyField('radioGroup', {
                    title: '分割线标题位置',
                    label: '标题位置',
                    prop: 'orientation',
                    props: {
                      options: [
                        { label: '左侧', value: 'left' },
                        { label: '中间', value: 'center' },
                        { label: '右侧', value: 'right' }
                      ]
                    }
                  }),
                  getPropertyField('switch', {
                    title: '普通文本',
                    label: '普通文本',
                    prop: 'plain',
                    modelProp: 'checked'
                  }),
                  getPropertyField('radioGroup', {
                    title: '分割线的方向',
                    label: '方向',
                    prop: 'type',
                    props: {
                      options: [
                        { label: '水平', value: 'horizontal' },
                        { label: '垂直', value: 'vertical' }
                      ]
                    }
                  })
                ]
              }
            ]
          }
        },
        {
          type: 'a-image',
          category: TG_MATERIAL_CATEGORY.BASIC,
          icon: '',
          preview: props => <Image {...props} />,
          defaultProps: {
            placeholder: true,
            preview: false,
            // src: 'https://aliyuncdn.antdv.com/vue.png',
            src: '',
            fallback: 'data:image/png;base64,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'
          },
          style: {
            width: 100,
            height: 100
          },
          class: 'tg-designer-basic-image',
          configForm: {
            fields: [
              {
                label: '尺寸',
                items: [
                  getPropertyField('inputNumber', {
                    label: '宽度',
                    title: '容器宽度（像素单位）',
                    prop: 'width',
                    props: {
                      placeholder: '自适应'
                    }
                  }),
                  getPropertyField('inputNumber', {
                    label: '高度',
                    title: '容器高度（像素单位）',
                    prop: 'height',
                    props: {
                      placeholder: '自适应'
                    }
                  })
                ]
              },
              {
                label: '数据',
                items: [
                  getPropertyField('input', {
                    label: '图片地址',
                    title: '图片地址（img标签支持的图片格式）',
                    prop: 'src',
                    props: {
                      placeholder: '图片地址',
                      maxLength: 100
                    }
                  })
                ]
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
      const markChildren = (schema) => {
        schema.__initialized = false
        schema.__animating = true

        if (schema.children) {
          schema.children.forEach(markChildren)
        }
      }

      const newSchema = {
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
        children: componentMeta.category === TG_MATERIAL_CATEGORY.LAYOUT ? [] : undefined,

        /**
         * 状态机逻辑
         * 新建组件：__animating=true，__initialized=false → 触发入场动画
         * 入场完成：__initialized=true，__animating=false → 可交互状态
         * 删除组件：__animating=true，__initialized=true → 触发离场动画
         */

        // 用于过渡动画的临时标记
        __initialized: false,
        __animating: true  // 初始状态标记为正在入场动画
      }

      markChildren(newSchema)
      return newSchema
    },
    /**
     * 复制schema
     * @param [fromSchema] {TGComponentSchema} - 用来复制props的schema
     * @returns {TGComponentSchema}
     */
    copyLayoutComponentSchema(fromSchema) {
      const newSchema = cloneDeep(fromSchema)
      newSchema.id = `comp_${Date.now()}_${getUUID()}`
      // 用于过渡动画的临时标记
      newSchema.__initialized = false
      newSchema.__animating = true

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
