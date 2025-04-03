import { Button, message } from 'ant-design-vue'
import { debounce } from 'lodash'
import { SchemaService } from '@/components/TGEditor/schemas/persistence'
import { computed, onUnmounted, toRaw, watch, watchEffect } from 'vue'
import { useEditorStore } from '@/components/TGEditor/stores/useEditorStore'
import { RedoOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons-vue'

export default {
  name: 'TGEditorHeader',
  setup() {
    const store = useEditorStore()
    const isSaving = computed(() => store.isSaving)
    const schema = computed(() => store.schema)

    const autoSave = debounce(
      async () => {
        try {
          store.isSaving = true
          await SchemaService.save('default', toRaw(schema.value))
        } catch (e) {
          message.error('保存失败')
        } finally {
          store.isSaving = false
        }
      },
      1500, // 自动保存时间间隔
      {
        leading: false,   // 不立即执行首次
        trailing: true    // 保证最后一次触发会执行
      }
    )

    // 关键操作立即保存（如组件删除/顺序变更）
    watch(() => store.schema.components.length, autoSave) // 组件数量变化立即触发
    watch(() => store.schema.canvas, autoSave, { deep: true }) // 画布设置变更立即触发

    watchEffect(() => {
      autoSave()
    })

    // 在页面卸载前强制保存
    window.addEventListener('beforeunload', () => {
      autoSave.flush()
    })

    onUnmounted(() => {
      autoSave.flush()
    })

    const handleSchemaSave = () => {
      // todo 向服务端保存
    }

    return () => (
      <div class={'tg-editor-tools'}>
        <Button
          onClick={handleSchemaSave}
          data-saving={isSaving.value ? 'true' : null}
          icon={<SaveOutlined />}
          title={'保存'}
        />
        <Button
          icon={<RedoOutlined />}
          title={'重做'}
        />
        <Button
          icon={<UndoOutlined />}
          title={'撤销'}
        />
        {
          isSaving.value && (
            <div class="save-status-bar">
              <div class="save-progress" />
            </div>
          )
        }
      </div>
    )
  }
}
