import getPropertyConfig, { predefinedProperties } from '@/components/TGDesigner/properties'
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
    padding: '0 30',
    margin: 0,
    backgroundColor: '#0050b3',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  class: '',
  propConfigForm: propertyValues => [
    {
      label: '尺寸',
      items: [
        predefinedProperties.width(),
        predefinedProperties.height()
      ]
    },
    {
      label: '布局',
      items: [
        predefinedProperties.width({
          label: '内容宽度',
          title: 'Footer内展示内容区域容器的宽度（width）',
          prop: 'contentWidth',
          props: {
            placeholder: '90%'
          }
        }),
        predefinedProperties.padding(),
        predefinedProperties.margin()
      ]
    },
    {
      label: '背景',
      items: predefinedProperties.background(null, propertyValues)
    }
  ]
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
              'padding': '2rem 1rem'
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
