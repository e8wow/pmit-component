<template>
    <Modal v-model="isShow" :width="1160" :class="prefixCls" :closable="false">
        <div :class="`${prefixCls}__header`" slot="header">
            <nav :class="`${prefixCls}__nav`">
                <ul>
                    <li v-for="tab in tabData">
                        <button :class="{active:tab.key === showTabKey}">{{tab.label}}</button>
                    </li>
                </ul>
                <ul>
                    <li>
                        <button :class="{active:'landscaping_pictures' === showTabKey}">
                            <Icon type="wand"/>
                            美化图片
                        </button>
                    </li>
                    <li>
                        <button :class="{active:'recycle' === showTabKey}">
                            <Icon type="trash-a"/>
                            回收站
                        </button>
                    </li>
                </ul>
            </nav>
            <div :class="`${prefixCls}__close`">
                <button>
                    <Icon type="close-round" size="20" color=""/>
                </button>
            </div>
        </div>
        <ul :class="`${prefixCls}__body`">
            <li id="my_img"></li>
            <li id="system_default_img"></li>
            <li id="system_default_icon"></li>
            <li id="landscaping_pictures"></li>
            <li id="recycle"></li>
        </ul>
    </Modal>
</template>

<script lang="ts">
    import {Component, Model, Prop, Vue, Watch} from 'vue-property-decorator'

    const MY_IMG = 'my_img' // 我的图片
    const SYSTEM_DEFAULT_IMG = 'system_default_img' // 系统图片
    const SYSTEM_DEFAULT_ICON = 'system_default_icon' // 系统图标
    const LANDSCAPING_PICTURES = 'landscaping_pictures' // 美化图片
    const RECYCLE = 'recycle' // 回收站

    @Component({})
    /**
     * 图片库组件
     * @author Jelf
     */
    export default class PhotoGallery extends Vue {
        // 样式前缀
        @Prop({type: String, default: 'pmw-photoGallery'})
        private readonly prefixCls!: string
        // 是否显示图片库
        @Prop({type: String, default: MY_IMG})
        private readonly showTabKey!: string

        // 是否显示图片库
        private isShow: boolean = false
        // Tab源数据
        private readonly tabData: any[] = [
            {
                key: MY_IMG,
                label: '我的图片'
            },
            {
                key: SYSTEM_DEFAULT_IMG,
                label: '系统图片'
            },
            {
                key: SYSTEM_DEFAULT_ICON,
                label: '系统图标'
            }
        ]

        /**
         * 显示图片库
         */
        private show() {
            this.isShow = true
        }

        /**
         * 隐藏图片库
         */
        private hide() {
            this.isShow = false
        }
    }
</script>

<style lang="scss">
    @import "../../../styles/index";

    $prefixCls: 'pmw-photoGallery';
    .#{$prefixCls} {
        .ivu-modal-header {
            padding: 0;
            border: none;
            box-shadow: 0 5px 5px 0 #ccc;
        }
        .ivu-modal-content {
            border-radius: 0;
            box-shadow: 0 0 3px #ffe9c8;
        }
        .ivu-modal-footer {
            display: none;
        }
        &__header {
            display: flex;
            justify-content: space-between;
            button {
                border: none;
                outline: none;
                color: #555;
            }
        }
        &__nav {
            display: flex;
            justify-content: space-between;
            flex: 1;
            > ul {
                display: flex;
                align-items: center;
                list-style-type: none;
                text-align: center;
                font-size: 16px;
                > li {
                    button {
                        width: 120px;
                        line-height: 60px;
                        cursor: pointer;
                        &.active {
                            color: $primary_color;
                        }
                    }
                }
            }
        }
        &__close {
            margin: 0 30px;
            display: flex;
            align-items: center;
            button {
                cursor: pointer;
                &:hover {
                    color: $primary_color;
                }
            }
        }
        &__body {
            list-style-type: none;
        }
    }
</style>
