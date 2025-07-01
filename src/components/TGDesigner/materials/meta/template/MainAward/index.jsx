import getPropertyConfig from '@/components/TGDesigner/properties'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE, TG_MATERIAL_TEMPLATE_COMPONENT_ENUM } from '@/components/TGDesigner/materials'
import { Button, TypographyParagraph } from 'ant-design-vue'
import { computed, onMounted, ref, watchEffect } from 'vue'
import useStore from '@/composables/tgStore'
import { useRoute, useRouter } from 'vue-router'
import './index.scss'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'
import { omit } from 'lodash'

/**
 * 主奖项名称模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-template-main-award',
  category: TG_MATERIAL_CATEGORY.TEMPLATE,
  name: '主奖项',
  preview: props => {
    if (props.previewType !== TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      if (props.device === 'h5') {
        props.style.padding = '2rem 1rem'
        props.style.width = '100%'
      }

      return <MainAwardPreview {...props} />
    }

    return <IconFont type="icon-designer-material-main-award" />
  },
  defaultProps: {
    textStyle: {
      color: '#666666',
      fontSize: 14
    },
    titleStyle: {
      color: '#000000',
      fontSize: 24
    },
    descBackground: {
      backgroundColor: '#ffffff'
    },
    descStyle: {
      color: '#333333',
      fontSize: 14,
      lineHeight: 1.5
    },
    buttonStyle: {
      backgroundColor: '#b3d1ff',
      backgroundColorHover: '#9dc4ff',
      color: '#000000',
      fontSize: 20
    }
  },
  style: {
    width: '1200',
    height: '',
    backgroundColor: '',
    backgroundImage: '',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  class: '',
  configForm: [
    {
      label: '尺寸',
      items: [
        getPropertyConfig('input', {
          label: '宽度',
          title: '容器宽度（支持百分比和像素单位）',
          prop: 'width',
          props: {
            placeholder: '自适应',
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
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
      label: '背景',
      items: [
        getPropertyConfig('colorPicker', {
          label: '颜色',
          title: '背景颜色(background-color)',
          prop: 'backgroundColor'
        }),
        getPropertyConfig('input', {
          label: '图片',
          title: '背景图片(background-image)',
          prop: 'backgroundImage',
          props: {
            placeholder: '请输入图片地址',
            maxLength: 250,
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
          label: '图片尺寸',
          title: '背景图片尺寸(background-size)',
          prop: 'backgroundSize',
          props: {
            maxLength: 20,
            placeholder: '自动',
            allowClear: true
          }
        }),
        getPropertyConfig('input', {
          label: '图片位置',
          title: '背景图片位置(background-position)',
          prop: 'backgroundPosition',
          props: {
            maxLength: 20,
            allowClear: true
          }
        }),
        getPropertyConfig('select', {
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
    },
    {
      label: '标题',
      items: [
        getPropertyConfig('colorPicker', {
          label: '颜色',
          title: '颜色(color)',
          prop: 'titleStyle.color',
          props: {
            defaultValue: '#000000'
          }
        }),
        getPropertyConfig('inputNumber', {
          label: '字号',
          title: '字号(font-size)',
          prop: 'titleStyle.fontSize',
          props: {
            min: 12,
            max: 50
          }
        })
      ]
    },
    {
      label: '文本',
      items: [
        getPropertyConfig('colorPicker', {
          label: '颜色',
          title: '颜色(color)',
          prop: 'textStyle.color',
          props: {
            defaultValue: '#000000'
          }
        }),
        getPropertyConfig('inputNumber', {
          label: '字号',
          title: '字号(font-size)',
          prop: 'textStyle.fontSize',
          props: {
            min: 12,
            max: 50
          }
        })
      ]
    },
    {
      label: '简介',
      items: [
        getPropertyConfig('colorPicker', {
          label: '背景颜色',
          title: '背景颜色(background-color)',
          prop: 'descBackground.backgroundColor',
          props: {
            defaultValue: '#ffffff'
          }
        }),
        getPropertyConfig('colorPicker', {
          label: '颜色',
          title: '颜色(color)',
          prop: 'descStyle.color',
          props: {
            defaultValue: '#333333'
          }
        }),
        getPropertyConfig('inputNumber', {
          label: '字号',
          title: '字号(font-size)',
          prop: 'descStyle.fontSize',
          props: {
            min: 12,
            max: 50
          }
        }),
        getPropertyConfig('input', {
          label: '行高',
          title: '行高(line-height)',
          prop: 'descStyle.lineHeight',
          props: {
            placeholder: '默认',
            allowClear: true
          }
        })
      ]
    },
    {
      label: '按钮',
      items: [
        getPropertyConfig('colorPicker', {
          label: '背景颜色',
          title: '背景颜色(background-color)',
          prop: 'buttonStyle.backgroundColor',
          props: {
            defaultValue: '#b3d1ff'
          }
        }),
        getPropertyConfig('colorPicker', {
          label: '背景悬浮颜色',
          title: '鼠标悬浮时的背景颜色(background-color)',
          prop: 'buttonStyle.backgroundColorHover',
          props: {
            defaultValue: '#9dc4ff'
          }
        }),
        getPropertyConfig('colorPicker', {
          label: '颜色',
          title: '颜色(color)',
          prop: 'buttonStyle.color',
          props: {
            defaultValue: '#000000'
          }
        }),
        getPropertyConfig('inputNumber', {
          label: '字号',
          title: '字号(font-size)',
          prop: 'buttonStyle.fontSize',
          props: {
            min: 12,
            max: 50
          }
        })
      ]
    }
  ]
}

export const MainAwardPreview = {
  name: 'MainAward',
  props: ['previewType', 'style', 'textStyle', 'titleStyle', 'descStyle', 'descBackground', 'buttonStyle'],
  setup(props, { attrs }) {
    const store = useStore('portal')
    const route = useRoute()
    const router = useRouter()
    const search = computed(() => store.search)
    const data = ref({
      title: '｛主奖项名称｝',
      sceneYear: '{创办时间}',
      childrenName: '｛子奖项名称｝',
      organizer: '{主办单位}',
      abstractDesc: '{简介}'
    })

    const style = ref({})
    const btnTargetRoute = computed(() => data.value.judgeButton?.buttonRouter)
    const btnTargetPageId = computed(() => data.value.judgeButton?.relScenePageId)
    const previewFlag = computed(() => store.search.previewFlag)

    watchEffect(() => {
      let bgImg = { backgroundImage: '' }

      if (props.style.backgroundImage && !props.style.backgroundImage.startsWith('url(')) {
        bgImg = { backgroundImage: `url(${props.style.backgroundImage})` }
      }

      style.value = {
        ...props.style,
        ...bgImg
      }
    })

    onMounted(async () => {
      if (
        props.previewType === TG_MATERIAL_PREVIEW_TYPE.PREVIEW ||
        props.previewType === TG_MATERIAL_PREVIEW_TYPE.PORTAL
      ) {
        const res = await store.getDetails({
          apiName: 'getTemplateComponentData',
          params: {
            sceneConfigId: search.value.sceneConfigId || route.params.sceneConfigId,
            param: TG_MATERIAL_TEMPLATE_COMPONENT_ENUM.PZMARK
          },
          setValue(data) {
            return false
          },
          setLoading(isLoading) {

          }
        })

        if (res.status) {
          data.value = res?.data || {}
        }
      }
    })

    const handleToApply = async () => {
      if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.PORTAL) {
        store.search.pageId = btnTargetPageId.value
        store.search.pageRoute = btnTargetRoute.value

        await router.push({
          name: previewFlag.value ? 'PortalPagePreview' : 'PortalPage',
          params: { pageRoute: btnTargetRoute.value }
        })
      }
    }

    return () => {
      if (attrs.device === 'h5') {
        return (
          <div class={'tg-designer-main-award-h5'} style={style.value}>
            <div class="tg-main-award-header">
              <h1>{data.value.title}</h1>
              <p>创办时间：{data.value.sceneYear}</p>
              <p>子奖项：{data.value.childrenName}</p>
              <p>主办单位：{data.value.organizer}</p>
              <p>简介：{data.value.abstractDesc || '暂无简介'}</p>
            </div>
          </div>
        )
      }

      return (
        <div class="tg-designer-main-award" style={style.value}>
          <div
            class="tg-main-award-header"
            style={styleWithUnits(props.textStyle)}
          >
            <h1 style={styleWithUnits(props.titleStyle)}>{data.value.title}</h1>
            <p>创办时间：{data.value.sceneYear}</p>
            <p>子奖项：{data.value.childrenName}</p>
            <p>主办单位：{data.value.organizer}</p>
          </div>
          <div class="tg-main-award-content">
            <div
              class="tg-main-award-description"
              style={styleWithUnits({
                backgroundColor: props.descBackground.backgroundColor
              })}
            >
              <h2>简介</h2>
              <TypographyParagraph
                content={data.value.abstractDesc || '暂无简介'}
                ellipsis={{ rows: 4 }}
                style={styleWithUnits(props.descStyle)}
              />
            </div>
            <div
              class="tg-main-award-button"
              style={{ '--tg-designer-main-award-color-hover': props.buttonStyle?.backgroundColorHover }}
            >
              <Button
                disabled={!btnTargetRoute.value}
                onClick={handleToApply}
                style={styleWithUnits(omit(props.buttonStyle, 'backgroundColorHover'))}
              >
                去申报
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }
}
