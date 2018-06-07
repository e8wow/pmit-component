<template>
    <aside :class="prefixCls">
        <div :class="`${prefixCls}-header`">
            <slot name="header"></slot>
        </div>
        <div :class="`${prefixCls}-body`">
            <slot></slot>
        </div>
        <div :class="`${prefixCls}-footer`">
            <slot name="footer"></slot>
        </div>
    </aside>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator'

    /**
     * 图片库边栏容器组件
     * @author Jelf
     */
    @Component({})
    export default class PhotoGalleryAside extends Vue {
        // 样式前缀
        @Prop({type: String, default: 'pmw-vertical-layout'})
        private readonly prefixCls!: string
    }
</script>

<style lang="scss">
    $prefixCls: 'pmw-vertical-layout';
    .#{$prefixCls} {
        display: flex;
        flex-direction: column;
        position: relative;
        &-body {
            flex: 1 1;
        }
    }
</style>
