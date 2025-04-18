import { computed } from 'vue'
import { useEditorStore } from '../stores/useEditorStore'
import { styleWithUnits } from '@/components/TGEditor/utils/style'

export default {
  name: 'DragPlaceholder',
  setup() {
    const store = useEditorStore()
    const indicator = computed(() => store.indicator)
    const style = computed(() => styleWithUnits({
      top: indicator.value.top,
      left: indicator.value.left,
      width: indicator.value.width,
      height: indicator.value.height,
      display: indicator.value.display
    }))

    return () => (
      <div
        class="tg-editor-drag-placeholder"
        style={style.value}
        data-nested-level={indicator.value.nestedLevel}
        data-type={indicator.value.type}
        data-layout-direction={indicator.value.layoutDirection}
        data-container-type={indicator.value.containerType}
      />
    )
  }
}
