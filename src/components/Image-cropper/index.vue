<template>
    <div @click="handlerClick" :class="prefixCls" :style="styles">
        <photo-gallery ref="photoGallery"/>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator'

    import photoGallery from '@/plugins/photoGallery/src/index.vue'

    @Component({
        components: {photoGallery}
    })
    export default class ImageCropper extends Vue {
        @Prop({type: String, default: 'pmw-image-cropper'})
        private readonly prefixCls!: string

        @Prop({type: Number, default: 50})
        private readonly width!: number

        @Prop({type: Number, default: 50})
        private readonly height!: number

        private isShow: boolean = false // 是否显示图片库

        private get styles() {
            return {
                width: `${this.width}px`,
                height: `${this.height}px`
            }
        }

        private handlerClick() {
            this.$refs.photoGallery.show() // TODO 今后改成this.$photoGallery
        }
    }
</script>

<style lang="scss">
    $prefixCls: 'pmw-image-cropper';
    .#{$prefixCls} {
        border: 1px solid #666;
    }
</style>
