<template>
    <div :class="prefixCls">
        <div :class="`${prefixCls}__header`">
            <slot name="header"></slot>
        </div>
        <ul :class="`${prefixCls}__body`">
            <slot></slot>
        </ul>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator'

    /**
     * 图片库边栏列表容器组件
     * @author Jelf
     */
    @Component({})
    export default class PhotoGalleryAside extends Vue {
        // 样式前缀
        @Prop({type: String, default: 'pmw-photoGalleryAsideList'})
        private readonly prefixCls!: string
    }
</script>

<style lang="scss">
    $prefixCls: 'pmw-photoGalleryAsideList';
    .#{$prefixCls} {
    }
</style>
