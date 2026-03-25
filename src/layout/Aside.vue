<template>
    <ElAside :class="{mobile: store.isInPortraitMode}"
              :style="`min-height: ${heightAside}px`"
              :width="`${store.navWidth}px`">
       <div class="navbar">
           <div class="navbar-decor">
               <div class="decor-orb decor-orb-top"></div>
               <div class="decor-orb decor-orb-bottom"></div>
               <div class="decor-beam"></div>
               <div class="decor-grid"></div>
           </div>
           <Logo :height="heightLogo"/>
           <Navbar class="side-menu" :height="heightNavbar"/>
           <Copyright v-show="!store.isNavMenuFold" :height="heightCopyright"/>
       </div>
    </ElAside>
</template>

<script lang="ts" setup>

import Navbar from "./Navbar.vue"
import Copyright from "./Copyright.vue";
import Logo from "./Logo.vue";
import {onMounted, ref, watch} from "vue";

import {useProjectStore} from "@/store.ts";

const store = useProjectStore()

const heightAside = ref(0)
const heightNavbar = ref(0)
const heightLogo = ref(100)
const heightCopyright = ref(150)

onMounted(()=>{
    resizeComponents()
})

watch(store.windowInsets, () => {
    resizeComponents()
},{deep: true})

watch(() => store.isNavMenuFold, () => {
    resizeComponents()
})

function resizeComponents(){
    heightAside.value = store.isInPortraitMode? store.windowInsets.height - 50 : store.windowInsets.height// padding aside remove
    heightNavbar.value = Math.max(120, heightAside.value - heightLogo.value - heightCopyright.value)
    if (store.isInPortraitMode){
        store.navWidth = store.windowInsets.width
    } else {
        store.navWidth = 200// 当从移动端切到 PC 时，重新设置 NavMenu 的宽度
    }
}
</script>

<style lang="scss" scoped>
@import "../scss/plugin";

$border-color: #ddd;
.el-aside {
    &.mobile{
        z-index: 999;
        position: fixed;
        top: 0;
        left: 0;
        width: 100% !important;
        padding: 40px;
        background-color: transparent;
        .navbar{
            //border: 1px solid $border-color;
            border: none;
            @include box-shadow(1px 1px 3px rgba(0,0,0,0.2));
            @include border-radius(10px);
        }
    }
}
.navbar{
    position: relative;
    border-right: 1px solid var(--theme-border-soft, #ddd);
    overflow: hidden;
    background: var(--theme-sidebar-bg);
    box-shadow: inset -1px 0 0 var(--theme-sidebar-edge);
}

.side-menu{
    position: relative;
    z-index: 1;
    overflow: hidden;
    overflow-y: auto;
}

.navbar-decor{
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}

.decor-orb{
    position: absolute;
    border-radius: 50%;
    filter: blur(12px);
    opacity: 0.55;
}

.decor-orb-top{
    top: -42px;
    right: -26px;
    width: 128px;
    height: 128px;
    background: radial-gradient(circle, var(--theme-decor-1) 0%, rgba(255,255,255,0) 72%);
}

.decor-orb-bottom{
    bottom: 96px;
    left: -40px;
    width: 144px;
    height: 144px;
    background: radial-gradient(circle, var(--theme-decor-2) 0%, rgba(255,255,255,0) 74%);
}

.decor-beam{
    position: absolute;
    top: 84px;
    left: -24px;
    width: 220px;
    height: 220px;
    background: linear-gradient(135deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0) 62%);
    transform: rotate(12deg);
}

.decor-grid{
    position: absolute;
    inset: 18px 14px auto auto;
    width: 72px;
    height: 110px;
    opacity: 0.22;
    background-image:
        radial-gradient(circle, var(--theme-grid-dot) 1.2px, transparent 1.2px);
    background-size: 12px 12px;
}
</style>
