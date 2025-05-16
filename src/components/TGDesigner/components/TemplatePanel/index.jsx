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
    const apiNameForGetTemplate = inject('apiNameForGetTemplate')
    const apiNameForGetTemplates = inject('apiNameForGetTemplates')
    const setTemplateId = inject('setTemplateId')
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
                if (search.value.templateId && apiNameForGetTemplate) {
                  const res = await Promise.all([
                    // 保存选择的模版ID
                    tgStore.fetch({
                      location,
                      apiName: setTemplateId,
                      params: {
                        id: search.value.pageId,
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
                    designerStore.schema = JSON.parse(res[1].data?.schema || '{}')
                    props.updateSchema()
                  }
                }
              },
              '若选择新的模板，现有的数据将会被覆盖，确定要使用新模板吗？'
            )
          }
        }
      }
    })

    watch(open, async val => {
      if (val && apiNameForGetTemplates) {
        // 获取模板列表
        await tgStore.getList({
          isPagination: true,
          location,
          apiName: apiNameForGetTemplates
        })
      }
    })

    const getTemplateDetails = async () => {
      return await tgStore.getDetails({
        location,
        apiName: apiNameForGetTemplate,
        params: {
          id: search.value.templateId
        }
      })
    }

    const restoreTemplate = () => {
      verificationDialog(
        async () => {
          if (search.value.templateId) {
            const res = await getTemplateDetails()

            if (res.status && res.data.schema) {
              designerStore.schema = JSON.parse(res.data.schema)
              props.updateSchema()
            }
          } else {
            m.info('当前未使用模板')
          }
        },
        '此操作将丢弃对模板所做的更改，确定继续吗？'
      )
    }

    const selectTemplate = () => {
      tgStore.setVisibilityOfModal({
        modalStatusFieldName,
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
            onClick={restoreTemplate}
          >
            恢复模板
          </Button>
          <Button
            disabled={isSaving.value}
            type={'primary'}
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
