import {createApp} from 'vue';
import App from './App.vue';
import {updateWeb3InWindow} from '@/utils/updateWeb3InWindow';

updateWeb3InWindow();

const app = createApp(App);

app.mount('#app');
