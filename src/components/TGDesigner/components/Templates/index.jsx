import { Button, Card, CardMeta, Image, List, ListItem, message as m } from 'ant-design-vue'
import useTGModal from '@/composables/tgModal'
import { computed, inject, watchEffect } from 'vue'
import { verificationDialog } from '@/utils/message'
import './index.scss'
import { defaultImg } from '@/components/TGDesigner/assets/defaultImg'

export default {
  name: 'DesignerTemplates',
  setup() {
    const apiNameForGetTemplate = inject('apiNameForGetTemplate')
    const apiNameForGetTemplates = inject('apiNameForGetTemplates')
    const location = 'templates'
    const modalStatusFieldName = 'showModalForTemplates'
    const tgStore = inject('tgStore')
    const templateIdSelected = computed(() => tgStore.templateIdSelected)
    const pagination = computed(() => tgStore[location].pagination)
    const dataSource = computed(() => tgStore[location].dataSource)

    const { TGModal, open } = useTGModal({
      store: tgStore,
      location,
      modalStatusFieldName,
      modalProps: {
        title: '模板中心 - 选择模板',
        width: 1200,
        onOk: () => {
          if (!templateIdSelected.value) {
            m.warning('请选择模板')
          } else {
            verificationDialog(
              () => {
                tgStore.setVisibilityOfModal({
                  modalStatusFieldName,
                  location,
                  value: false
                })

                return Promise.resolve(true)
              },
              '若选择新的模板，现有的数据将会被清空，确定要使用新模板吗？'
            )
          }
        },
        onCancel: () => {
          tgStore.templateIdSelected = null
        }
      }
    })

    watchEffect(async () => {
      if (open.value && apiNameForGetTemplates) {
        // 获取模板列表
        await tgStore.getList({
          isPagination: true,
          location,
          apiName: apiNameForGetTemplates
        })
      }
    })

    watchEffect(async () => {
      if (templateIdSelected.value && !open.value && apiNameForGetTemplate) {
        // 获取模板详情，拿到schema数据
        await tgStore.getDetails({
          location,
          apiName: apiNameForGetTemplate,
          params: {
            id: templateIdSelected.value
          },
          setValue: (data, store) => {
            tgStore.setState('details', data, { location })
          }
        })
      }
    })

    const restoreTemplate = () => {

    }

    const selectTemplate = () => {
      tgStore.setVisibilityOfModal({
        modalStatusFieldName,
        location,
        value: true,
        // currentItem: { id: '' }
      })
    }

    const handleTemplateSelected = id => {
      tgStore.templateIdSelected = id
    }

    return () => (
      <div class={'tg-designer-template-functions'}>
        <Button
          type={'primary'}
          onClick={restoreTemplate}
        >
          恢复模板
        </Button>
        <Button
          type={'primary'}
          onClick={selectTemplate}
        >
          选择模板
        </Button>
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
                    class={{ selected: templateIdSelected.value === item.id }}
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
