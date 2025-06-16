import { Badge, Button, message, Tag, Tooltip } from 'ant-design-vue'
import { debounce } from 'lodash'
import { SchemaService } from '@/components/TGDesigner/schemas/persistence'
import { computed, inject, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import { jumpToRoute } from '@/utils/designer'
import { SAVE_STATUS } from '@/components/TGDesigner/configs/enums'
import './index.scss'

export default {
  name: 'TGDesignerHeader',
  setup(props, { expose }) {
    let timerId = null
    let intervalId = null
    const tgStore = inject('tgStore')
    const store = useEditorStore()
    const saveStatus = computed(() => store.saveStatus)
    const schema = computed(() => store.schema)
    const search = computed(() => tgStore.search)
    const isSchemaLoaded = computed(() => tgStore.isSchemaLoaded)
    const isSchemaChanged = ref(false)
    const localCacheStatus = ref(null) // 本地缓存状态

    const automaticCaching = debounce(async () => {
      await SchemaService.save(search.value.schemaId, toRaw(schema.value))
      localCacheStatus.value = true
    }, 15000) // 自动本地保存时间间隔

    const autoSave = () => {
      // 30s自动向后端保存一次
      intervalId = setInterval(async () => {
        await handleSchemaSave(true)
      }, 30000)
    }

    const unWatch = watch(isSchemaLoaded, val => {
      if (val) {
        localCacheStatus.value = val
        automaticCaching()

        // 本地缓存实时进行
        watch(schema, () => {
          clearTimeout(timerId)
          isSchemaChanged.value = true
          localCacheStatus.value = false
          store.saveStatus = SAVE_STATUS.UNSAVED
          automaticCaching()
        }, { deep: true })

        unWatch()
      }
    })

    // 在页面卸载前强制保存
    window.addEventListener('beforeunload', e => {
      if (store.saveStatus !== SAVE_STATUS.SAVED) {
        e.preventDefault()
      }
    })

    onMounted(async () => {
      await autoSave()
    })

    onUnmounted(() => {
      clearInterval(intervalId)
      automaticCaching.cancel()
    })

    /**
     * 保存schema
     * @param [isAutoSave] {boolean}
     * @returns {Promise<void>}
     */
    const handleSchemaSave = async isAutoSave => {
      if (!localCacheStatus.value) {
        automaticCaching.flush()
      }

      if (search.value.schemaId && isSchemaChanged.value) {
        store.saveStatus = SAVE_STATUS.SAVING

        try {
          // 向服务端保存
          const res = await tgStore.fetch({
            loading: false,
            apiName: 'updateSchema',
            params: {
              scenePageSchemaId: search.value.schemaId,
              schemaContent: JSON.stringify(schema.value)
            }
          })

          store.saveStatus = SAVE_STATUS.SAVED

          if (!isAutoSave && res.status) {
            // 手动触发保存后，清空已存在的定时器，重新设置定时器
            clearInterval(intervalId)
            autoSave()

            if (res.status) {
              message.success('保存成功')
            }
          }

          // 延迟3秒后改变schema变化的状态，主要用于提示保存按钮的dot状态
          // 如果在timeout的回调执行期间发生schema更改，则以isSchemaChanged最新值为准
          timerId = setTimeout(() => isSchemaChanged.value = false, 3000)
        } catch (e) {
          store.saveStatus = SAVE_STATUS.UNSAVED
        }
      }
    }

    const handlePreview = async () => {
      // 预览之前缓存schema到本地
      automaticCaching.flush()

      jumpToRoute({
        name: 'Preview',
        params: { sceneConfigId: search.value.sceneConfigId },
        query: { schemaId: search.value.schemaId }
      })
    }

    const handlePreviewH5 = async () => {
      // 预览之前缓存schema到本地
      automaticCaching.flush()

      jumpToRoute({
        name: 'PreviewH5',
        params: { sceneConfigId: search.value.sceneConfigId },
        query: { schemaId: search.value.schemaId }
      })
    }

    const updateSchema = async () => {
      localCacheStatus.value = false
      isSchemaChanged.value = true
      store.saveStatus = SAVE_STATUS.UNSAVED

      await handleSchemaSave(true)
    }

    expose({ updateSchema })

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
              disabled={saveStatus.value === SAVE_STATUS.SAVING}
              icon={<IconFont type="icon-designer-tool-undo" />}
              title={'撤销'}
            />
            <Button
              disabled={saveStatus.value === SAVE_STATUS.SAVING}
              icon={<IconFont type="icon-designer-tool-redo" />}
              title={'重做'}
            />
            <Badge
              dot={isSchemaChanged.value}
              offset={[-6, 4]}
              status={['error', 'processing', 'success'][saveStatus.value - 1]}
            >
              <Button
                disabled={saveStatus.value !== SAVE_STATUS.UNSAVED || !isSchemaChanged.value}
                onClick={() => handleSchemaSave()}
                icon={<IconFont type="icon-designer-tool-save" />}
                title={'保存'}
              />
            </Badge>
            <Button
              onClick={handlePreview}
              icon={<IconFont type="icon-designer-tool-preview" />}
              title={'预览'}
            />
            <Button
              onClick={handlePreviewH5}
              icon={<IconFont type="icon-designer-tool-preview" />}
              title={'预览'}
            />
          </div>
          <div class="tg-designer-status-indicators">
            <Badge
              dot={localCacheStatus.value !== null}
              offset={[-6, 10]}
              status={localCacheStatus.value ? 'success' : 'error'}
            >
              <Tooltip placement={'topRight'} overlayClassName="tg-designer-status-tooltip-inner">
                {{
                  title: () => [
                    localCacheStatus.value !== null &&
                    <span>本地最新改动{localCacheStatus.value ? '已' : '暂未'}缓存。</span>,
                    <span>设计器会自动在本地定期缓存所有改动，策略如下：</span>,
                    <span>1、关闭页面会丢失所有缓存；</span>,
                    <span>2、刷新页面不会丢失缓存；</span>,
                    <span>3、向服务器保存时，状态指示条显示，并同步更新本地缓存；</span>,
                    <span>4、预览前，更新本地缓存，但不更新服务器数据，状态指示条不显示；</span>,
                    <span>5、更新本地缓存为静默更新，状态指示条不显示。</span>
                  ],
                  default: () => <IconFont type="icon-header-cache-status" />
                }}
              </Tooltip>
            </Badge>
          </div>
        </div>
        {
          saveStatus.value === SAVE_STATUS.SAVING && (
            <div class="tg-designer-save-status-bar">
              <div class="tg-designer-save-progress" />
            </div>
          )
        }
      </div>
    )
  }
}
