import Vue from 'vue' // 不可删除 import Vue from 'vue' 否则此处无效

declare module 'vue/types/vue' {
    interface Vue {
        $PM: any
    }
}
