import getPropertyField from '@/components/TGDesigner/properties'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE, TG_MATERIAL_TEMPLATE_COMPONENT_ENUM } from '@/components/TGDesigner/materials'
import { Button, Image, TypographyParagraph } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import useStore from '@/composables/tgStore'
import { useRoute, useRouter } from 'vue-router'
import { range } from 'lodash'
import { defaultImg } from '@/components/TGDesigner/assets/defaultImg'
import './index.scss'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'

/**
 * 奖项动态模板组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-template-award-dynamics',
  category: TG_MATERIAL_CATEGORY.TEMPLATE,
  name: '奖项动态',
  preview: props => {
    if (props.previewType !== TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
      if (props.device === 'h5') {
        props.style.width = '100%'
        props.style.padding = '2rem 1rem'
      }

      return <AwardDynamics {...props} />
    }

    return <IconFont type="icon-designer-material-award-dynamics" />
  },
  defaultProps: {
    highlightFirstItem: true,
    titleStyle: {
      color: '#333333',
      fontSize: 24
    },
    textStyle: {
      color: '#666666',
      fontSize: 14
    },
    itemTitleStyle: {
      color: '#333333',
      fontSize: 16
    },
    itemTextStyle: {
      color: '#999999',
      fontSize: 14
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
          getPropertyField('switch', {
            label: '突出第一条数据',
            title: '突出展示第一条数据',
            prop: 'highlightFirstItem',
            modelProp: 'checked'
          })
        ]
      },
      {
        label: '标题',
        items: [
          getPropertyField('colorPicker', {
            label: '颜色',
            title: '颜色(color)',
            prop: 'titleStyle.color',
            props: {
              defaultValue: '#000000'
            }
          }),
          getPropertyField('inputNumber', {
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
        label: '副标题',
        items: [
          getPropertyField('colorPicker', {
            label: '颜色',
            title: '颜色(color)',
            prop: 'textStyle.color',
            props: {
              defaultValue: '#000000'
            }
          }),
          getPropertyField('inputNumber', {
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
        label: '次级标题',
        items: [
          getPropertyField('colorPicker', {
            label: '颜色',
            title: '颜色(color)',
            prop: 'itemTitleStyle.color',
            props: {
              defaultValue: '#000000'
            }
          }),
          getPropertyField('inputNumber', {
            label: '字号',
            title: '字号(font-size)',
            prop: 'itemTitleStyle.fontSize',
            props: {
              min: 12,
              max: 50
            }
          })
        ]
      },
      {
        label: '次级文本',
        items: [
          getPropertyField('colorPicker', {
            label: '颜色',
            title: '颜色(color)',
            prop: 'itemTextStyle.color',
            props: {
              defaultValue: '#000000'
            }
          }),
          getPropertyField('inputNumber', {
            label: '字号',
            title: '字号(font-size)',
            prop: 'itemTextStyle.fontSize',
            props: {
              min: 12,
              max: 50
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

export const AwardDynamics = {
  name: 'AwardDynamics',
  props: ['previewType', 'highlightFirstItem', 'titleStyle', 'textStyle', 'itemTitleStyle', 'itemTextStyle'],
  setup(props, { attrs }) {
    const store = useStore('portal')
    const route = useRoute()
    const router = useRouter()
    const search = computed(() => store.search)
    const data = ref({
      title: '奖项动态',
      abstractDesc: '了解更多动态资讯，点击查看更多动态',
      componentSearchRspList: range(0, 5).map(item => ({
        id: item,
        title: '奖项动态',
        abstractDesc: '奖项动态详情',
        coverImg: ''
      }))
    })

    const previewFlag = computed(() => store.search.previewFlag)
    const btnTargetRoute = computed(() => data.value.articleButton?.buttonRouter)
    const btnTargetPageId = computed(() => data.value.articleButton?.relScenePageId)

    onMounted(async () => {
      if (
        props.previewType === TG_MATERIAL_PREVIEW_TYPE.PREVIEW ||
        props.previewType === TG_MATERIAL_PREVIEW_TYPE.PORTAL
      ) {
        const res = await store.getDetails({
          apiName: 'getTemplateComponentData',
          params: {
            sceneConfigId: search.value.sceneConfigId || route.params.sceneConfigId,
            param: TG_MATERIAL_TEMPLATE_COMPONENT_ENUM.ARTICLE
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

    async function handleMoreClick() {
      if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.PORTAL) {
        store.search.pageId = btnTargetPageId.value
        store.search.pageRoute = btnTargetRoute.value

        await router.push({
          name: previewFlag.value ? 'PortalPagePreview' : 'PortalPage',
          params: { pageRoute: btnTargetRoute.value }
        })
      }
    }

    function RenderItem(_props) {
      const dataSource = _props.dataSource
      let coverImg = dataSource.coverImg || ''

      if (coverImg) {
        coverImg = JSON.parse(dataSource.coverImg)

        if (Array.isArray(coverImg)) {
          coverImg = coverImg[0]
        }
      }

      return (
        <div class="tg-award-dynamics-item">
          <Image
            preview={false}
            src={coverImg}
            fallback={defaultImg}
          />
          <div class="tg-award-dynamics-item-content">
            <div
              class="tg-adc-title"
              style={styleWithUnits(props.itemTitleStyle)}
            >
              {dataSource.title}
            </div>
            <TypographyParagraph
              class="tg-adc-content"
              ellipsis={{ rows: 2 }}
              content={dataSource.abstractDesc}
              style={styleWithUnits(props.itemTextStyle)}
            />
          </div>
        </div>
      )
    }

    function RenderMoreButton() {
      return (
        <div class="tg-award-dynamics-more">
          <Button
            type="primary"
            ghost
            size="large"
            onClick={handleMoreClick}
          >
            资讯动态
          </Button>
        </div>
      )
    }

    const RenderItems = () => {
      if (props.highlightFirstItem && data.value.componentSearchRspList.length > 1) {
        const firstItem = data.value.componentSearchRspList[0]
        const otherItems = data.value.componentSearchRspList.slice(1).slice(0, 3)

        return (
          <div class="tg-award-dynamics-content-highlight">
            <RenderItem dataSource={firstItem} class="tg-award-dynamics-item-first" />
            <div class="tg-award-dynamics-items-other">
              {
                otherItems.map(item =>
                  <RenderItem key={item.id} dataSource={item} />
                )
              }
            </div>
          </div>
        )
      } else {
        return (
          <div class="tg-award-dynamics-content">
            {
              data.value.componentSearchRspList?.slice(0, 4).map(item =>
                <RenderItem key={item.id} dataSource={item} />
              )
            }
          </div>
        )
      }
    }

    return () => {
      if (attrs.device === 'h5') {
        return (
          <div class={'tg-designer-award-dynamics-h5'}>
            <div>
              <h2>{data.value.title}</h2>
              <div class="tg-award-dynamics-description">{data.value.abstractDesc}</div>
            </div>
            <RenderItems />
          </div>
        )
      }

      return (
        <div class="tg-designer-award-dynamics">
          <div class="tg-award-dynamics-header">
            <div class="tg-award-dynamics-title">
              <span style={styleWithUnits(props.titleStyle)}>{data.value.title}</span>
              <RenderMoreButton />
            </div>
            <div
              class="tg-award-dynamics-description"
              style={styleWithUnits(props.textStyle)}
            >
              {data.value.abstractDesc}
            </div>
          </div>
          <RenderItems />
        </div>
      )
    }
  }
}
