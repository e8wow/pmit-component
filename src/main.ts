import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 生产环境是否提示
Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: (h) => h(App)
}).$mount('#app')
