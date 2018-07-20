import Vue from 'vue';
import Router from 'vue-router';
import { Route } from 'vue-router';
import Tutorial from './components/tutorial.vue';

Vue.config.productionTip = false;

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [],
    //{
      //path: '/search',
      //name: 'search',
      //component: Search,
      //meta: {
        //title: 'Search by City, Hotel Name or Address, or Point of Interest',
        //desc: defaultDesc,
      //},
      //props: true,
    //},
});

new Vue({
  router,
  render: (h) => h(Tutorial),
}).$mount('#app');
