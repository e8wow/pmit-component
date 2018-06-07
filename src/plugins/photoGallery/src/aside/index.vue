<template>
    <aside :class="prefixCls">
        <div :class="`${prefixCls}__header`">
            <slot name="header"></slot>
        </div>
        <div :class="`${prefixCls}__body`">
            <slot></slot>
        </div>
        <div :class="`${prefixCls}__footer`">
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
        @Prop({type: String, default: 'pmw-photoGalleryAside'})
        private readonly prefixCls!: string
    }
</script>

<style lang="scss">
    $prefixCls: 'pmw-photoGalleryAside';
    .#{$prefixCls} {
        display: flex;
        flex-direction: column;
        position: relative;
        &__body {
            flex: 1 1;
        }
    }
</style>
