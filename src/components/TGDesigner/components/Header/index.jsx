import { Badge, Button, Divider, message, Tooltip } from 'ant-design-vue'
import { debounce } from 'lodash'
import { SchemaService } from '@/components/TGDesigner/schemas/persistence'
import { computed, onMounted, onUnmounted, toRaw, watch } from 'vue'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import { SAVE_STATUS } from '@/components/TGDesigner/configs/enums'
import { PLUGIN_KEY } from '@/components/TGDesigner/components/Plugins'
import './index.scss'

export default {
  name: 'TGDesignerHeader',
  props: {
    schemaId: {
      /**
       * schema id
       * @type {import('vue').PropType<string>}
       */
      type: [String, null]
    },
    plugins: {
      /**
       * 插件配置（支持对象或工厂函数）
       * @type {import('vue').PropType<DesignerPlugins>}
       */
      type: Object,
      default: () => ({})
    },
    updateSchemaApi: {
      /**
       * 更新schema
       * @type {import('vue').PropType<(schema: any) => Promise<{status: boolean}>>}
       */
      type: Function,
      default: () => () => Promise.resolve({ status: true })
    }
  },
  setup(props, { expose, slots }) {
    let timerId = null
    let intervalId = null
    const store = useEditorStore()
    const schema = computed(() => store.schema)
    const isSchemaLoaded = computed(() => store.isSchemaLoaded)

    const saveStatus = computed({
      get: () => store.saveStatus,
      set: val => store.saveStatus = val
    })
    const isSchemaChanged = computed({
      get: () => store.isSchemaChanged,
      set: val => store.isSchemaChanged = !!val
    })
    const localCacheStatus = computed({
      get: () => store.localCacheStatus,
      set: val => store.localCacheStatus = !!val
    })

    const plugins = {
      [PLUGIN_KEY.__PREVIEW__]: {
        name: '预览',
        icon: 'icon-designer-tool-preview',
        onClick: () => {/** 暂未实现 */}
      },
      ...props.plugins
    }

    const automaticCaching = debounce(async () => {
      await SchemaService.save(props.schemaId, toRaw(schema.value))
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
          saveStatus.value = SAVE_STATUS.UNSAVED
          automaticCaching()
        }, { deep: true })

        unWatch()
      }
    })

    // 在页面卸载前强制保存
    window.addEventListener('beforeunload', e => {
      if (saveStatus.value !== SAVE_STATUS.SAVED) {
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

      if (props.schemaId && isSchemaChanged.value) {
        saveStatus.value = SAVE_STATUS.SAVING

        try {
          let res
          if (typeof props.updateSchemaApi === 'function') {
            // 向服务端保存
            res = await props.updateSchemaApi(schema.value)
          } else {
            // 本地保存
            SchemaService.save(props.schemaId, schema.value)
            res = { status: true }
          }

          if (res.status) {
            saveStatus.value = SAVE_STATUS.SAVED

            if (!isAutoSave) {
              // 手动触发保存后，清空已存在的定时器
              clearInterval(intervalId)
              // 重新设置定时器
              autoSave()

              message.success('保存成功')
            }
          } else {
            saveStatus.value = SAVE_STATUS.UNSAVED
          }

          // 延迟3秒改变schema变化的状态，用于提示保存按钮的dot状态
          // 如果在timeout的回调执行期间发生schema更改，则以isSchemaChanged最新值为准
          timerId = setTimeout(() => isSchemaChanged.value = false, 3000)
        } catch (e) {
          saveStatus.value = SAVE_STATUS.UNSAVED
        }
      }
    }

    /**
     * 同步更新设计器和服务端 schema，并控制内部所有状态的正常流转。
     * @note 建议所有场景调用此方法更新schema。
     * @param [schema] {TGSchema} - 新 schema 数据。未传递该参数时，默认使用设计器当前保存的 schema 数据传给服务端。
     * @param [shouldRefreshUpdateSchemaTimer] {Boolean} - 是否刷新自动保存定时器，默认false。
     * @return {Promise<void>}
     */
    const updateSchema = async (schema, shouldRefreshUpdateSchemaTimer = false) => {
      if (schema) {
        store.schema = schema
      }

      localCacheStatus.value = false
      isSchemaChanged.value = true
      saveStatus.value = SAVE_STATUS.UNSAVED

      await handleSchemaSave(!shouldRefreshUpdateSchemaTimer)
    }

    const handleClearCanvas = () => {
      if (schema.value.components?.length) {
        store.schema.components = []
        saveStatus.value = SAVE_STATUS.UNSAVED
      }
    }

    const handlePluginClick = callback => {
      // 预览之前缓存schema到本地
      automaticCaching.flush()
      callback()
    }

    expose({ updateSchema })

    return () => (
      <div class={'tg-designer-tools'}>
        <div class={'tg-designer-functions'}>
          {
            slots.logo
              ? slots.logo()
              : (
                <div class={'tg-designer-logo'}>
                  <div class={'tg-designer-logo-text'}>在线页面设计器</div>
                  <div class={'tg-designer-logo-sub-text'}>Online Page Designer</div>
                </div>
              )
          }
          <div class={'tg-designer-canvas-functions'}>
            <Button
              danger
              type="text"
              disabled={!schema.value.components?.length}
              icon={<IconFont type="icon-designer-tool-clear-canvas" />}
              title={'清空画布'}
              onClick={handleClearCanvas}
            />
            <Button
              type="text"
              // disabled={saveStatus.value === SAVE_STATUS.SAVING}
              disabled={true}
              icon={<IconFont type="icon-designer-tool-undo" />}
              title={'撤销（建设中）'}
            />
            <Button
              type="text"
              // disabled={saveStatus.value === SAVE_STATUS.SAVING}
              disabled={true}
              icon={<IconFont type="icon-designer-tool-redo" />}
              title={'重做（建设中）'}
            />
            <Divider type="vertical" />
            <Badge
              dot={isSchemaChanged.value}
              offset={[-6, 4]}
              status={['error', 'processing', 'success'][saveStatus.value - 1]}
            >
              <Button
                type="text"
                disabled={saveStatus.value !== SAVE_STATUS.UNSAVED || !isSchemaChanged.value}
                icon={<IconFont type="icon-designer-tool-save" />}
                title={'保存'}
                onClick={() => handleSchemaSave()}
              />
            </Badge>
            {
              Reflect.ownKeys(plugins).map(pluginKey => (
                <Button
                  type="text"
                  icon={<IconFont type={plugins[pluginKey].icon} />}
                  title={plugins[pluginKey].name}
                  onClick={() => handlePluginClick(plugins[pluginKey].onClick)}
                />
              ))
            }
          </div>
          <div class="tg-designer-status-indicators">
            <Badge
              dot={localCacheStatus.value !== null}
              offset={[-6, 10]}
              status={localCacheStatus.value ? 'success' : 'error'}
            >
              <Tooltip placement={'topRight'} overlayClassName="tg-tooltip-format">
                {{
                  title: () => [
                    localCacheStatus.value !== null &&
                    <p>最新改动本地{localCacheStatus.value ? '已' : '暂未'}缓存。</p>,
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
