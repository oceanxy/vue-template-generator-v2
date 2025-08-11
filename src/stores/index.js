import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
// import resetFieldsPlugin from '@/stores/plugins/resetFieldsPlugin'

const pinia = createPinia()
pinia.use(piniaPluginPersistedState);
// pinia.use(resetFieldsPlugin)

export default pinia
