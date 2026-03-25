<template>
    <div class="theme-scene" :data-theme="store.themeMode" aria-hidden="true">
        <template v-if="store.themeMode === 'emerald'">
            <span v-for="(item, index) in emeraldMotes" :key="`emerald-${index}`" class="particle mote" :style="particleStyle(item)"></span>
            <span class="ambient ambient-emerald ambient-emerald-a"></span>
            <span class="ambient ambient-emerald ambient-emerald-b"></span>
        </template>

        <template v-else-if="store.themeMode === 'autumn'">
            <span v-for="(item, index) in autumnLeaves" :key="`autumn-${index}`" class="particle leaf" :style="particleStyle(item)"></span>
            <span class="ambient ambient-autumn ambient-autumn-a"></span>
            <span class="ambient ambient-autumn ambient-autumn-b"></span>
        </template>

        <template v-else-if="store.themeMode === 'galaxy'">
            <span class="milkyway"></span>
            <span v-for="(item, index) in galaxyNebula" :key="`nebula-${index}`" class="particle nebula" :style="particleStyle(item)"></span>
            <span v-for="(item, index) in galaxyStars" :key="`star-${index}`" class="particle star" :style="particleStyle(item)"></span>
        </template>

        <template v-else-if="store.themeMode === 'snow'">
            <span v-for="(item, index) in snowFlakes" :key="`snow-${index}`" class="particle snowflake" :style="particleStyle(item)"></span>
            <span class="ambient ambient-snow ambient-snow-a"></span>
        </template>

        <template v-else-if="store.themeMode === 'summer'">
            <span class="sun-halo"></span>
            <span v-for="(item, index) in summerGlow" :key="`summer-${index}`" class="particle ember" :style="particleStyle(item)"></span>
            <span class="ambient ambient-summer ambient-summer-a"></span>
            <span class="ambient ambient-summer ambient-summer-b"></span>
        </template>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/store.ts";

type SceneParticle = {
    left: string
    top?: string
    size: string
    delay: string
    duration: string
    opacity?: number
    drift?: string
    rotate?: string
}

const store = useProjectStore()

const emeraldMotes: SceneParticle[] = [
    {left: '6%', top: '12%', size: '10px', delay: '0s', duration: '13s', drift: '34px', opacity: 0.38},
    {left: '18%', top: '34%', size: '6px', delay: '1.5s', duration: '11s', drift: '18px', opacity: 0.32},
    {left: '28%', top: '20%', size: '14px', delay: '2.2s', duration: '15s', drift: '24px', opacity: 0.25},
    {left: '42%', top: '8%', size: '8px', delay: '0.8s', duration: '12s', drift: '22px', opacity: 0.35},
    {left: '54%', top: '26%', size: '7px', delay: '3.1s', duration: '14s', drift: '28px', opacity: 0.34},
    {left: '68%', top: '16%', size: '11px', delay: '1.1s', duration: '17s', drift: '20px', opacity: 0.26},
    {left: '78%', top: '38%', size: '5px', delay: '4.4s', duration: '10s', drift: '16px', opacity: 0.35},
    {left: '88%', top: '18%', size: '9px', delay: '2.8s', duration: '16s', drift: '22px', opacity: 0.27},
    {left: '12%', top: '70%', size: '12px', delay: '1.9s', duration: '18s', drift: '26px', opacity: 0.28},
    {left: '38%', top: '74%', size: '6px', delay: '0.4s', duration: '12s', drift: '20px', opacity: 0.32},
    {left: '56%', top: '66%', size: '9px', delay: '2.7s', duration: '14s', drift: '30px', opacity: 0.24},
    {left: '84%', top: '72%', size: '8px', delay: '1.7s', duration: '13s', drift: '18px', opacity: 0.31},
]

