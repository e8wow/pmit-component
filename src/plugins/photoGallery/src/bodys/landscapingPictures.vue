<template>
    <div :class="prefixCls">
        <div :class="`${prefixCls}-options`">

        </div>
        <div :class="`${prefixCls}-fabric`"
             class="transparent-bg-wrap">
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
import { Canvas, Image, Point, Object as FabricObject } from 'fabric/fabric-impl'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

// 拖动配置接口
interface DragConfig {
    isSpaceDownIng: boolean // 当前是否按住空格键
    isMouseDownIng: boolean // 当前是否按住鼠标左键
    lastPosX: number // 最后一次鼠标X轴坐标
    lastPosY: number // 最后一次鼠标Y轴坐标
}

// 缩放配置接口
interface ZoomConfig {
    zoom: number // 缩放比例
    max: number // 最大缩放比例
    min: number // 最小缩放比例
}

@Component({})
export default class LandscapingPictures extends Vue {
    // css prefix
    @Prop({ type: String, default: 'pmw-photo-gallery-landscaping-pictures' })
    private readonly prefixCls?: string

    // TODO 默认图片等组件完成后需要去除default属性值
    @Prop({
        type: String,
        default: require('../../../../assets/images/test3.jpg')
    })
    private readonly backgroundImage?: string

    private fabricCanvas?: Canvas // fabric canvas 实例
    private background?: Image // fabric 背景图片 实例
    private contents: FabricObject[] = [] // 内容
    private centerPoint?: Point // 中心点
    private dragConfig: DragConfig = {
        isSpaceDownIng: false,
        isMouseDownIng: false,
        lastPosX: 0,
        lastPosY: 0
    }
    private zoomConfig: ZoomConfig = {
        zoom: 1,
        max: 4,
        min: 0.9
    }

    /**
     * 获取背景
     */
    private get getBackground(): Image {
        return this.contents[0] as Image
    }

    /**
     * 获取背景图片的宽高比例
     */
    private get getBackgroundRatio() {
        const background: Image = this.getBackground as Image
        if (background) {
            return background.width! / background.height!
        } else {
            return 1
        }
    }

    /**
     * 获取canvas元素
     */
    private get getCanvasElement(): HTMLCanvasElement {
        return this.$refs.canvas as HTMLCanvasElement
    }

    /**
     * 是否可拖拽画布进行移动
     */
    private get getIsMoveIng(): boolean {
        return this.dragConfig.isMouseDownIng && this.dragConfig.isSpaceDownIng
    }

    private async mounted() {
        // 调整画布大小
        this.getCanvasElement.width = this.getCanvasElement.clientWidth
        this.getCanvasElement.height = this.getCanvasElement.clientHeight
        // 实例化fabricCanvas
        this.fabricCanvas = new Fabric.fabric.Canvas(this.getCanvasElement)
        // 获取中心点
        const center = this.fabricCanvas.getCenter()
        this.centerPoint = new Fabric.fabric.Point(center.left, center.top)
        // 手动触发一次填充背景图片
        await this.ob_background()
        // 注册监听事件
        this.registerEventListener()
    }

    private beforeDestroy() {
        // 移除监听事件
        document.removeEventListener('keydown', this.handleKeyDown)
        document.removeEventListener('keyup', this.handleKeyUp)
        if (this.fabricCanvas) {
            this.fabricCanvas.off('mouse:down', this.handleMouseDown)
            this.fabricCanvas.off('mouse:move', this.handleMouseMove)
            this.fabricCanvas.off('mouse:up', this.handleMouseUp)
        }
    }

    /**
     * 注册事件监听
     */
    private registerEventListener() {
        document.addEventListener('keydown', this.handleKeyDown)
        document.addEventListener('keyup', this.handleKeyUp)
        if (this.fabricCanvas) {
            this.fabricCanvas.on('mouse:down', this.handleMouseDown)
            this.fabricCanvas.on('mouse:move', this.handleMouseMove)
            this.fabricCanvas.on('mouse:up', this.handleMouseUp)
        }
    }

