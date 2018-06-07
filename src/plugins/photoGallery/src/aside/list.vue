<template>
    <div :class="prefixCls">
        <div :class="`${prefixCls}-header`">
            <span :class="`${prefixCls}-title`" v-if="!$slots.header">{{title}}</span>
            <slot name="header"></slot>
        </div>
        <ul :class="`${prefixCls}-body`">
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
        @Prop({type: String, default: 'pmw-list'})
        private readonly prefixCls!: string
        // props title
        @Prop({type: String})
        private readonly title!: string
    }
</script>

<style lang="scss">
    @import "../../../../styles/index";

    $prefixCls: 'pmw-list';
    .#{$prefixCls} {
        &-title {
            color: $gray-color-2;
        }
    }
</style>
