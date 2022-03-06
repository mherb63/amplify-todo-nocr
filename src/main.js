import { createApp } from 'vue'
import App from './App.vue'

import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css'

import moment from "moment";
const app = createApp(App);
app.use(PrimeVue);
app.use(ToastService);
app.use(ConfirmationService)

app.component('InputTextTag', InputText);
app.component('ButtonTag', Button);
app.component('ToastTag', Toast);
app.component("DataTableTag",DataTable);
app.component("ColumnTag",Column);

app.mount('#app');
