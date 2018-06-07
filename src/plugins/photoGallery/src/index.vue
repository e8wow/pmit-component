<template>
    <Modal v-model="isShow" :width="1160" :class="prefixCls" :closable="false" :mask-closable="false">
        <div :class="`${prefixCls}-header`" slot="header">
            <nav :class="`${prefixCls}-nav`">
                <ul>
                    <li v-for="tab in tabData">
                        <button
                            v-if="tabCanShow(tab.key)"
                            @click="onTabHandlerClick(tab.key)"
                            :class="{active:tab.key === tabActiveKey}">
                            {{tab.label}}
                        </button>
                    </li>
                </ul>
                <ul>
                    <li v-for="tool in toolTabData">
                        <button
                            @click="onTabHandlerClick(tool.key)"
                            :class="{active:tool.key === tabActiveKey}">
                            <Icon :type="tool.icon"/>
                            {{tool.label}}
                        </button>
                    </li>
                </ul>
            </nav>
            <div :class="`${prefixCls}-close`" @click="hide">
                <button>
                    <Icon type="close-round" size="20"/>
                </button>
            </div>
        </div>
        <div :class="`${prefixCls}-body`">
            <component :is="tabActiveKey"></component>
        </div>
    </Modal>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator'

    import my_img from './bodys/myImg.vue'

    // Tab枚举
    enum Tab {
        MY_IMG = 'my_img', // 我的图片
        SYSTEM_DEFAULT_IMG = 'system_default_img', // 系统图片
        SYSTEM_DEFAULT_ICON = 'system_default_icon', // 系统图标
        LANDSCAPING_PICTURES = 'landscaping_pictures', // 美化图片
        RECYCLE = 'recycle' // 回收站
    }

    /**
     * 图片库组件
     * @author Jelf
     */
    @Component({
        components: {
            my_img
        }
    })
    export default class PhotoGallery extends Vue {
        // 样式前缀
        @Prop({type: String, default: 'pmw-photo-gallery'})
        private readonly prefixCls!: string
        // 显示图片库的哪些Tab
        @Prop({
            type: Array,
            default(): Tab[] {
                return [
                    Tab.MY_IMG,
                    Tab.SYSTEM_DEFAULT_IMG,
                    Tab.SYSTEM_DEFAULT_ICON,
                    Tab.LANDSCAPING_PICTURES,
                    Tab.RECYCLE
                ]
            },
            validator(value: string[]) {
                const tabs = Object.values(Tab)
                return value.every(tab => tabs.includes(tab))
            }
        })
        private readonly showTabKey!: Tab[]

        // 当前激活的Tab
        private tabActiveKey: Tab = this.showTabKey[0]
        // 常量对象
        private readonly Tab = Tab
        // 是否显示图片库
        private isShow: boolean = false
        // Tab源数据
        private readonly tabData: any[] = [
            {
                key: Tab.MY_IMG,
                label: '我的图片'
            },
            {
                key: Tab.SYSTEM_DEFAULT_IMG,
                label: '系统图片'
            },
            {
                key: Tab.SYSTEM_DEFAULT_ICON,
                label: '系统图标'
            }
        ]
        // ToolTab源数据
        private readonly toolTabData: any[] = [
            {
                key: Tab.LANDSCAPING_PICTURES,
                label: '美化图片',
                icon: 'wand'
            },
            {
                key: Tab.RECYCLE,
                label: '回收站',
                icon: 'trash-a'
            }
        ]

        /**
         * 判断这个Tab是否可以显示
         * @param tabKey Tab枚举类型
         */
        private tabCanShow(tabKey: Tab): boolean {
            return this.showTabKey.includes(tabKey)
        }

        /**
         * Tab点击事件
         */
        private onTabHandlerClick(tabKey: Tab): void {
            this.tabActiveKey = tabKey
        }

        /**
         * 显示图片库
         */
        private show(): void {
            this.isShow = true
        }

        /**
         * 隐藏图片库
         */
        private hide(): void {
            this.isShow = false
        }
    }
</script>

<style lang="scss">
    @import "../../../styles/index";

    $prefixCls: 'pmw-photo-gallery';
    .#{$prefixCls} {
        .ivu-modal-header {
            padding: 0;
            border: none;
            box-shadow: 0 5px 5px 0 #ccc;
        }
        .ivu-modal-body {
            padding: 0;
        }
        .ivu-modal-content {
            border-radius: 0;
            box-shadow: 0 0 3px #ffe9c8;
        }
        .ivu-modal-footer {
            display: none;
        }
        ul {
            list-style-type: none;
        }
        &-header {
            display: flex;
            justify-content: space-between;
            button {
                border: none;
                outline: none;
                color: #555;
            }
        }
        &-nav {
            display: flex;
            justify-content: space-between;
            flex: 1;
            > ul {
                display: flex;
                align-items: center;
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
        &-close {
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
        &-body {
            height: 580px;
        }
    }
</style>
