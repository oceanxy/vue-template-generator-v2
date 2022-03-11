import ULContainers from '@/layouts/ULContainers'
import ULAppForm from './components/ULAppForm'
import ULAppTable from './components/ULAppTable'
import ULAppButtons from './components/ULAppButtons'
import dynamicState from '@/mixins/dynamicState'
import './assets/styles/index.scss'
import ULAppModalForEdit from '@/views/sites/Apps/components/ULAppModalForEdit'

export default {
  name: 'SiteApps',
  mixins: [dynamicState],
  provide() {
    return { moduleName: this.moduleName }
  },
  render() {
    return (
      <ULContainers class="uni-log-sites-apps">
        <ULAppForm slot="form" />
        <ULAppButtons slot="buttons" />
        <ULAppTable slot="table" />

        <ULAppModalForEdit slot="modals" />
      </ULContainers>
    )
  }
}
