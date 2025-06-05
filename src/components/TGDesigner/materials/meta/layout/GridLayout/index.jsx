import { Col, Flex, Row } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { range } from 'lodash'
import { styleWithUnits } from '@/components/TGDesigner/utils/style'
import getPropertyField from '@/components/TGDesigner/properties'
import './index.scss'

/**
 * 组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-layout-grid',
  category: TG_MATERIAL_CATEGORY.LAYOUT,
  name: '网格容器',
  preview: GridLayoutPreview,
  defaultProps: {
    gutterX: 8,
    gutterY: 8,
    wrap: false,
    justify: 'center',
    style: {},
    rowCount: 2,
    columnCount: 2
  },
  style: {
    width: '100%',
    height: '',
    padding: 0,
    margin: 0,
    border: '',
    background: '',
    backgroundColor: '',
    backgroundImage: '',
    // backgroundImage: 'https://aliyuncdn.antdv.com/vue.png',
    backgroundSize: '',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  children: [],
  configForm: {
    fields: [
      {
        label: '尺寸',
        items: [
          getPropertyField('input', {
            label: '宽度',
            title: '容器宽度(支持百分比和像素单位)',
            prop: 'width',
            props: {
              placeholder: '自适应',
              allowClear: true
            }
          }),
          getPropertyField('input', {
            label: '高度',
            title: '容器高度(支持像素单位，默认自适应)',
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
          getPropertyField('inputNumber', {
            title: '水平间距',
            label: '列间距',
            prop: 'gutterX'
          }),
          getPropertyField('inputNumber', {
            title: '垂直间距',
            label: '行间距',
            prop: 'gutterY'
          }),
          getPropertyField('inputNumber', {
            title: '行数，取值区间 [1,10]',
            label: '行数',
            prop: 'rowCount',
            props: {
              min: 1,
              max: 10
            }
          }),
          getPropertyField('inputNumber', {
            title: '列数，取值区间 [1,4]',
            label: '列数',
            prop: 'columnCount',
            props: {
              min: 1,
              max: 4
            }
          }),
          getPropertyField('input', {
            label: '内边距',
            title: '容器的内边距(padding)',
            prop: 'padding',
            props: {
              placeholder: '0px',
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

export function GridLayoutPreview(props) {
  const isInMaterial = props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL_PREVIEW
  const rowProps = {
    gutter: [props.gutterX, props.gutterY],
    wrap: props.wrap,
    justify: props.justify,
    style: { width: '100%' }
  }

  const colStyle = {}
  let rowCount = props.rowCount
  let columnCount = props.columnCount

  const style = styleWithUnits(props.style)

  if (style.backgroundImage && !style.backgroundImage.startsWith('url(')) {
    style.backgroundImage = `url(${style.backgroundImage})`
  }

  if (isInMaterial) {
    rowCount = 2
    columnCount = 2
    style.backgroundImage = 'unset'
    style.padding = '8px'
  }

  const findChild = (rowIdx, colIdx) => {
    return props.children.find(child => child.props['data-cell-position'] === `${rowIdx}-${colIdx}`)
  }

  if (props.previewType === TG_MATERIAL_PREVIEW_TYPE.MATERIAL) {
    return <IconFont type="icon-designer-material-grid-layout" />
  }

  return (
    <div class={'tg-designer-layout-grid-container'} style={style}>
      <Flex
        vertical
        wrap="wrap"
        justify="center"
        align="center"
        gap={props.gutterY}
      >
        {
          range(0, rowCount, 1).map(rowIdx => (
            <Row {...rowProps} key={rowIdx}>
              {
                range(0, columnCount, 1).map(colIdx => (
                  <Col span={24 / columnCount} key={colIdx}>
                    {
                      isInMaterial
                        ? <div style={{ background: '#d5d5d5', minHeight: '16px' }} />
                        : (
                          <div
                            style={colStyle}
                            class={'tg-designer-layout-container grid'}
                            data-cell-position={`${rowIdx}-${colIdx}`}
                          >
                            {findChild(rowIdx, colIdx)}
                          </div>
                        )
                    }
                  </Col>
                ))
              }
            </Row>
          ))
        }
      </Flex>
    </div>
  )
}
