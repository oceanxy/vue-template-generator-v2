/**
 * @typedef {Object} TGSchema
 * @property {string} version - 版本号
 * @property {TGCanvas} canvas - 画布配置
 * @property {TGComponentSchema[]} components - 组件集合
 */

/**
 * @typedef {Object} TGComponentSchema
 * @property {string} id - 组件唯一标识符
 * @property {string} [parentId] - 父级组件ID，目前只有布局组件中的子组件需要用到
 * @property {string} type - 组件类型
 * @property {TG_MATERIAL_CATEGORY} category - 物料类型
 * @property {Object} props - 组件props
 * @property {TGComponentSchema[]} [children] - 子组件集合（仅布局组件需要）
 */

import getPropertyField from '../properties'

/**
 * 默认schema
 * @type {TGSchema}
 */
export const schema = {
  version: '1.0',
  components: [],
  canvas: {
    class: '',
    style: {
      width: '100%',
      height: '',
      padding: 15,
      margin: 0,
      gap: 8,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      backgroundColor: '',
      backgroundImage: '',
      backgroundSize: '',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
}

/**
 * @type {TGComponentMeta[]}
 */
export const canvasConfigForm = {
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
