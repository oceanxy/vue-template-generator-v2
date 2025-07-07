import { Button, Card, CardMeta, Image, List, ListItem, message as m } from 'ant-design-vue'
import useTGModal from '@/composables/tgModal'
import { computed, inject, watch } from 'vue'
import { verificationDialog } from '@/utils/message'
import { defaultImg } from '@/components/TGDesigner/assets/defaultImg'
import { useEditorStore } from '@/components/TGDesigner/stores/useEditorStore'
import './index.scss'

export default {
  name: 'DesignerTemplates',
  props: {
    updateSchema: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const designerStore = useEditorStore()
    const location = 'templates'
    const modalStatusFieldName = 'showModalForTemplates'
    const tgStore = inject('tgStore')
    const pagination = computed(() => tgStore[location].pagination)
    const dataSource = computed(() => tgStore[location].dataSource)
    const search = computed(() => tgStore.search)
    const isSaving = computed(() => designerStore.isSaving)

    const { TGModal, open } = useTGModal({
      store: tgStore,
      location,
      modalStatusFieldName,
      modalProps: {
        title: '模板中心 - 选择模板',
        width: 1200,
        onOk: () => {
          if (!search.value.templateId) {
            m.warning('请选择模板')
          } else {
            verificationDialog(
              async () => {
                if (search.value.templateId) {
                  const res = await Promise.all([
                    // 保存选择的模版ID
                    tgStore.fetch({
                      location,
                      apiName: search.value.pageType === 13 ? 'setTemplateId' : 'setTemplateIdOfHF',
                      params: {
                        ...(search.value.pageType === 13
                            ? { configPageId: search.value.pageId }
                            : {
                              sceneConfigId: search.value.sceneConfigId,
                              pageType: search.value.pageType
                            }
                        ),
                        pageTemplateId: search.value.templateId
                      }
                    }),
                    // 获取模板详情，拿到schema数据
                    getTemplateDetails()
                  ])

                  if (res[1].status) {
                    tgStore.setVisibilityOfModal({
                      modalStatusFieldName,
                      location,
                      value: false
                    })

                    // 用模板内定义的组件schema替换画布中组件schema
                    designerStore.schema = JSON.parse(res[1].data?.schemaContent || '{}')
                    props.updateSchema()
                  }
                }
              },
              '若选择新的模板，现有的画布数据将会被覆盖。确定要使用新模板吗？'
            )
          }
        }
      }
    })

    watch(open, async val => {
      if (val) {
        // 获取模板列表
        await tgStore.getList({
          isPagination: true,
          location,
          apiName: search.value.pageType === 13 ? 'getTemplates' : 'getTemplatesOfHF'
        })
      }
    })

    const getTemplateDetails = async () => {
      return await tgStore.getDetails({
        location,
        apiName: 'getSchemaByTemplateId',
        params: {
          templateId: search.value.templateId
        }
      })
    }

    const restoreTemplate = () => {
      verificationDialog(
        async () => {
          if (search.value.templateId) {
            const res = await getTemplateDetails()

            if (res.status && res.data.schemaContent) {
              designerStore.schema = JSON.parse(res.data.schemaContent)
              props.updateSchema()
            }
          } else {
            m.info('当前未使用模板')
          }
        },
        '此操作将丢弃所有更改，恢复成原始模板，确定继续吗？'
      )
    }

    const selectTemplate = () => {
      tgStore.setVisibilityOfModal({
        modalStatusFieldName,
        injectSearchParams: ['pageType', search.value.pageType === 13 ? 'pageId' : 'sceneType'],
        location,
        value: true
      })
    }

    const handleTemplateSelected = id => {
      tgStore.search.templateId = id
    }

    return () => (
      <div class={'tg-designer-template-functions-container'}>
        <div class={'tg-designer-template-functions'}>
          <Button
            disabled={isSaving.value || !search.value.templateId}
            type={'primary'}
            title={'还原为模板原始数据'}
            onClick={restoreTemplate}
          >
            恢复模板
          </Button>
          <Button
            disabled={isSaving.value}
            type={'primary'}
            title={'套用内置模板'}
            onClick={selectTemplate}
          >
            选择模板
          </Button>
        </div>

        <TGModal class={'tg-designer-template-items'}>
          <List
            loading={dataSource.value.loading}
            grid={{ gutter: 0, column: 4 }}
            pagination={pagination.value}
            dataSource={dataSource.value.list}
          >
            {{
              renderItem: ({ item }) => (
                <ListItem>
                  <Card
                    hoverable
                    key={item.id}
                    class={{ selected: search.value.templateId === item.id }}
                    onClick={() => handleTemplateSelected(item.id)}
                  >
                    {{
                      cover: () => (
                        <Image
                          preview={false}
                          src={item.coverImgStr}
                          fallback={defaultImg}
                        />
                      ),
                      default: () => (
                        <CardMeta title={item.name} description={item.description} />
                      )
                    }}
                  </Card>
                </ListItem>
              )
            }}
          </List>
        </TGModal>
      </div>
    )
  }
}
