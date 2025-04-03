import { computed } from 'vue'
import { useEditorStore } from '@/components/TGEditor/stores/useEditorStore'

/**
 * 操作栏定位逻辑 Hook
 * @returns {{ updatePosition: Function }}
 */
export default function useActionBar() {
  const store = useEditorStore()
  const actionBar = computed(() => store.actionBar)

  // 配置常量
  const VISUAL_OFFSET = {
    x: 3,  // 水平偏移量
    y: 1   // 垂直偏移量
  }

  const measureElement = (el) =>
    new Promise(resolve => requestAnimationFrame(() =>
      resolve(el.getBoundingClientRect())
    ))

  /**
   * 更新操作栏位置（核心逻辑）
   * @returns {Promise<void>}
   */
  const updatePosition = async (containerRef, actionBarRef) => {
    // 前置条件检查
    if (!actionBar.value.visible || !actionBarRef.value) return

    const selectedEl = containerRef.value?.querySelector(
      '[data-selected="true"]'
    )

    if (!selectedEl) return

    const [containerRect, selectedRect, actionBarRect] =
      await Promise.all([
        measureElement(containerRef.value),
        measureElement(selectedEl),
        measureElement(actionBarRef.value)
      ])

    // 计算可视区域内的位置
    const maxX = containerRect.width - actionBarRect.width
    const maxY = containerRect.height - actionBarRect.height

    // 计算原始位置
    const rawPosition = {
      x: selectedRect.right - containerRect.left - actionBarRect.width + VISUAL_OFFSET.x,
      y: selectedRect.bottom - containerRect.top + VISUAL_OFFSET.y
    }

    // 边界约束
    const constrainedPosition = {
      x: Math.max(0, Math.min(rawPosition.x, maxX)),
      y: Math.max(0, Math.min(rawPosition.y, maxY))
    }

    // 应用位置更新
    actionBar.value.position = {
      x: constrainedPosition.x + containerRect.left,
      y: constrainedPosition.y + containerRect.top
    }
  }

  return {
    updatePosition
  }
}
