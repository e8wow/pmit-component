import Vue from 'vue' // 不可删除 import Vue from 'vue' 否则此处无效
import {MetaInfo} from 'vue-meta'

declare module 'vue/types/vue' {
    interface Vue {
        $PM: any,
        $Message: {
            info: any
            success: any
            warning: any
            error: any
            loading: any
        },
        $Notice: any,
        $Modal: {
            info: any
            success: any
            warning: any
            confirm: any
        },
        $Loading: any,
        $Spin: any,
        $photoGallery: any,
        metaInfo?: MetaInfo | (() => MetaInfo)
    }
}
