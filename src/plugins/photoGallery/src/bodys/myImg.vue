<template>
    <div :class="prefixCls">
        <Aside>
            <Input slot="header" icon="search" placeholder="请输入图片名称"/>
            <list title="按项目">
                <list-item>全部图片</list-item>
                <list-item>当前项目</list-item>
                <list-item>轻电商</list-item>
                <list-item>轻服务</list-item>
                <list-item>轻站</list-item>
            </list>
            <list>
                <div :class="`${prefixCls}-tag-header`" slot="header">
                    <span>按标签</span>
                </div>
                <list-item>红色</list-item>
                <list-item>绿色</list-item>
                <list-item>青色</list-item>
                <list-item>紫色</list-item>
                <list-item>蓝色</list-item>
            </list>
        </Aside>

    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator'

    import Aside from '../aside/index.vue'
    import List from '../aside/list.vue'
    import ListItem from '../aside/list-item.vue'

    /**
     * 图片库我的图片
     * @author Jelf
     */
    @Component({
        components: {
            Aside,
            List,
            ListItem
        }
    })
    export default class PhotoGalleryMyImage extends Vue {
        // 样式前缀
        @Prop({type: String, default: 'pmw-photo-gallery-my-img'})
        private readonly prefixCls!: string
    }
</script>

<style lang="scss">
    @import "../../../../styles/index";

    $prefixCls: 'pmw-photo-gallery-my-img';
    .#{$prefixCls} {
        display: flex;
        height: 100%;
        aside {
            flex: 0 200px;
            padding: 20px;
            border-right: 1px solid $gray-color-3;
            box-sizing: border-box;
        }
        .pmw-list-header {
            margin: 15px 0 5px;
        }
        &-tag-header {
            > span {
                color: $gray-color-2;
            }
        }
    }
</style>
