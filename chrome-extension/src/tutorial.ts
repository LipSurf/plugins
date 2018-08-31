import Vue from 'vue';
import Router from 'vue-router';
import Tutorial from './components/tutorial/tutorial.vue';

Vue.config.productionTip = false;

Vue.use(Router);

const router = new Router({
  routes: [
    {
      name: 'slide',
      path: '/slide/:slideNum([1-8]+)',
      component: Tutorial,
      props: true,
    },
    {
      path: '*',
      redirect: '/slide/1',
    }
  ],
});

new Vue({
  router,
  render: (h) => h(Tutorial),
}).$mount('#app');
