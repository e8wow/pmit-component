import Vue from 'vue'
import App from './App.vue'
import router from './config/router'
import iview from 'iview'
import 'iview/dist/styles/iview.css'

Vue.use(iview)
// 生产环境是否提示
Vue.config.productionTip = false

new Vue({
    router,
    render: (h) => h(App)
}).$mount('#app')
