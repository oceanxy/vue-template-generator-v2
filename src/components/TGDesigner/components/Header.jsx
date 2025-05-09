import { Button, Input, message, Tag } from 'ant-design-vue'
import { debounce } from 'lodash'
import { SchemaService } from '@/components/TGDesigner/schemas/persistence'
import { computed, onUnmounted, toRaw, watch, watchEffect } from 'vue'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import { FileOutlined } from '@ant-design/icons-vue'
import router from '@/router'
import DesignerTemplates from './Templates'

export default {
  name: 'TGDesignerHeader',
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

    const handlePreview = async () => {
      // 预览之前保存
      await SchemaService.save('default', toRaw(schema.value))

      const page = router.resolve({ name: 'Preview' })
      window.open(page.href, '_blank')
    }

    return () => (
      <div class={'tg-designer-tools'}>
        <div class={'tg-designer-functions'}>
          <div class={'tg-designer-logo'}>
            <div class={'tg-designer-logo-text'}>建家开店页面设计器</div>
            <div class={'tg-designer-logo-version'}>CHS-DESIGNER <Tag color="volcano">v1.0</Tag></div>
          </div>
          <div class={'tg-designer-page-name'}>
            <Input placeholder={'页面名称'} prefix={<FileOutlined />} />
          </div>
          <div class={'tg-designer-canvas-functions'}>
            <Button
              icon={<IconFont type="icon-designer-tool-undo" />}
              title={'撤销'}
            />
            <Button
              icon={<IconFont type="icon-designer-tool-redo" />}
              title={'重做'}
            />
            <Button
              onClick={handleSchemaSave}
              data-saving={isSaving.value ? 'true' : null}
              icon={<IconFont type="icon-designer-tool-save" />}
              title={'保存'}
            />
            <Button
              onClick={handlePreview}
              icon={<IconFont type="icon-designer-tool-preview" />}
              title={'预览'}
            />
          </div>
        </div>
        <DesignerTemplates />
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
