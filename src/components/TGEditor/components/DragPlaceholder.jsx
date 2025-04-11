import { computed } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'

export default {
  name: 'DragPlaceholder',
  setup() {
    const store = useEditorStore()
    const indicator = computed(() => {
      const level = calculateNestedLevel(store.indicator.containerEl)
      return {
        ...store.indicator,
        nestedLevel: level
      }
    })

    /**
     * 层级计算函数
     * @param element
     * @returns {number|*|number}
     */
    function calculateNestedLevel(element) {
      if (!element) return 0

      return element.closest('.tg-editor-layout-component') ?
        element.closest('.tg-editor-layout-component').querySelectorAll('.tg-editor-layout-component').length : 0
    }

    return () => (
      <div
        class="tg-editor-drag-placeholder"
        style={{
          top: indicator.value.top,
          left: indicator.value.left,
          display: indicator.value.display
        }}
        data-nested-level={indicator.value.nestedLevel}
        data-type={indicator.value.type}
        data-layout-direction={indicator.value.layoutDirection}
        data-container-type={indicator.value.containerType}
      />
    )
  }
}
