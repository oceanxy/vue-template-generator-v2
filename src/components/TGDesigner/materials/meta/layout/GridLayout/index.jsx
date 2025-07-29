import { Col, Flex, Row } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY, TG_MATERIAL_PREVIEW_TYPE } from '@/components/TGDesigner/materials'
import { range } from 'lodash'
import { formatBackgroundImage, styleWithUnits } from '@/components/TGDesigner/utils/style'
import getPropertyConfig, { predefinedProperties } from '@/components/TGDesigner/properties'
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
  canMoveInside: true,
  canCopyInside: true,
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
        getPropertyConfig('inputNumber', {
          title: '水平间距',
          label: '列间距',
          prop: 'gutterX',
          layout: 'half'
        }),
        getPropertyConfig('inputNumber', {
          title: '垂直间距',
          label: '行间距',
          prop: 'gutterY',
          layout: 'half'
        }),
        getPropertyConfig('inputNumber', {
          title: '行数，取值区间 [1,10]',
          label: '行数',
          prop: 'rowCount',
          layout: 'half',
          props: {
            min: 1,
            max: 10
          }
        }),
        getPropertyConfig('inputNumber', {
          title: '列数，取值区间 [1,4]',
          label: '列数',
          prop: 'columnCount',
          layout: 'half',
          props: {
            min: 1,
            max: 4
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

  style.backgroundImage = formatBackgroundImage(style.backgroundImage)

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
