import TGContainer from '@/components/TGContainer'
import Inquiry from './components/Inquiry'
import Table from './components/Table'
import Function from './components/Function'
import ModalForChangePassword from './components/ModalForChangePassword'
import ModalForEditing from './components/ModalForEditing'

export default {
  name: 'Accounts',
  setup() {
    return () => (
      <TGContainer>
        {{
          function: () => <Function />,
          inquiry: () => <Inquiry />,
          table: () => <Table />,
          modals: () => [
            <ModalForEditing />,
            <ModalForChangePassword />
          ]
        }}
      </TGContainer>
    )
  }
}
