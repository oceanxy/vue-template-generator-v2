import { defineStore } from 'pinia'
import { TG_MATERIAL_CATEGORY } from '../materials'
import FlexLayoutMeta from '../materials/meta/FlexLayout'
import { cloneDeep } from 'lodash'
import { canvasConfigForm, schema } from '../schemas'
import { getUUID } from '@/utils/utilityFunction'
import BasicMaterials from '../materials/meta/BasicMaterials'
import AwardDynamics from '../materials/meta/AwardDynamics'
import MainAward from '../materials/meta/MainAward'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    isSaving: false,
    selectedComponent: null,
    canvasConfigForm,
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
     * 物料组件注册
     * @type {{ [key in keyof TG_MATERIAL_CATEGORY]: TGComponentMeta[] }}
     */
    components: {
      basic: BasicMaterials,
      template: [
        MainAward,
        AwardDynamics
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
