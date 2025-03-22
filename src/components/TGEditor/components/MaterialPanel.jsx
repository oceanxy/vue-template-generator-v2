export default {
  name: 'MaterialPanel',
  props: ['store', 'schema', 'handleDragStart'],
  setup(props) {
    const componentRender = comp => (
      <div
        key={comp.type}
        class={'tg-editor-component-items'}
        draggable
        onDragstart={(e) => props.handleDragStart(e, comp)}
      >
        {comp.preview({ ...comp.defaultProps, style: comp.style })}
      </div>
    )

    return () => {
      return <div class={'tg-editor-material-container'}>
        <h4 class="component-category-title">布局组件</h4>
        <div class={'tg-editor-component-items'}>建设中</div>

        <h4 class="component-category-title">基础组件</h4>
        {props.store.baseComponentList.map(componentRender)}

        <h4 class="component-category-title">模板组件</h4>
        {props.store.templateComponentList.map(componentRender)}
      </div>
    }
  }
}
