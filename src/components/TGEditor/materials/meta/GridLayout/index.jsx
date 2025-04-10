import { Col, Flex, InputNumber, Row } from 'ant-design-vue'
import { TG_MATERIAL_CATEGORY } from '@/components/TGEditor/materials'
import { range } from 'lodash'
import { styleWithUnits } from '@/components/TGEditor/utils/style'

/**
 * 组件元数据
 * @type TGComponentMeta
 */
export default {
  type: 'tg-grid-layout',
  category: TG_MATERIAL_CATEGORY.LAYOUT,
  icon: '',
  preview: GridLayoutPreview,
  defaultProps: {
    gutterX: 8,
    gutterY: 8,
    wrap: false,
    justify: 'center',
    style: {
      background: '#f0f2f5',
      border: '1px dashed #d9d9d9',
      padding: 8
    },
    rowCount: 3,
    columnCount: 3
  },
  children: [],
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
      },
      {
        type: 'number',
        title: '行数，取值区间 [1,10]',
        label: '行数',
        prop: 'rowCount',
        modelProp: 'value',
        component: () => InputNumber,
        props: {
          min: 1,
          max: 10
        }
      },
      {
        type: 'number',
        title: '列数，取值区间 [1,4]',
        label: '列数',
        prop: 'columnCount',
        modelProp: 'value',
        component: () => InputNumber,
        props: {
          min: 1,
          max: 4
        }
      }
    ]
  }
}

export function GridLayoutPreview(props) {
  const isInCanvas = props.previewType === 'canvas'
  const rowProps = {
    gutter: [props.gutterX, props.gutterY],
    wrap: props.wrap,
    justify: props.justify,
    style: {
      width: '100%',
      minHeight: '20px'
    }
  }

  const colStyle = {}

  if (isInCanvas) {
    colStyle.background = '#d5d5d5'
  }

  return (
    <Flex
      vertical
      wrap="wrap"
      justify="center"
      align="center"
      gap={props.gutterY}
      style={styleWithUnits(props.style)}
      class={'tg-editor-layout-container'}
    >
      {
        range(0, props.rowCount, 1).map(() => (
          <Row {...rowProps}>
            {
              range(0, props.columnCount, 1).map(() => (
                <Col span={24 / props.columnCount}>
                  {
                    isInCanvas
                      ? <div style={colStyle} class={'tg-editor-drag-placeholder-within-layout'} />
                      : <div style={{ background: '#d5d5d5', minHeight: '20px' }} />
                  }
                </Col>
              ))
            }
          </Row>
        ))
      }
    </Flex>
  )
}