    /**
     * 添加元素
     * object: FabricObject 添加的对象
     */
    private appendObject(object: FabricObject): FabricObject | void {
        if (this.fabricCanvas) {
            this.contents.push(object)
            this.fabricCanvas.add(object)
            return object
        }
    }

    /**
     * 生成Base64图片
     * @returns {Promise<string>}
     */
    private async getBase64(): Promise<string> {
        if (this.fabricCanvas && this.getBackground) {
            const currentZoom = this.zoomConfig.zoom // 当前的缩放比例
            this.zoomConfig.zoom = 1 // 将当前的缩放比例恢复默认值
            let result = '' // 用来存放Base64图片
            await this.$nextTick(() => {
                const backgroundRect = this.getBackground!.getBoundingRect(false, true)
                // 将裁剪后返回的Base64字符串赋值给result变量
                result = this.fabricCanvas!.toDataURL({
                    left: backgroundRect.left,
                    top: backgroundRect.top,
                    width: backgroundRect.width,
                    height: backgroundRect.height
                })
                this.fabricCanvas!.renderAll()
            })
            this.zoomConfig.zoom = currentZoom
            return result
        } else {
            return ''
        }
    }

    /**
     * 设置所有元素的cursor
     * @param cursor:string 将所有元素的hoverCursor设置为此值
     */
    private setCursor(cursor: string): void {
        if (this.fabricCanvas) {
            this.fabricCanvas.defaultCursor = this.fabricCanvas.hoverCursor = cursor
        }
        this.contents.forEach(item => {
            item.hoverCursor = cursor
        })
    }

    /**
     * 监听背景图片的变化。裁剪后、重新选择都会触发
     */
    @Watch('backgroundImage')
    private async ob_background() {
        await new Promise((resolve, reject) => {
            if (!this.fabricCanvas) {
                reject({
                    code: 100,
                    msg: '请先初始化fabric Canvas.'
                })
                return
            }
            if (!this.backgroundImage) {
                reject({
                    code: 101,
                    msg: '请传入正确的图片路径地址.'
                })
                return
            }
            // 引入背景图片
            Fabric.fabric.Image.fromURL(
                this.backgroundImage,
                (background: Image) => {
                    this.contents[0] = background
                    // 处理图片的缩放，使其不超出编辑区域
                    const { width = 0, height = 0 } = background
                    const radio = width / height // 获取图片宽高比例
                    let scale = 1 // 背景图片缩放比例
                    if (radio > 1 && width > this.fabricCanvas!.width) {
                        // 图片比例为宽大于高，并且超出画布宽度
                        scale = this.fabricCanvas!.width / background.width!
                    } else if (radio < 1 && height > this.fabricCanvas!.height) {
                        // 图片比例为高大于宽，并且超出画布高度
                        scale = this.fabricCanvas!.height / background.height!
                    }
                    background.scale(scale) // 设置背景图片缩放比ß

                    background.hasControls = false // 将缩放旋转等控制点取消
                    background.hasBorders = false // 去掉边框
                    background.selectable = false // 不能选中
                    background.hoverCursor = 'default' // 鼠标移入样式改为默认

                    this.fabricCanvas!.add(background) // 将背景加入画布中
                    this.fabricCanvas!.centerObject(background)
                    this.fabricCanvas!.clipTo = ctx => {
                        const bgRect = background.getBoundingRect(false, true)
                        ctx.rect(
                            bgRect.left!,
                            bgRect.top!,
                            bgRect.width!,
                            bgRect.height!
                        )
                    }
                    resolve()
                }
            )
        })
    }

