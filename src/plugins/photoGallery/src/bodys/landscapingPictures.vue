<template>
    <div :class="prefixCls">
        <div :class="`${prefixCls}-options`">
            <span @click="appendText">文字</span>
        </div>
        <div :class="`${prefixCls}-fabric`"
             class="transparent-bg-wrap">
            <div :class="`${prefixCls}-zoom-wrap`">
                <span>{{Math.round(zoomConfig.zoom * 100)}}%</span>
                <div @click="handleZoom(+.1)">+</div>
                <div @click="handleZoom(-.1)">-</div>
            </div>
            <canvas ref="canvas"></canvas>
        </div>
    </div>
</template>

<script lang="ts">
    import Fabric                                           from 'fabric'
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
        point: Point
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
        private readonly backgroundUrl?: string

        // canvas属性
        private canvas?: Canvas // fabric canvas 实例
        private width: Number = 0 // canvas宽度
        private height: Number = 0 // canvas高度

        // 内容属性
        private background: Image // fabric 图片背景实例
        private contents: FabricObject[] = [] // 内容

        // 配置属性
        private centerPoint?: Point // 中心点
        private dragConfig: DragConfig = {
            isSpaceDownIng: false,
            isMouseDownIng: false,
            lastPosX: 0,
            lastPosY: 0
        }
        private zoomConfig: ZoomConfig = {
            zoom: 1,
            max: 10,
            min: 0.9,
            point: new Fabric.fabric.Point(0, 0)
        }

        /**
         * 获取背景图片的宽高比例
         */
        private get getBackgroundRatio(): number {
            const background: Image = this.background as Image
            if (background) {
                return background!.width / background!.height
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

        private async mounted(): void {
            // 调整画布大小
            this.width = this.getCanvasElement.width = this.getCanvasElement.clientWidth
            this.height = this.getCanvasElement.height = this.getCanvasElement.clientHeight
            // 实例化canvas
            this.canvas = new Fabric.fabric.Canvas(this.getCanvasElement)
            // 获取中心点
            const center = this.canvas.getCenter()
            this.zoomConfig.point = this.centerPoint = new Fabric.fabric.Point(center.left, center.top)
            // 手动触发一次填充背景图片
            await this.ob_background()
            // 注册监听事件
            this.registerEventListener()
            window.test = this
        }

        private beforeDestroy(): void {
            // 移除监听事件
            document.removeEventListener('keydown', this.handleKeyDown)
            document.removeEventListener('keyup', this.handleKeyUp)
            if (this.canvas) {
                this.canvas.off('mouse:down', this.handleMouseDown)
                this.canvas.off('mouse:move', this.handleMouseMove)
                this.canvas.off('mouse:up', this.handleMouseUp)
            }
        }

        /**
         * 注册事件监听
         */
        private registerEventListener(): void {
            document.addEventListener('keydown', this.handleKeyDown)
            document.addEventListener('keyup', this.handleKeyUp)
            if (this.canvas) {
                this.canvas.on('mouse:down', this.handleMouseDown)
                this.canvas.on('mouse:move', this.handleMouseMove)
                this.canvas.on('mouse:up', this.handleMouseUp)
                this.canvas.on('mouse:wheel', this.handleScroll)
            }
        }

        /**
         * 重新将fabric中的对象挂载到vue中
         */
        private refreshContentObjects(): void {
            this.contents = this.canvas!.getObjects()
            this.background = this.contents[0] as Image
        }

        /**
         * 添加元素
         * object: FabricObject 添加的对象
         */
        private appendObject(object: FabricObject): FabricObject | void {
            if (this.canvas) {
                this.canvas.add(object)
                this.refreshContentObjects()
                return object
            }
        }

        appendText() {
            this.appendObject(new Fabric.fabric.Text('测试'))
        }

        /**
         * 删除元素
         */
        private removeObject(object: FabricObject): void {
            this.canvas!.remove(object)
        }

        /**
         * 生成Base64图片
         * @returns {Promise<string>}
         */
        private async getBase64(): Promise<string> {
            if (this.canvas && this.background) {
                // 当前的缩放比例
                const currentZoom = this.zoomConfig.zoom
                // 将当前的缩放比例恢复默认值
                this.zoomConfig.zoom = 1

                // 开始生成图片
                let result = '' // 用来存放Base64图片
                await this.$nextTick(() => {
                    const backgroundRect = this.background!.getBoundingRect(false, true)
                    // 将裁剪后返回的Base64字符串赋值给result变量
                    // TODO 需要改成成调整大小设置的宽高缩放比例
                    result = this.canvas!.toDataURL({
                        left: backgroundRect.left,
                        top: backgroundRect.top,
                        width: backgroundRect.width,
                        height: backgroundRect.height
                    })
                    this.canvas!.renderAll()
                })

                // 恢复缩放比例
                this.zoomConfig.zoom = currentZoom
                return result
            } else {
                return ''
            }
        }

        /**
         * 检测边界碰撞，并归位
         */
        private checkBoundary() {
            // 获取背景的矩阵
            const bgRect = this.background.getBoundingRect(false, true)
            const vpt = this.canvas.viewportTransform!

            // 获取边界值
            let maxTopValue = 0, minTopValue = 0
            let maxLeftValue = 0, minLeftValue = 0
            const diffHeight = this.height - bgRect.height
            const diffWidth = this.width - bgRect.width
            this.height > bgRect.height ? maxTopValue = diffHeight : minTopValue = diffHeight
            this.width > bgRect.width ? maxLeftValue = diffWidth : minLeftValue = diffWidth

            // X轴边界碰撞检测
            if (bgRect.left >= maxLeftValue) {
                this.background.left = 0
                vpt[4] = maxLeftValue
            } else if (bgRect.left < minLeftValue) {
                this.background.left = 0
                vpt[4] = minLeftValue
            }

            // Y轴边界碰撞检测
            if (bgRect.top >= maxTopValue) {
                this.background.top = 0
                vpt[5] = maxTopValue
            } else if (bgRect.top < minTopValue) {
                this.background.top = 0
                vpt[5] = minTopValue
            }

            // 如果背景图宽度小于画布宽度则让背景图处于中间的位置
            if (bgRect.width <= this.width) {
                this.background.left = 0
                vpt[4] = this.width / 2 - bgRect.width / 2
            }
            // 如果背景图高度小于画布高度则让背景图处于中间的位置
            if (bgRect.height <= this.height) {
                this.background.top = 0
                vpt[5] = this.height / 2 - bgRect.height / 2
            }

            // 修复在图片放大超出画布范围时会消失的问题，也修复缩放后选不中画布内的元素，与实际看到的位置有偏移
            this.contents.forEach(item => item.setCoords())
        }

        /**
         * 设置所有元素的cursor
         * @param cursor:string 将所有元素的hoverCursor设置为此值
         */
        private setCursor(cursor: string): void {
            if (this.canvas) {
                this.canvas.defaultCursor = this.canvas.hoverCursor = cursor
            }
            this.contents.forEach(item => {
                item.hoverCursor = cursor
            })
        }

        /**
         * 将画布裁剪成只剩下背景图内的内容
         */
        private clip() {
            this.canvas!.clipTo = ctx => {
                const bgRect = this.background.getBoundingRect(false, true) // 获取背景图片的矩阵
                ctx.rect(
                    bgRect.left!,
                    bgRect.top!,
                    bgRect.width!,
                    bgRect.height!
                )
            }
        }

        /**
         * 恢复裁剪区域
         */
        private resumeClip() {
            this.canvas!.clipTo = ctx => {
                ctx.rect(
                    0,
                    0,
                    this.width!,
                    this.height!
                )
            }
        }

        /**
         * 监听背景图片的变化。裁剪后、重新选择都会触发
         */
        @Watch('backgroundUrl')
        private async ob_background(): void {
            await new Promise((resolve, reject) => {
                if (!this.canvas) {
                    reject({
                        code: 100,
                        msg: '请先初始化fabric Canvas.'
                    })
                    return
                }
                if (!this.backgroundUrl) {
                    reject({
                        code: 101,
                        msg: '请传入正确的图片路径地址.'
                    })
                    return
                }
                // 引入背景图片
                Fabric.fabric.Image.fromURL(
                    this.backgroundUrl,
                    (background: Image) => {
                        this.$set(this.contents, 0, background)
                        // 处理图片的缩放，使其不超出编辑区域
                        const { width = 0, height = 0 } = background
                        const radio = width / height // 获取图片宽高比例
                        let scale = 1 // 背景图片缩放比例
                        if (radio > 1 && width > this.width) {
                            // 图片比例为宽大于高，并且超出画布宽度
                            scale = this.width / background.width!
                        } else if (radio < 1 && height > this.height) {
                            // 图片比例为高大于宽，并且超出画布高度
                            scale = this.height / background.height!
                        }
                        background.scale(scale) // 设置背景图片缩放比ß

                        background.hasControls = false // 将缩放旋转等控制点取消
                        background.hasBorders = false // 去掉边框
                        background.selectable = false // 不能选中
                        background.hoverCursor = 'default' // 鼠标移入样式改为默认

                        this.canvas!.add(background) // 将背景加入画布中
                        this.canvas!.centerObject(background)
                        // this.clip()
                        this.refreshContentObjects()
                        // 调用一次边界检测，否则缩放时添加进去的元素会集中放到背景图片里面
                        this.checkBoundary()
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
                this.contents.forEach(item => {
                    item.hasControls = false // 将缩放旋转等控制点取消
                    item.hasBorders = false // 去掉边框
                    item.selectable = false // 不能选中
                })
                if (dragConfig.isMouseDownIng) {
                    this.setCursor('-webkit-grabbing')
                }
            } else {
                this.contents.forEach(item => {
                    item.hasControls = true // 将缩放旋转等控制点取消
                    item.hasBorders = true // 去掉边框
                    item.selectable = true // 不能选中
                })
                this.background.hasControls = false // 将缩放旋转等控制点取消
                this.background.hasBorders = false // 去掉边框
                this.background.selectable = false // 不能选中
                this.background.hoverCursor = 'default' // 鼠标移入样式改为默认
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
        private ob_zoom({ zoom, max, min, point }: ZoomConfig): void {
            // 限制缩放最大值与最小值
            if (zoom > max) {
                this.zoomConfig.zoom = max
            } else if (zoom < min) {
                this.zoomConfig.zoom = min
            } else {
                const canvas = this.canvas
                // 执行体,代码都写这,
                if (canvas && this.background) {
                    canvas.zoomToPoint(point, zoom)
                    // this.clip()
                    this.ob_dragConfig(this.dragConfig)
                    this.checkBoundary()
                }
            }
        }

        /**
         * document的空格按下事件
         * @param event
         */
        private handleKeyDown(event: KeyboardEvent): void {
            if (event.key === ' ' && this.canvas && this.background) {
                if (this.canvas && this.background) {
                    this.dragConfig.isSpaceDownIng = true
                    this.canvas.selection = false
                    event.preventDefault()
                }
            }
        }

        /**
         * document的空格抬起事件
         * @param event KeyboardEvent
         */
        private handleKeyUp(event: KeyboardEvent): void {
            if (event.key === ' ') {
                if (this.canvas && this.background) {
                    this.dragConfig.isSpaceDownIng = false
                    this.dragConfig.isMouseDownIng = false //
                    this.canvas.selection = true
                    event.preventDefault()
                }
            }
        }

        /**
         * 鼠标在画布中按下的事件
         * @param options
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
         * @param options
         */
        private handleMouseMove(options: any): void {
            const e: MouseEvent = options.e
            const canvas = this.canvas
            if (this.getIsMoveIng && canvas && this.background) {
                // 获取canvas的transform对象
                const vpt = canvas.viewportTransform!
                // 计算与上一次鼠标坐标相差值
                const diffX = e.clientX - this.dragConfig.lastPosX
                const diffY = e.clientY - this.dragConfig.lastPosY

                // 记录当前坐标
                this.dragConfig.lastPosX = e.clientX
                this.dragConfig.lastPosY = e.clientY

                vpt[4] += diffX
                vpt[5] += diffY

                this.checkBoundary()
                // 重新渲染
                canvas.renderAll()
            }
        }

        /**
         * 鼠标在画布中抬起的事件
         * @param options
         */
        private handleMouseUp(options: any): void {
            if (this.getIsMoveIng) {
                this.dragConfig.isMouseDownIng = false
            }
        }

        /**
         * 鼠标在画布中滚动的事件
         * @param options
         */
        private handleScroll(options: any): void {
            const delta = options.e.deltaY
            options.e.preventDefault()
            options.e.stopPropagation()
            this.zoomConfig.point = new Fabric.fabric.Point(options.e.offsetX, options.e.offsetY)
            this.zoomConfig.zoom -= delta / 200
        }

        /**
         * 修改zoom值
         * @param diff 相差值为正数或负数
         */
        private handleZoom(diff: number): void {
            if (diff !== 0) {
                this.zoomConfig.point = this.centerPoint
                this.zoomConfig.zoom = Math.round(((this.zoomConfig.zoom + diff) * 100)) / 100
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
