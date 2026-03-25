<template>
    <div class="app-shell">
        <ThemeScene/>
        <ThemeSwitcher/>
        <div class="app-content">
            <RouterView/>
        </div>
        <ElDialog center title="提示" width="50%"
                  :visible.sync="modalTip">
            <p class="text-center">地图多次拖动后会变得卡顿，刷新页面即可</p>
            <div slot="footer" class="dialog-footer">
                <ElButton size="small" type="primary" @click="checkTip">OK</ElButton>
            </div>
        </ElDialog>
    </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useProjectStore} from "@/store.ts";
import {getAuthorization} from "@/utility.ts";
import ThemeScene from "@/layout/ThemeScene.vue";
import ThemeSwitcher from "@/layout/ThemeSwitcher.vue";
import {applyThemeToDocument, getStoredTheme, setStoredTheme} from "@/theme.ts";

const store = useProjectStore()

const modalTip = ref(false)
store.themeMode = getStoredTheme()
const resizeHandler = () => {
    onResize()
}

watch(() => store.themeMode, (themeMode) => {
    applyThemeToDocument(themeMode)
    setStoredTheme(themeMode)
}, {immediate: true})

onMounted(() => {
    store.authorization = getAuthorization()
    modalTip.value = !localStorage.getItem('map-has-checked-tip')
    onResize()
    window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
})

function onResize() {
    store.windowInsets.height = window.innerHeight
    store.windowInsets.width = window.innerWidth
    store.contentInsets.heightContent = window.innerHeight - store.contentInsets.heightToolbar - store.contentInsets.heightPager
    store.contentInsets.widthContent = window.innerWidth - store.navWidth
}

function checkTip(){
    localStorage.setItem('map-has-checked-tip', 'true')
    modalTip.value = false
}

</script>

<style lang="scss">
@import "./scss/main";

.app-shell{
    position: relative;
    min-height: 100vh;
}

.app-content{
    position: relative;
    z-index: 1;
}
</style>
