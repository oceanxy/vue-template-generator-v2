import { Button, message, Tag } from 'ant-design-vue'
import { debounce } from 'lodash'
import { SchemaService } from '@/components/TGDesigner/schemas/persistence'
import { computed, inject, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import { jumpToRoute } from '@/utils/designer'

export default {
  name: 'TGDesignerHeader',
  setup(props, { expose }) {
    let interval = null
    const tgStore = inject('tgStore')
    const store = useEditorStore()
    const isSaving = computed(() => store.isSaving)
    const schema = computed(() => store.schema)
    const search = computed(() => tgStore.search)
    const isChanged = ref(false)

    const autoSave = debounce(
      async () => {
        try {
          await SchemaService.save(
            search.value.pageType === 13 ? search.value.pageId : search.value.sceneType,
            toRaw(schema.value)
          )
        } catch (e) {
          message.warning('本地缓存失败')
        }
      },
      15000, // 自动本地保存时间间隔
      {
        leading: false,   // 不立即执行首次
        trailing: true    // 保证最后一次触发会执行
      }
    )

    const autoUpdate = () => {
      // 30s自动向后端保存一次
      interval = setInterval(async () => {
        await handleSchemaSave('auto')
      }, 30000)
    }

    // 本地缓存实时进行
    watch(schema, () => {
      isChanged.value = true
      autoSave()
    }, { deep: true })

    // 在页面卸载前强制保存
    window.addEventListener('beforeunload', () => {
      autoSave.flush()
      clearInterval(interval)
    })

    onMounted(async () => {
      await autoUpdate()
    })

    onUnmounted(() => {
      autoSave.flush()
      clearInterval(interval)
    })

    const handleSchemaSave = async type => {
      if (search.value.schemaId && isChanged.value) {
        isChanged.value = false
        store.isSaving = true

        // 向服务端保存
        await tgStore.fetch({
          loading: false,
          apiName: 'updateSchema',
          params: {
            scenePageSchemaId: search.value.schemaId,
            schemaContent: JSON.stringify(schema.value)
          }
        })

        store.isSaving = false

        // 手动触发保存后，清空已存在的定时器，重新设置定时器
        if (type !== 'auto') {
          clearInterval(interval)
          autoUpdate()
        }
      }
    }

    const handlePreview = async () => {
      // 预览之前保存schema到本地session中
      await SchemaService.save(
        search.value.pageType === 13
          ? search.value.pageId
          : search.value.sceneType,
        toRaw(schema.value)
      )

      jumpToRoute({
        name: 'Preview',
        query: search.value.pageType === 13
          ? { pageId: search.value.pageId }
          : { sceneType: search.value.sceneType }
      })
    }

    expose({ updateSchema: handleSchemaSave })

    return () => (
      <div class={'tg-designer-tools'}>
        <div class={'tg-designer-functions'}>
          <div class={'tg-designer-logo'}>
            <div class={'tg-designer-logo-text'}>建家开店页面设计器</div>
            <div class={'tg-designer-logo-version'}>CHS-DESIGNER <Tag color="volcano">v1.0</Tag></div>
          </div>
          {/*<div class={'tg-designer-page-name'}>*/}
          {/*  <Input placeholder={'页面名称'} prefix={<FileOutlined />} />*/}
          {/*</div>*/}
          <div class={'tg-designer-canvas-functions'}>
            <Button
              disabled={isSaving.value}
              icon={<IconFont type="icon-designer-tool-undo" />}
              title={'撤销'}
            />
            <Button
              disabled={isSaving.value}
              icon={<IconFont type="icon-designer-tool-redo" />}
              title={'重做'}
            />
            <Button
              disabled={isSaving.value}
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
        {
          isSaving.value && (
            <div class="tg-designer-save-status-bar">
              <div class="tg-designer-save-progress" />
            </div>
          )
        }
      </div>
    )
  }
}
