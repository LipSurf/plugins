/*
 * Included in the options.html script
 */
import Vue from 'vue';
import OptionsPage from './components/options-page.vue';

Vue.config.productionTip = false;

new Vue({
    render: (h) => h(OptionsPage),
}).$mount('#app');