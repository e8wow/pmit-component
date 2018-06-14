<template>
    <div :class="prefixCls">
        <div :class="`${prefixCls}-options`">

        </div>
        <div :class="`${prefixCls}-fabric`" class="transparent-bg-wrap">
            <div :class="`${prefixCls}-zoom-wrap`">
                <span>{{Math.round(zoomConfig.zoom * 100)}}%</span>
                <div @click="zoomConfig.zoom+=.1">+</div>
                <div @click="zoomConfig.zoom-=.1">-</div>
            </div>
            <canvas ref="canvas"></canvas>
        </div>
    </div>
</template>

<script lang="ts">
    import Fabric from 'fabric'
    import {Canvas, Image, Point} from 'fabric/fabric-impl'
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator'

    // 拖动配置接口
    interface DragConfig { // 画布拖动配置
        isSpaceDownIng: boolean, // 当前是否按住空格键
        isMouseDownIng: boolean, // 当前是否按住鼠标左键
        info: {
            previousX: number, // 上一次的x轴坐标
            previousY: number, // 上一次的y轴坐标
            currentX: number, // 当前x轴坐标
            currentY: number // 当前y轴坐标
            offsetX: number, // x轴偏移量
            offsetY: number, // y轴偏移量
        }
    }

    // 缩放配置接口
    interface ZoomConfig {
        zoom: number, // 缩放比例
        max: number, // 最大缩放比例
        min: number // 最小缩放比例
    }

    @Component({})
    export default class LandscapingPictures extends Vue {
        // css prefix
        @Prop({type: String, default: 'pmw-photo-gallery-landscaping-pictures'})
        private readonly prefixCls?: string

        // TODO 默认图片等组件完成后需要去除default属性值
        @Prop({type: String, default: require('../../../../assets/images/test3.jpg')})
        private readonly backgroundImage?: string

        private fabricCanvas?: Canvas // fabric canvas 实例
        private background?: Image // fabric 背景图片 实例
        private centerPoint?: Point // 中心点
        private dragConfig: DragConfig = {
            isSpaceDownIng: false,
            isMouseDownIng: false,
            info: {
                previousX: 0,
                previousY: 0,
                currentX: 0,
                currentY: 0,
                offsetX: 0,
                offsetY: 0
            }
        }
        private zoomConfig: ZoomConfig = {
            zoom: 1,
            max: 4,
            min: .9
        }

        private get canvasElement(): HTMLCanvasElement {
            return <HTMLCanvasElement> this.$refs.canvas
        }

        /**
         * 是否可拖拽画布进行移动
         */
        private get isMoveIng() {
            return this.dragConfig.isMouseDownIng && this.dragConfig.isSpaceDownIng
        }

        private async mounted() {
            // 调整画布大小
            this.canvasElement.width = this.canvasElement.clientWidth
            this.canvasElement.height = this.canvasElement.clientHeight
            // 实例化fabricCanvas
            this.fabricCanvas = new Fabric.fabric.Canvas(this.canvasElement)
            // 获取中心点
            const center = this.fabricCanvas.getCenter()
            this.centerPoint = new Fabric.fabric.Point(center.left, center.top)
            // 手动触发一次填充背景图片
            await this.backgroundObserver()
            // 注册监听事件
            this.registerEventListener()
        }

        private beforeDestroy() {
            // 移除监听事件
            document.removeEventListener('keydown', this.handlerKeyDown)
            document.removeEventListener('keyup', this.handlerKeyUp)
            this.fabricCanvas.off('mouse:down', this.handlerMouseDown)
            this.fabricCanvas.off('mouse:move', this.handlerMouseMove)
            this.fabricCanvas.off('mouse:up', this.handlerMouseUp)
        }

        /**
         * 监听背景图片的变化。裁剪后、重新选择都会触发
         */
        @Watch('backgroundImage')
        private async backgroundObserver() {
            const canvas = this.fabricCanvas
            await new Promise(resolve => {
                // 引入背景图片
                Fabric.fabric.Image.fromURL(this.backgroundImage, (background: Image) => {
                    this.background = background
                    // 处理图片的缩放，使其不超出编辑区域
                    const {width, height} = background
                    const radio = width / height // 获取图片宽高比例
                    let scale = 1 // 背景图片缩放比例
                    if (radio > 1 && width > this.fabricCanvas.width) { // 图片比例为宽大于高，并且超出画布宽度
                        scale = this.fabricCanvas.width / background.width
                    } else if (radio < 1 && height > this.fabricCanvas.height) { // 图片比例为高大于宽，并且超出画布高度
                        scale = this.fabricCanvas.height / background.height
                    }
                    background.scale(scale) // 设置背景图片缩放比

                    background.hasControls = false // 将缩放旋转等控制点取消
                    background.hasBorders = false // 去掉边框
                    background.selectable = false // 不能选中
                    background.hoverCursor = 'default' // 鼠标移入样式改为默认

                    this.fabricCanvas.add(background) // 将背景加入画布中
                    this.fabricCanvas.centerObject(background)
                    resolve()
                })
            })
        }

        @Watch('dragConfig', {deep: true})
        private dragConfigObserver(dragConfig: DragConfig) {
            this.fabricCanvas._objects.forEach(item => {
                item.top += dragConfig.info.currentY - dragConfig.info.previousY
                item.left += dragConfig.info.currentX - dragConfig.info.previousX
            })
            this.fabricCanvas.renderAll()
        }

        /**
         * 监听缩放参数
         * zoom 缩放比例
         * max 缩放最大值
         * min 缩放最小
         * @param zoomConfig:{zoom,max,min} zoomConfig
         */
        @Watch('zoomConfig', {deep: true})
        private zoomObserver(zoomConfig: ZoomConfig) {
            const {zoom, max, min} = zoomConfig
            // 限制缩放最大值与最小值
            if (zoom > max) {
                this.zoomConfig.zoom = max
            } else if (zoom < min) {
                this.zoomConfig.zoom = min
            } else if (this.centerPoint) {
                this.fabricCanvas.zoomToPoint(this.centerPoint, zoom)
                // TODO 放大缩小后如果背景图高度或宽度超出则可拖拽，否则锁定未超出canvas范围的拖拽方向
                // console.log(
                //     this.background.getBoundingRect(),
                //     {
                //         width: this.fabricCanvas.width,
                //         height: this.fabricCanvas.height
                //     }
                // )
            }
        }

        /**
         * 注册事件监听
         */
        private registerEventListener() {
            document.addEventListener('keydown', this.handlerKeyDown)
            document.addEventListener('keyup', this.handlerKeyUp)

            this.fabricCanvas.on('mouse:down', this.handlerMouseDown)
            this.fabricCanvas.on('mouse:move', this.handlerMouseMove)
            this.fabricCanvas.on('mouse:up', this.handlerMouseUp)
        }

        /**
         * 生成Base64图片
         * @returns {Promise<string>}
         */
        private async getBase64(): Promise<string> {
            const currentZoom = this.zoomConfig.zoom // 当前的缩放比例
            this.zoomConfig.zoom = 1 // 将当前的缩放比例恢复默认值
            let result = '' // 用来存放Base64图片
            await this.$nextTick(() => {
                // 进行矩形裁剪
                this.fabricCanvas.clipTo = ctx => {
                    const backgroundRect = this.background.getBoundingRect()
                    ctx.rect(backgroundRect.left, backgroundRect.top, backgroundRect.width, backgroundRect.height)
                }
                // 将裁剪后返回的Base64字符串赋值给result变量
                result = this.fabricCanvas.toDataURL()
                // 将裁剪区域恢复
                this.fabricCanvas.clipTo = ctx => {
                    ctx.rect(
                        this.fabricCanvas.width - this.fabricCanvas.width * currentZoom,
                        this.fabricCanvas.height - this.fabricCanvas.height * currentZoom,
                        this.fabricCanvas.width * currentZoom,
                        this.fabricCanvas.height * currentZoom)
                }
                this.fabricCanvas.renderAll()
            })
            this.zoomConfig.zoom = currentZoom
            return result
        }

        /**
         * document的空格按下事件
         * @param event
         */
        private async handlerKeyDown(event: KeyboardEvent) {
            if (event.key === ' ') {
                this.dragConfig.isSpaceDownIng = true
                event.preventDefault()
                this.fabricCanvas.defaultCursor = '-webkit-grab'
                this.background.hoverCursor = '-webkit-grab'
                this.fabricCanvas.selection = false
            }
        }

        /**
         * document的空格抬起事件
         * @param event
         */
        private handlerKeyUp(event: KeyboardEvent) {
            if (event.key === ' ') {
                this.dragConfig.isSpaceDownIng = false
                this.dragConfig.isMouseDownIng = false //
                event.preventDefault()
                this.fabricCanvas.defaultCursor = 'default'
                this.background.hoverCursor = 'default'
                this.fabricCanvas.selection = true
            }
        }

        /**
         * 鼠标在画布中按下的事件
         * @param event
         */
        private handlerMouseDown(event: any) {
            if (this.dragConfig.isSpaceDownIng) {
                this.dragConfig = {
                    isSpaceDownIng: this.dragConfig.isSpaceDownIng,
                    isMouseDownIng: true,
                    info: {
                        previousX: event.absolutePointer.x,
                        previousY: event.absolutePointer.y,
                        currentX: event.absolutePointer.x,
                        currentY: event.absolutePointer.y,
                        offsetX: this.dragConfig.info.offsetX,
                        offsetY: this.dragConfig.info.offsetY
                    }
                }
            }
        }

        /**
         * 鼠标在画布中移动的事件
         * @param event
         */
        private handlerMouseMove(event: any) {
            if (this.isMoveIng) {
                this.dragConfig.info = {
                    previousX: this.dragConfig.info.currentX,
                    previousY: this.dragConfig.info.currentY,
                    currentX: event.absolutePointer.x,
                    currentY: event.absolutePointer.y,
                    offsetX: this.dragConfig.info.offsetX + event.absolutePointer.x - this.dragConfig.info.currentX,
                    offsetY: this.dragConfig.info.offsetY + event.absolutePointer.y - this.dragConfig.info.currentY
                }
            }
        }

        /**
         * 鼠标在画布中抬起的事件
         * @param event
         */
        private handlerMouseUp(event: any) {
            if (this.isMoveIng) {
                this.dragConfig = {
                    isSpaceDownIng: this.dragConfig.isSpaceDownIng,
                    isMouseDownIng: false,
                    info: {
                        previousX: 0,
                        previousY: 0,
                        currentX: 0,
                        currentY: 0,
                        offsetX: this.dragConfig.info.offsetX,
                        offsetY: this.dragConfig.info.offsetY
                    }
                }
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
