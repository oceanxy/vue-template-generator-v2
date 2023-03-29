import { createStoreModule } from '@/store/template'

export default commitRootInModule => createStoreModule({
  state: {
    visibilityOfDeveloper: false,
    visibilityOfRepayment: false,
    visibilityOfRepaymentPlan: false,
    visibilityOfRepaymentPlanPreview: false,
    natureOfTheEnterprise: {
      list: [],
      loading: false
    },
    repaymentPlanList: {
      list: [],
      loading: false
    }
  },
  modules: {
    repaymentPlan: {
      state: {
        rowKey: 'id',
        search: {},
        list: [],
        loading: false
      }
    },
    repaymentPlanPreview: {
      state: {
        rowKey: 'id',
        search: {},
        list: [],
        loading: false
      }
    }
  }
}, ['treeIdField'])