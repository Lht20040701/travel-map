<template>
    <section class="theme-panel">
        <div class="theme-head">
            <div class="theme-title">主题风格</div>
            <div class="theme-subtitle">Theme Scene</div>
        </div>
        <div class="theme-grid">
            <button
                v-for="theme in THEMES"
                :key="theme.key"
                :class="['theme-chip', {active: store.themeMode === theme.key}]"
                type="button"
                @click="switchTheme(theme.key)"
            >
                <span class="theme-swatch" :style="{ background: theme.swatch }"></span>
                <span class="theme-meta">
                    <strong>{{ theme.label }}</strong>
                    <small>{{ theme.subtitle }}</small>
                </span>
            </button>
        </div>
    </section>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/store.ts";
import {THEMES, type ThemeMode} from "@/theme.ts";

const store = useProjectStore()

function switchTheme(theme: ThemeMode) {
    store.themeMode = theme
}
</script>

<style lang="scss" scoped>
.theme-panel{
    position: relative;
    z-index: 1;
    width: 312px;
    padding: 14px;
    border: 1px solid var(--theme-border-soft, rgba(31, 157, 85, 0.18));
    background: var(--theme-panel-shell, rgba(255,255,255,0.92));
    box-shadow: 0 22px 48px rgba(15, 23, 42, 0.14);
    backdrop-filter: blur(16px);
}

.theme-head{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
}

.theme-title{
    color: var(--theme-sidebar-text, #183024);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
}

.theme-subtitle{
    color: var(--theme-sidebar-muted, #50715d);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.theme-grid{
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.theme-chip{
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 7px 8px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    background: var(--theme-panel-surface, rgba(255, 255, 255, 0.5));
    color: var(--theme-panel-text, var(--theme-sidebar-text, #183024));
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
}

.theme-chip:hover{
    transform: translateY(-1px);
    border-color: var(--theme-border-strong, rgba(31, 157, 85, 0.35));
    background: var(--theme-panel-surface-hover, rgba(255, 255, 255, 0.72));
}

.theme-chip.active{
    border-color: var(--theme-main, #1f9d55);
    background: linear-gradient(135deg, rgba(var(--theme-main-rgb, 31,157,85), 0.16), rgba(255,255,255,0.74));
    box-shadow: 0 10px 24px rgba(var(--theme-main-rgb, 31,157,85), 0.18);
}

.theme-swatch{
    display: block;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: 1px solid rgba(255,255,255,0.46);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
}

.theme-meta{
    display: flex;
    flex-direction: column;
    min-width: 0;
    text-align: left;
}

.theme-meta strong{
    overflow: hidden;
    font-size: 12px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.theme-meta small{
    overflow: hidden;
    margin-top: 2px;
    color: var(--theme-sidebar-muted, #50715d);
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
