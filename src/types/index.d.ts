import Vue from 'vue' // 不可删除 import Vue from 'vue' 否则此处无效
import {MetaInfo} from 'vue-meta'

declare module 'vue/types/vue' {
    interface Vue {
        $PM: any
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        metaInfo?: MetaInfo | (() => MetaInfo)
    }
}
