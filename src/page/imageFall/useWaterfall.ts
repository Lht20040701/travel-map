import {h, nextTick, onMounted, onUnmounted, reactive, Ref, render, useTemplateRef} from 'vue'
import Card from './Card.vue'
import type {VirtualWaterfall} from '@lhlyu/vue-virtual-waterfall'
import {ItemOption} from '@/page/imageFall/imageFallInterface.ts'
import imageFallApi from '@/api/imageFallApi.ts'

// 创建一个可复用的 DOM 容器
let measureDom: HTMLDivElement;
let scrollContainer: HTMLElement | null = null
let requestFrameId = 0
let previousOverscrollBehaviorY = ''

// 计算真实高度函数，这里只计算除了图片的高度
// 传入realWidth是宽度的变化可能会导致文字部分少一行或者多一行，从而导致高度在变
function getRealHeight(item: ItemOption, realWidth: number) {

    render(
        h(Card, {
            item: item,
            width: realWidth + 'px',
            noImage: true
        }),
        measureDom
    )

    // 获取高度
    const height: number = measureDom.firstElementChild!.clientHeight
    // 返回高度
    return height
}

function getScrollParent(element: HTMLElement | null): HTMLElement {
    let currentElement = element?.parentElement || null
    while (currentElement) {
        const style = window.getComputedStyle(currentElement)
        const overflowY = style.overflowY
        if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
            return currentElement
        }
        currentElement = currentElement.parentElement
    }
    return document.scrollingElement as HTMLElement || document.documentElement
}

const useWaterfall = (): {
    // 这是因为防止typescript报错写的函数返回类型定义
    vw: Ref<InstanceType<typeof VirtualWaterfall> | undefined>
    backTop: () => void
    waterfallOption: {
        loading: boolean
        bottomDistance: number
        onlyImage: boolean
        topPreloadScreenCount: number
        bottomPreloadScreenCount: number
        virtual: boolean
        enableCache: boolean
        gap: number
        padding: number
        itemMinWidth: number
        minColumnCount: number
        maxColumnCount: number
    }
    data: {
        page: number
        size: number
        total: number
        max: number
        list: ItemOption[]
        end: boolean
    }
    calcItemHeight: (item: ItemOption, itemWidth: number) => number
} => {

    const vw = useTemplateRef<InstanceType<typeof VirtualWaterfall>>('vw')

    // 滚动到最顶端
    const backTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'instant'
        })
    }

    // 瀑布流组件可定义的一些属性，具体参考仓库说明
    // https://github.com/lhlyu/vue-virtual-waterfall
    const waterfallOption = reactive({
        loading: false,
        bottomDistance: 160,
        // 是否只展示图片，这是自定义加的一个属性
        onlyImage: false,
        topPreloadScreenCount: 0,
        bottomPreloadScreenCount: 0,
        virtual: true,              // 虚拟化列表
        enableCache: true,          // 启用缓存
        gap: 5,                    // 每个item的间隔
        padding: 15,                // 容器内边距
        itemMinWidth: 220,          // 每个item最小的宽度
        minColumnCount: 2,          // 最大列数
        maxColumnCount: 10          // 最小列数
    })

    // 瀑布流元素高度的计算函数
    // 这里的itemWidth怎么计算的，看这里：https://github.com/lhlyu/vue-virtual-waterfall/blob/main/src/vue-virtual-waterfall/virtual-waterfall.vue#L119
    const calcItemHeight = (item: ItemOption, itemWidth: number) => {
        let height = 0
        // 当包含图文时，需要单独计算文字部分的高度
        // 文字部分的高度 + 图片的高度 = 真实高度
        if (!waterfallOption.onlyImage) {
            height = getRealHeight(item, itemWidth)
        }
        // 计算公式：图片原高度 * 缩放比例 + 非文字部分高度
        return item.height * (itemWidth / item.width) + height
    }

    // 需要展示数据的属性
    const data = reactive({
        page: 0,
        size: 30,
        total: 0,
        max: 0,
        list: [] as ItemOption[],
        end: false
    })

    // 加载更多数据的函数
    const loadData = async () => {
        if (data.end) {
            return
        }
        data.page += 1
        // const response = await fetch(`https://mock.yuan.sh/images?page=${data.page}&size=${data.size}&mode=simple`)
        // const result = await imageFallApi.allImages()
        const result = await imageFallApi.pageImages({page: data.page, size: data.size})
        if (!result.data.list.length) {
            data.end = true
            return
        }
        // 如果用demo作者的数据，这里需要用result，如果我写的，就是result.data
        data.total = result.data.total
        data.max = result.data.max
        data.list = [...data.list, ...result.data.list]
        if (data.list.length >= data.total) {
            data.end = true
        }
    }

    function getScrollMetrics() {
        const container = scrollContainer || document.scrollingElement || document.documentElement
        return {
            scrollHeight: container.scrollHeight,
            scrollTop: container.scrollTop,
            clientHeight: container.clientHeight
        }
    }

    // 检查是否加载更多
    const checkScrollPosition = async () => {
        if (waterfallOption.loading) {
            return
        }

        const {scrollHeight, scrollTop, clientHeight} = getScrollMetrics()

        const distanceFromBottom = scrollHeight - scrollTop - clientHeight

        // 不大于最小底部距离就加载更多
        if (distanceFromBottom <= waterfallOption.bottomDistance) {
            waterfallOption.loading = true
            await loadData()
            waterfallOption.loading = false
            // 新数据插入后重新检查，避免初次渲染时内容不足一屏
            queueCheckScrollPosition()
        }
    }

    function queueCheckScrollPosition() {
        if (requestFrameId) {
            return
        }
        requestFrameId = requestAnimationFrame(async () => {
            requestFrameId = 0
            await checkScrollPosition()
        })
    }

    function onScroll() {
        queueCheckScrollPosition()
    }

    onMounted(async () => {
        // 这个measureDom用于测量图片高度，请勿删除
        measureDom = document.createElement('div');
        // 将其设置为不可见，避免影响布局或用户体验
        measureDom.style.cssText = 'position: absolute; visibility: hidden; pointer-events: none;';
        document.body.appendChild(measureDom); // 在应用启动时添加到 body 一次

        await nextTick()
        const waterfallElement = (vw.value as any)?.$el as HTMLElement | undefined
        scrollContainer = getScrollParent(waterfallElement || null)
        previousOverscrollBehaviorY = scrollContainer.style.overscrollBehaviorY
        scrollContainer.style.overscrollBehaviorY = 'contain'
        scrollContainer.addEventListener('scroll', onScroll, {passive: true})
        window.addEventListener('resize', onScroll, {passive: true})

        queueCheckScrollPosition()
    })

    onUnmounted(() => {
        if (requestFrameId) {
            cancelAnimationFrame(requestFrameId)
            requestFrameId = 0
        }
        if (scrollContainer) {
            scrollContainer.removeEventListener('scroll', onScroll)
            scrollContainer.style.overscrollBehaviorY = previousOverscrollBehaviorY
            scrollContainer = null
        }
        window.removeEventListener('resize', onScroll)
        document.body.removeChild(measureDom);
    })
    return {
        vw,
        backTop,
        waterfallOption,
        data,
        calcItemHeight
    }
}

export default useWaterfall
