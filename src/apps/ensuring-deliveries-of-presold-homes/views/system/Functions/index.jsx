import './assets/styles/index.scss'
import dynamicState from '@/mixins/dynamicState'
import TGContainerWithTable from '@/components/TGContainerWithTable'
import Functions from './components/Functions'
import Inquiry from './components/Inquiry'
import Table from './components/Table'
import TGPagination from '@/components/TGPagination'
import ModalOfEdit from './components/ModalOfEdit'

export default {
  name: 'Functions',
  mixins: [dynamicState()],
  render() {
    return (
      <TGContainerWithTable
        showTree
        notNoneMode
        apiOptions={{
          apiName: 'getMenuTree',
          stateName: 'menuTree',
          moduleName: 'functions'
        }}
      >
        <Functions slot={'functions'} />
        <Inquiry slot={'inquiry'} />
        <Table slot={'table'} />
        <TGPagination slot={'pagination'} />
        <template slot={'modals'}>
          <ModalOfEdit modalTitle={'{action}功能'} />
        </template>
      </TGContainerWithTable>
    )
  }
}
