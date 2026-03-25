<template>
    <div class="logo-container" :style="`height: ${height}px`">
        <div :class="['logo', {narrow: store.isNavMenuFold}]" @click="handleCollapseToggle">
            <img src="../assets/logo.png" alt="LOGO">
        </div>
        <div v-if="!store.isNavMenuFold" class="brand-copy">
            <div class="brand-title">路书</div>
            <div class="brand-subtitle">Green Map Journal</div>
        </div>
    </div>

</template>

<script lang="ts" setup>
import {useProjectStore} from "@/store.ts";

const store = useProjectStore()

withDefaults(defineProps<{
    height?: number
}>(), {
    height: 100
})

function handleCollapseToggle() {
    if (store.isInPortraitMode){
        store.isShowFloatingMenuBtn = !store.isShowFloatingMenuBtn
    } else {
        store.isNavMenuFold = !store.isNavMenuFold
        store.navWidth = store.isNavMenuFold ? 64 : 200
    }
}
</script>

<style lang="scss" scoped>
@import "../scss/plugin";
$height-logo: 60px;
$height-logo-narrow: 40px;
.logo-container{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--theme-border-soft, #{$border-color-nav});
    position: relative;
    z-index: 1;
}
.logo{
    cursor: pointer;
    height: $height-logo;
    width: $height-logo;
    img{
        display: block;
        width: 100%;
    }
    &.narrow{
        height: $height-logo-narrow;
        width: $height-logo-narrow;
    }
}

.brand-copy{
    min-width: 0;
}

.brand-title{
    color: var(--theme-sidebar-text, #{$text-main});
    font-size: 20px;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: 0.04em;
}

.brand-subtitle{
    margin-top: 4px;
    color: var(--theme-sidebar-muted, #{$text-description});
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

</style>
