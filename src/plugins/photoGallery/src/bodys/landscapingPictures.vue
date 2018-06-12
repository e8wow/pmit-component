<template>
    <div :class="prefixCls">
        <div :class="`${prefixCls}-options`">

        </div>
        <div :class="`${prefixCls}-fabric`" class="transparent-bg-wrap">
            <div :class="`${prefixCls}-zoom-wrap`">
                <span>{{Math.round(zoomOptions.zoom*100)}}%</span>
                <div @click="zoomOptions.zoom+=.1">+</div>
                <div @click="zoomOptions.zoom-=.1">-</div>
            </div>
            <canvas ref="canvas"></canvas>
        </div>
    </div>
</template>

<script lang="ts">
    import Fabric from 'fabric'
    import {Canvas, Point} from 'fabric/fabric-impl'
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator'

    @Component({
        mounted() {
            // 调整画布大小
            const canvas = <HTMLCanvasElement> this.$refs.canvas
            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight
            // 实例化fabricCanvas
            this.fabricCanvas = new Fabric.fabric.Canvas(canvas)
            // 获取中心点
            const center = this.fabricCanvas.getCenter()
            this.centerPoint = new Fabric.fabric.Point(center.left, center.top)
            // 填充背景图片
            this.watchBackground()
        }
    })
    export default class LandscapingPictures extends Vue {
        @Prop({type: String, default: 'pmw-photo-gallery-landscaping-pictures'})
        private readonly prefixCls?: string
        @Prop({type: String, default: require('../../../../assets/images/test3.jpg')})
        private readonly backgroundImage?: string

        private fabricCanvas?: Canvas // fabric 实例
        private centerPoint?: Point // 中心点
        private zoomOptions: { // 缩放选项
            zoom: number,
            max: number,
            min: number
        } = {
            zoom: 1,
            max: 4,
            min: .9
        }

        @Watch('backgroundImage')
        watchBackground() {
            const canvas = <HTMLCanvasElement> this.$refs.canvas

            // 引入背景图片
            Fabric.fabric.Image.fromURL(this.backgroundImage, (background) => {
                // 处理图片的缩放，使其不超出编辑区域
                const {width, height} = background
                const radio = width / height
                if (radio > 1 && width > canvas.clientWidth) {
                    background.scale(canvas.clientWidth / background.width)
                } else if (radio < 1 && height > canvas.clientHeight) {
                    background.scale(canvas.clientHeight / background.height)
                }
                background.hasControls = false // 将缩放旋转等控制点取消
                background.hasBorders = false // 去掉边框
                background.selectable = false // 不能选中
                background.hoverCursor = 'default' // 鼠标移入样式改为默认
                this.fabricCanvas.centerObject(background) // 将背景图居中
                this.fabricCanvas.add(background) // 加入画布中
            })
        }

        @Watch('zoomOptions', {deep: true})
        watchZoom({zoom, max, min}) {
            if (zoom > max) {
                this.zoomOptions.zoom = max
            } else if (zoom < min) {
                this.zoomOptions.zoom = min
            } else {
                this.fabricCanvas.zoomToPoint(this.centerPoint, zoom)
            }
        }
    }
</script>

<style lang="scss">
    @import "../../../../styles/index";

    $prefixCls: 'pmw-photo-gallery-landscaping-pictures';
    .#{$prefixCls} {
        display: flex;
        height: 100%;
        &-options {
            flex: 0 0 200px;
        }
        &-fabric {
            flex: 1;
            margin: 10px;
            position: relative;
            canvas {
                width: 100%;
                height: 100%;
            }
        }
        &-zoom-wrap {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: space-between;
            right: 0;
            top: 0;
            width: 500px;
            height: 45px;
            background: rgba(0, 0, 0, .6);
            box-shadow: 0 0 5px #FFF;
            z-index: 1;
            padding: 10px 15px;
            color: #FFF;
        }
    }
</style>
