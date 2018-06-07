<template>
    <li :class="`${prefixCls}`">
        <slot></slot>
    </li>
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
        @Prop({type: String, default: 'pmw-photoGalleryAsideListItem'})
        private readonly prefixCls!: string
    }
</script>

<style lang="scss">
    $prefixCls: 'pmw-photoGalleryAsideListItem';
    .#{$prefixCls} {
    }
</style>
