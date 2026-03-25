<template>
    <ElPopover
        placement="top-end"
        trigger="click"
        :width="332"
        popper-class="theme-switcher-popper"
    >
        <template #reference>
            <button class="theme-trigger" type="button">
                <span class="theme-trigger-swatch" :style="{ background: currentTheme?.swatch }"></span>
                <span class="theme-trigger-copy">
                    <strong>主题</strong>
                    <small>{{ currentTheme?.label }}</small>
                </span>
                <ElIcon class="theme-trigger-icon"><Brush /></ElIcon>
            </button>
        </template>

        <ThemePicker />
    </ElPopover>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {useProjectStore} from "@/store.ts";
import ThemePicker from "@/layout/ThemePicker.vue";
import {THEMES} from "@/theme.ts";

const store = useProjectStore()

const currentTheme = computed(() => {
    return THEMES.find(item => item.key === store.themeMode) || THEMES[0]
})
</script>

<style lang="scss" scoped>
.theme-trigger{
    position: fixed;
    right: 22px;
    bottom: 22px;
    z-index: 1200;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 118px;
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.34);
    background: rgba(255,255,255,0.92);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.16);
    backdrop-filter: blur(14px);
    color: var(--theme-text-main);
    cursor: pointer;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.theme-trigger:hover{
    transform: translateY(-2px);
    border-color: rgba(var(--theme-main-rgb), 0.34);
    box-shadow: 0 24px 44px rgba(15, 23, 42, 0.2);
}

.theme-trigger-swatch{
    display: block;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.6);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
}

.theme-trigger-copy{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
}

.theme-trigger-copy strong{
    font-size: 12px;
    font-weight: 700;
    line-height: 1.1;
}

.theme-trigger-copy small{
    margin-top: 3px;
    color: var(--theme-text-description);
    font-size: 10px;
    line-height: 1.1;
}

.theme-trigger-icon{
    margin-left: auto;
    color: var(--theme-main);
    font-size: 16px;
}

@media (max-width: 640px) {
    .theme-trigger{
        right: 14px;
        bottom: 18px;
        min-width: auto;
        padding: 10px 12px;
    }

    .theme-trigger-copy{
        display: none;
    }
}
</style>