const autumnLeaves: SceneParticle[] = [
    {left: '4%', size: '18px', delay: '0s', duration: '13s', drift: '46px', rotate: '12deg', opacity: 0.72},
    {left: '12%', size: '24px', delay: '1.2s', duration: '15s', drift: '62px', rotate: '-18deg', opacity: 0.8},
    {left: '24%', size: '20px', delay: '2.6s', duration: '12s', drift: '38px', rotate: '25deg', opacity: 0.68},
    {left: '36%', size: '16px', delay: '0.8s', duration: '11s', drift: '42px', rotate: '-12deg', opacity: 0.62},
    {left: '48%', size: '22px', delay: '3.4s', duration: '14s', drift: '55px', rotate: '14deg', opacity: 0.74},
    {left: '58%', size: '18px', delay: '1.8s', duration: '16s', drift: '36px', rotate: '-22deg', opacity: 0.7},
    {left: '68%', size: '14px', delay: '0.3s', duration: '10s', drift: '30px', rotate: '18deg', opacity: 0.6},
    {left: '78%', size: '21px', delay: '2.1s', duration: '13.5s', drift: '48px', rotate: '-10deg', opacity: 0.76},
    {left: '88%', size: '17px', delay: '4.1s', duration: '12.5s', drift: '44px', rotate: '16deg', opacity: 0.66},
]

const galaxyNebula: SceneParticle[] = [
    {left: '8%', top: '10%', size: '240px', delay: '0s', duration: '18s', drift: '0px', opacity: 0.36},
    {left: '56%', top: '14%', size: '280px', delay: '2s', duration: '24s', drift: '0px', opacity: 0.28},
    {left: '72%', top: '58%', size: '220px', delay: '1s', duration: '20s', drift: '0px', opacity: 0.22},
]

const galaxyStars: SceneParticle[] = [
    {left: '6%', top: '14%', size: '3px', delay: '0.3s', duration: '3.4s', opacity: 0.9},
    {left: '14%', top: '28%', size: '2px', delay: '1.1s', duration: '4.8s', opacity: 0.75},
    {left: '18%', top: '66%', size: '4px', delay: '2.3s', duration: '4.2s', opacity: 0.88},
    {left: '26%', top: '12%', size: '2px', delay: '0.7s', duration: '5.2s', opacity: 0.64},
    {left: '32%', top: '48%', size: '3px', delay: '1.9s', duration: '3.8s', opacity: 0.82},
    {left: '38%', top: '72%', size: '2px', delay: '2.9s', duration: '5.4s', opacity: 0.72},
    {left: '46%', top: '20%', size: '4px', delay: '1.4s', duration: '4.1s', opacity: 0.93},
    {left: '54%', top: '40%', size: '2px', delay: '3.2s', duration: '5.6s', opacity: 0.76},
    {left: '62%', top: '9%', size: '3px', delay: '0.9s', duration: '3.9s', opacity: 0.84},
    {left: '68%', top: '58%', size: '2px', delay: '1.8s', duration: '5.1s', opacity: 0.68},
    {left: '74%', top: '26%', size: '5px', delay: '2.1s', duration: '4.4s', opacity: 0.94},
    {left: '81%', top: '44%', size: '3px', delay: '3.4s', duration: '3.7s', opacity: 0.78},
    {left: '88%', top: '18%', size: '2px', delay: '0.2s', duration: '5.0s', opacity: 0.66},
    {left: '92%', top: '68%', size: '4px', delay: '1.6s', duration: '4.6s', opacity: 0.86},
]

