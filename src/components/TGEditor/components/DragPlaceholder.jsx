import { computed } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'

export default {
  name: 'DragPlaceholder',
  setup(props) {
    const store = useEditorStore()
    const indicator = computed(() => store.indicator)

    return () => (
      <div
        class="tg-editor-drag-placeholder"
        data-parent-container={indicator.value.parentId || 'root'}
        style={{ top: indicator.value.top }}
        data-type={
          indicator.value.type !== 'none'
            ? indicator.value.type
            : null
        }
      />
    )
  }
}
