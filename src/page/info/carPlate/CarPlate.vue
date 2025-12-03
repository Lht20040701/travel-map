<template>
    <div class="map-container">
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
    </div>
</template>

<script lang="ts" setup>
import AMapLoader from '@amap/amap-jsapi-loader';
import {useProjectStore} from "@/store.ts";
import {onMounted, onUnmounted, ref} from "vue";
import {ColorsProvince} from "@/lib/colors.ts";
import {key_web_js} from "@/mapConfig.ts";

// 显示地图行政区的深度
const DEPTH = {
    province: 0, // 省
    city: 1, // 市
    country: 2 // 县、区
}

const store = useProjectStore()

let AMap = null
let map = null
let layerCity = null // 区域图层

const isLoading = ref(false)


// 车牌信息，参考：https://www.converts.cn/carid.html
const provinceMarkers = [
    {"name": "A", "position": [113.62,34.75], "note": "郑州"},
    {"name": "B", "position": [114.3, 34.8], "note": "开封"},
    {"name": "C", "position": [112.45, 34.62], "note": "洛阳"},
    {"name": "D", "position": [113.18, 33.77], "note": "平顶山"},
    {"name": "E", "position": [114.38, 36.1], "note": "安阳"},
    {"name": "F", "position": [114.28, 35.75], "note": "鹤壁"},
    {"name": "G", "position": [113.9, 35.3], "note": "新乡"},
    {"name": "H", "position": [113.25, 35.22], "note": "焦作"},
    {"name": "J", "position": [115.03, 35.77], "note": "濮阳"},
    {"name": "K", "position": [113.85, 34.03], "note": "许昌"},
    {"name": "L", "position": [114.02, 33.58], "note": "漯河"},
    {"name": "M", "position": [111.2, 34.78], "note": "三门峡"},
    {"name": "N", "position": [115.65, 34.45], "note": "商丘"},
    {"name": "P", "position": [114.63, 33.63], "note": "周口"},
    {"name": "Q", "position": [114.02, 32.98], "note": "驻马店"},
    {"name": "R", "position": [112.52, 33.0], "note": "南阳"},
    {"name": "S", "position": [114.07, 32.13], "note": "信阳"},
    {"name": "U", "position": [112.60235, 35.06905], "note": "济源"},
]

onMounted(() => {
    AMapLoader.load({
        key: key_web_js, // 开发应用的 ID
        version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
            // 'AMap.ToolBar', // 缩放按钮
            'AMap.Scale', // 比例尺
            'AMap.DistrictLayer', // 定位
        ],
    }).then(mapItem => {
        AMap = mapItem
        map = new AMap.Map('container', {
            center: [113.567688,33.85284],
            zoom: 7.5, // 缩放级别
            mapStyle: 'amap://styles/whitesmoke'
        })

        map.setFeatures(['bg'])
        // bg 区域面
        // point 兴趣点
        // road 道路和道路标记
        // building 建筑物

        // map.addControl(new AMap.ToolBar())
        map.addControl(new AMap.Scale())

        // let CodeShandong = 370000 // 山东
        // 省/直辖市行政区代码 参考：https://config.net.cn/tools/ProvinceCityZipCode.html
        let CodeHenan = 410000 // 河南
        initPro(CodeHenan, DEPTH.city)
        provinceMarkers.forEach(item => {
            addMarker(map, item)
        })

    }).catch(e => {
        console.log(e)
    })
})

// 文档参考：https://lbs.amap.com/api/javascript-api/guide/layers/districtlayer
// demo参考：https://lbs.amap.com/demo/javascript-api/example/district/district-pro
function initPro(code, dep) {
    layerCity && layerCity.setMap(null)
    layerCity = new AMap.DistrictLayer.Province({
        zIndex: 8,
        adcode: [code],
        depth: dep,
        styles: {
            'fill': properties => {
                // properties为可用于做样式映射的字段，包含
                // NAME_CHN:中文名称
                // adcode_pro
                // adcode_cit
                // adcode
                if (properties.adcode.toString().indexOf('41') === 0) { // 给各个市上色
                    return ColorsProvince[properties.adcode].color
                }
            },
            'province-stroke': 'black',
            'city-stroke': 'white', // 中国地级市边界
            'county-stroke': 'rgba(255,255,255,0.5)' // 中国区县边界
        }
    })

    layerCity.setMap(map)
}

function addMarker(map, item) {
    let marker = new AMap.Marker({
        position: item.position,
        offset: new AMap.Pixel(0,-20),
        content: `
               <div class="marker-plate">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note.replace(/\n/g, '<br>')}</div>
               </div>`,
    })
    map.add(marker)
}

onUnmounted(() => {
    map.clearInfoWindow() // 清除地图上的信息窗体
    map.destroy() // 销毁地图，释放内存
    map = null
})


</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";
.map-container {
    position: relative;
}


</style>
