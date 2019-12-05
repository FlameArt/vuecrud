import RESTTable from './src/components/RESTTable'
import { TColumnsDefinition, VuejsDatatableFactory } from 'vuejs-datatable';


function plugin (Vue) {
  Vue.component('vueresttable', RESTTable);
  Vue.use( VuejsDatatableFactory );
}

// Install by default if using the script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin

export {
  RESTTable
}