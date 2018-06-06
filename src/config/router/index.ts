import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import iview from 'iview'

const Demo = () => import('../../views/Demo.vue')
const install = () => import('../../views/install/index.vue')
const photoGallery = () => import('../../views/photoGallery/index.vue')

Vue.use(Router)
Vue.use(Meta)
const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/demo',
            component: Demo,
            children: [
                {
                    path: 'install',
                    name: 'install',
                    component: install
                },
                {
                    path: 'photo-gallery',
                    name: 'photo-gallery',
                    component: photoGallery
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    iview.LoadingBar.start()
    next()
})

router.afterEach(() => {
    iview.LoadingBar.finish()
})
export default router
