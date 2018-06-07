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
        @Prop({type: String, default: 'pmw-list-item'})
        private readonly prefixCls!: string
    }
</script>

<style lang="scss">
    $prefixCls: 'pmw-list-item';
    .#{$prefixCls} {
        line-height: 30px;
    }
</style>