const snowFlakes: SceneParticle[] = [
    {left: '5%', size: '6px', delay: '0s', duration: '11s', drift: '16px', opacity: 0.72},
    {left: '10%', size: '9px', delay: '2.2s', duration: '13s', drift: '24px', opacity: 0.84},
    {left: '18%', size: '8px', delay: '0.7s', duration: '12s', drift: '18px', opacity: 0.78},
    {left: '27%', size: '5px', delay: '1.5s', duration: '9s', drift: '14px', opacity: 0.66},
    {left: '35%', size: '10px', delay: '2.8s', duration: '15s', drift: '26px', opacity: 0.9},
    {left: '43%', size: '6px', delay: '1.2s', duration: '11s', drift: '20px', opacity: 0.74},
    {left: '52%', size: '7px', delay: '3.1s', duration: '12.5s', drift: '22px', opacity: 0.86},
    {left: '60%', size: '4px', delay: '0.4s', duration: '8.5s', drift: '12px', opacity: 0.6},
    {left: '68%', size: '9px', delay: '1.9s', duration: '14s', drift: '24px', opacity: 0.82},
    {left: '76%', size: '6px', delay: '2.4s', duration: '10s', drift: '18px', opacity: 0.7},
    {left: '84%', size: '11px', delay: '0.9s', duration: '16s', drift: '28px', opacity: 0.92},
    {left: '92%', size: '5px', delay: '3.8s', duration: '9.5s', drift: '14px', opacity: 0.68},
]

const summerGlow: SceneParticle[] = [
    {left: '8%', top: '20%', size: '14px', delay: '0s', duration: '15s', drift: '20px', opacity: 0.34},
    {left: '16%', top: '58%', size: '8px', delay: '1.3s', duration: '12s', drift: '16px', opacity: 0.28},
    {left: '30%', top: '30%', size: '12px', delay: '0.7s', duration: '11s', drift: '22px', opacity: 0.36},
    {left: '42%', top: '68%', size: '9px', delay: '2.5s', duration: '13s', drift: '18px', opacity: 0.26},
    {left: '56%', top: '18%', size: '16px', delay: '1.8s', duration: '16s', drift: '28px', opacity: 0.32},
    {left: '68%', top: '44%', size: '10px', delay: '3.4s', duration: '12s', drift: '20px', opacity: 0.24},
    {left: '76%', top: '14%', size: '18px', delay: '0.9s', duration: '17s', drift: '26px', opacity: 0.38},
    {left: '84%', top: '62%', size: '11px', delay: '2.2s', duration: '14s', drift: '24px', opacity: 0.29},
    {left: '92%', top: '34%', size: '7px', delay: '4.1s', duration: '10s', drift: '16px', opacity: 0.22},
]

function particleStyle(item: SceneParticle) {
    return {
        left: item.left,
        top: item.top,
        width: item.size,
        height: item.size,
        opacity: item.opacity ?? 1,
        animationDelay: item.delay,
        animationDuration: item.duration,
        '--drift': item.drift ?? '0px',
        '--rotate': item.rotate ?? '0deg',
    }
}
</script>

<style lang="scss" scoped>
.theme-scene{
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
}

.particle,
.ambient,
.milkyway,
.sun-halo{
    position: absolute;
}

.mote{
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(113,255,176,0.64) 45%, rgba(113,255,176,0) 100%);
    box-shadow: 0 0 20px rgba(113,255,176,0.3);
    animation: mote-float linear infinite;
}

.ambient-emerald{
    border-radius: 50%;
    filter: blur(40px);
    background: radial-gradient(circle, rgba(112, 255, 174, 0.28) 0%, rgba(112,255,174,0) 70%);
}

.ambient-emerald-a{
    top: 6%;
    left: 18%;
    width: 320px;
    height: 320px;
}

.ambient-emerald-b{
    right: 6%;
    bottom: 10%;
    width: 260px;
    height: 260px;
}

.leaf{
    top: -12%;
    border-radius: 60% 0 60% 0;
    background: linear-gradient(140deg, rgba(255, 220, 133, 0.95) 0%, rgba(214, 117, 34, 0.95) 100%);
    box-shadow: inset -2px -2px 0 rgba(132, 66, 9, 0.18);
    animation: leaf-fall linear infinite;
}

.ambient-autumn{
    border-radius: 50%;
    filter: blur(55px);
}

.ambient-autumn-a{
    top: -10%;
    right: 4%;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(255, 195, 95, 0.34) 0%, rgba(255,195,95,0) 72%);
}

.ambient-autumn-b{
    bottom: -12%;
    left: -5%;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(215, 120, 30, 0.24) 0%, rgba(215,120,30,0) 76%);
}

