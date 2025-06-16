import getPropertyField from '@/components/TGDesigner/properties'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'
import { QRCode } from 'ant-design-vue'
import { ref, watch } from 'vue'
import './assets/styles/index.scss'

/**
 * Footer模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-layout-footer',
  category: TG_MATERIAL_CATEGORY.LAYOUT,
  name: '页尾',
  preview: props => {
    if (props.previewType !== TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      return <Footer {...props} />
    }

    return <IconFont type="icon-designer-footer" />
  },
  defaultProps: {
    contentWidth: '90%'
  },
  style: {
    width: '100%',
    height: '',
    paddingTop: 30,
    paddingBottom: 30,
    margin: 0,
    backgroundColor: '#0050b3',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
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
              placeholder: '自适应',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '高度',
            title: '容器高度（支持像素单位，默认自适应）',
            prop: 'height',
            props: {
              placeholder: '自适应',
              allowClear: true
            }
          })
        ]
      },
      {
        label: '布局',
        items: [
          getPropertyField('input', {
            label: '内容宽度',
            title: 'Header内展示内容区域容器的宽度',
            prop: 'contentWidth',
            props: {
              placeholder: '100%',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '上边距',
            title: '头部容器的上边距(padding-top/padding-bottom)',
            prop: 'paddingTop',
            props: {
              placeholder: '30px',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '下边距',
            title: '头部容器的下边距(padding-bottom)',
            prop: 'paddingBottom',
            props: {
              placeholder: '30px',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '外边距',
            title: '画布的外边距（margin）',
            prop: 'margin',
            props: {
              placeholder: '0px',
              allowClear: true
            }
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
              maxLength: 250,
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '图片尺寸',
            title: '背景图片尺寸(background-size)',
            prop: 'backgroundSize',
            props: {
              maxLength: 20,
              placeholder: '自动',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '图片位置',
            title: '背景图片位置(background-position)',
            prop: 'backgroundPosition',
            props: {
              maxLength: 20,
              allowClear: true
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
}

export const Footer = {
  name: 'Footer',
  props: ['contentWidth', 'style', 'previewType', 'children'],
  setup(props, { attrs }) {
    const style = ref({})

    watch(() => props.style, val => {
      style.value = styleWithUnits(val)
    }, { immediate: true })

    return () => {
      if (attrs.device === 'h5') {
        return (
          <div
            class="tg-designer-layout-footer"
            style={{
              ...style.value,
              'padding': '2rem 1rem',
            }}
          >
            <div class="tg-designer-layout-footer-content">
              <div>
                <div class="tg-designer-layout-footer-content-title">
                  <img
                    src="https://oss.bj-dx-dzqywjd-hlw-icp.inspurcloudoss.com:6063/tygzt01/upload/cServ/c-serv/5735606129182378245.png"
                    alt=""
                  />
                </div>
                <div>中国科学技术协会版权所有 京ICP 备 10216604号-4 海淀分局备案 1101084647</div>
                <div>中国科学技术协会主办</div>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div
          class="tg-designer-layout-footer"
          style={style.value}
        >
          <div
            class="tg-designer-layout-footer-content"
            style={styleWithUnits({ width: props.contentWidth || '100%' })}
          >
            <div>
              <div class="tg-designer-layout-footer-content-title">
                <img
                  src="https://oss.bj-dx-dzqywjd-hlw-icp.inspurcloudoss.com:6063/tygzt01/upload/cServ/c-serv/5735606129182378245.png"
                  alt=""
                />
              </div>
              <div>中国科学技术协会版权所有 京ICP 备 10216604号-4 海淀分局备案 1101084647</div>
              <div>中国科学技术协会主办</div>
            </div>
            <div>
              <QRCode value={''} color={'#ffffff'} />
            </div>
          </div>
        </div>
      )
    }
  }
}
