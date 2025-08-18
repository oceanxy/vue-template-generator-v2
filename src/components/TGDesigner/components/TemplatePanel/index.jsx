import './index.scss'

export default {
  name: 'DesignerTemplatePanel',
  props: {
    updateSchema: {
      type: Function,
      required: true
    }
  },
  setup() {
    return () => (
      <div class={'tg-designer-template'}>
        正在建设
      </div>
    )
  }
}