.milkyway{
    top: 12%;
    left: -12%;
    width: 124%;
    height: 38%;
    background: linear-gradient(90deg, rgba(96, 119, 255, 0) 0%, rgba(148, 126, 255, 0.08) 16%, rgba(255,255,255,0.18) 50%, rgba(101, 137, 255, 0.08) 82%, rgba(96, 119, 255, 0) 100%);
    transform: rotate(-12deg);
    filter: blur(14px);
    opacity: 0.72;
}

.nebula{
    border-radius: 50%;
    filter: blur(48px);
    background: radial-gradient(circle, rgba(151, 132, 255, 0.32) 0%, rgba(84, 127, 255, 0.16) 34%, rgba(84,127,255,0) 74%);
    animation: nebula-breathe ease-in-out infinite;
}

.star{
    border-radius: 50%;
    background: rgba(255,255,255,0.96);
    box-shadow: 0 0 10px rgba(173, 199, 255, 0.85);
    animation: star-twinkle ease-in-out infinite;
}

.snowflake{
    top: -12%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(214,235,255,0.86) 58%, rgba(214,235,255,0) 100%);
    box-shadow: 0 0 12px rgba(213, 236, 255, 0.72);
    animation: snow-fall linear infinite;
}

.ambient-snow{
    border-radius: 50%;
    filter: blur(54px);
}

.ambient-snow-a{
    top: -8%;
    left: 12%;
    width: 360px;
    height: 360px;
    background: radial-gradient(circle, rgba(195, 225, 255, 0.34) 0%, rgba(195,225,255,0) 72%);
}

.sun-halo{
    top: -10%;
    right: -4%;
    width: 360px;
    height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 220, 136, 0.34) 0%, rgba(255, 164, 96, 0.2) 28%, rgba(255,164,96,0) 72%);
    filter: blur(18px);
}

.ember{
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,248,210,0.96) 0%, rgba(255, 157, 102, 0.82) 40%, rgba(255,157,102,0) 100%);
    box-shadow: 0 0 18px rgba(255, 161, 94, 0.3);
    animation: ember-drift linear infinite;
}

.ambient-summer{
    border-radius: 50%;
    filter: blur(52px);
}

.ambient-summer-a{
    bottom: 6%;
    right: 22%;
    width: 260px;
    height: 260px;
    background: radial-gradient(circle, rgba(255, 126, 87, 0.24) 0%, rgba(255,126,87,0) 70%);
}

.ambient-summer-b{
    top: 24%;
    left: -6%;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(255, 209, 120, 0.2) 0%, rgba(255,209,120,0) 72%);
}

@keyframes mote-float {
    0% {
        transform: translate3d(0, 0, 0) scale(0.86);
    }
    50% {
        transform: translate3d(var(--drift), -26px, 0) scale(1.08);
    }
    100% {
        transform: translate3d(0, -52px, 0) scale(0.9);
    }
}

@keyframes leaf-fall {
    0% {
        transform: translate3d(0, -8vh, 0) rotate(var(--rotate));
    }
    100% {
        transform: translate3d(var(--drift), 118vh, 0) rotate(calc(var(--rotate) + 280deg));
    }
}

@keyframes nebula-breathe {
    0%, 100% {
        transform: scale(0.92);
    }
    50% {
        transform: scale(1.08);
    }
}

@keyframes star-twinkle {
    0%, 100% {
        opacity: 0.35;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1.25);
    }
}

@keyframes snow-fall {
    0% {
        transform: translate3d(0, -10vh, 0);
    }
    100% {
        transform: translate3d(var(--drift), 118vh, 0);
    }
}

@keyframes ember-drift {
    0% {
        transform: translate3d(0, 18px, 0) scale(0.82);
    }
    50% {
        transform: translate3d(var(--drift), -18px, 0) scale(1.08);
    }
    100% {
        transform: translate3d(0, -46px, 0) scale(0.88);
    }
}
</style>