    /**
     * 拖动背景的观察者
     * @param dragConfig:DragConfig
     */
    @Watch('dragConfig', { deep: true })
    private ob_dragConfig(dragConfig: DragConfig): void {
        // 设置鼠标样式
        if (dragConfig.isSpaceDownIng) { // TODO 此处以后可移出这里，为isSpaceDownIng和isMouseDownIng增加另外的监听回调
            this.setCursor('-webkit-grab')
            if (dragConfig.isMouseDownIng) {
                this.setCursor('-webkit-grabbing')
            }
        } else {
            this.setCursor('default')
        }
    }

    /**
     * 监听缩放参数
     * zoom 缩放比例
     * max 缩放最大值
     * min 缩放最小
     * @param zoomConfig:{zoom,max,min} zoomConfig
     */
    @Watch('zoomConfig', { deep: true })
    private ob_zoom({ zoom, max, min }: ZoomConfig): void {
        // 限制缩放最大值与最小值
        if (zoom > max) {
            this.zoomConfig.zoom = max
        } else if (zoom < min) {
            this.zoomConfig.zoom = min
        } else {
            // 执行体,代码都写这,
            if (this.fabricCanvas && this.centerPoint) {
                this.fabricCanvas.zoomToPoint(this.centerPoint, zoom)
                this.fabricCanvas!.clipTo = ctx => {
                    const bgRect = this.getBackground.getBoundingRect(false, true) // 获取背景图片的矩阵
                    ctx.rect(
                        bgRect.left!,
                        bgRect.top!,
                        bgRect.width!,
                        bgRect.height!
                    )
                }
                this.ob_dragConfig(this.dragConfig)
            }
        }
    }

    /**
     * document的空格按下事件
     * @param event
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (event.key === ' ' && this.fabricCanvas && this.getBackground) {
            if (this.fabricCanvas && this.getBackground) {
                this.dragConfig.isSpaceDownIng = true
                this.fabricCanvas.selection = false
                event.preventDefault()
            }
        }
    }

    /**
     * document的空格抬起事件
     * @param event
     */
    private handleKeyUp(event: KeyboardEvent): void {
        if (event.key === ' ') {
            if (this.fabricCanvas && this.getBackground) {
                this.dragConfig.isSpaceDownIng = false
                this.dragConfig.isMouseDownIng = false //
                this.fabricCanvas.selection = true
                event.preventDefault()
            }
        }
    }

    /**
     * 鼠标在画布中按下的事件
     * @param event
     */
    private handleMouseDown(options: any): void {
        const e: MouseEvent = options.e
        if (this.dragConfig.isSpaceDownIng) {
            this.dragConfig = {
                isSpaceDownIng: this.dragConfig.isSpaceDownIng,
                isMouseDownIng: true,
                lastPosX: e.clientX,
                lastPosY: e.clientY
            }
        }
    }

    /**
     * 鼠标在画布中移动的事件
     * @param event
     */
    private handleMouseMove(options: any): void {
        const e: MouseEvent = options.e
        if (this.getIsMoveIng && this.fabricCanvas && this.getBackground) {
            const diffX = e.clientX - this.dragConfig.lastPosX
            const diffY = e.clientY - this.dragConfig.lastPosY
            this.dragConfig.lastPosX = e.clientX
            this.dragConfig.lastPosY = e.clientY
            // 更改fabricCanvas的transform
            const vpt = this.fabricCanvas.viewportTransform
            vpt![4] += diffX
            vpt![5] += diffY
            this.fabricCanvas!.renderAll() // 重新渲染
        }
    }

    /**
     * 鼠标在画布中抬起的事件
     * @param event
     */
    private handleMouseUp(options: any): void {
        if (this.getIsMoveIng) {
            this.dragConfig.isMouseDownIng = false
        }
    }
}
</script>

<style lang="scss">
@import '../../../../styles/index';

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
        background: rgba(0, 0, 0, 0.6);
        box-shadow: 0 0 5px #fff;
        z-index: 1;
        padding: 10px 15px;
        color: #fff;
    }
}
</style>
