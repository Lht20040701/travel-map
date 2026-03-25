<template>
  <article
      class="card"
      :class="{ 'card--link': canJump, 'card--measure': noImage }"
      :data-id="item.id"
      @click="handleClick"
  >
    <div
        class="cover"
        v-if="!noImage"
    >
      <Transition>
        <img
            v-if="loaded"
            :src="item.url"
            alt="图片"
        />
        <svg v-else width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
          <g fill="none" fill-rule="evenodd" stroke-width="2">
            <circle cx="22" cy="22" r="1">
              <animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"></animate>
              <animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"></animate>
            </circle>
            <circle cx="22" cy="22" r="1">
              <animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"></animate>
              <animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"></animate>
            </circle>
          </g>
        </svg>
      </Transition>
    </div>
    <div
        class="body"
        v-if="!onlyImage"
    >
      <h3>{{ item.title }}</h3>
      <div class="author">
        <div class="avatar">
          <img
              :src="item.avatar"
              :alt="item.user"
          />
          <span>{{ item.user }}</span>
        </div>
        <div class="views">❤️ {{ item.views > 999 ? '999+' : item.views }}</div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ItemOption } from './imageFallInterface'

const props = withDefaults(
    defineProps<{
      item: ItemOption
      onlyImage?: boolean
      noImage?: boolean
      width?: string
    }>(),
    {
      onlyImage: false,
      noImage: false,
      width: '100%'
    }
)

const router = useRouter()
const loaded = ref(false)
const height = ref('auto')

const canJump = computed(() => props.item && props.item.luntanId !== null && props.item.luntanId !== undefined)

const handleClick = () => {
  if (!canJump.value) return
  // 跳转到论坛详情页（与 ForumList 中保持一致）
  router.push({
    name: 'ForumDetail',
    query: { luntanId: props.item.luntanId }
  })
}

onBeforeMount(() => {
  if (!props.noImage) {
    height.value = '100%'
    new Promise(resolve => {
      const image = new Image()
      image.src = props.item.url
      if (image.complete) {
        loaded.value = true
        resolve(true)
        return
      }

      image.onload = () => {
        loaded.value = true
        resolve(true)
      }

      image.onerror = error => {
        console.error(props.item.url, error)
        loaded.value = true
        resolve(true)
      }
    })
  }
})
</script>

<style scoped lang="scss">
.card {
  position: relative;
  display: block;
  width: v-bind(width);
  height: v-bind(height);
  overflow: hidden;
  background: #d8e0ea;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 0;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  isolation: isolate;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;

  &.card--link {
    cursor: pointer;
    border-color: rgba(255, 255, 255, 0.08);
  }

  &.card--link::before,
  &.card--link::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  &.card--link::before {
    inset: -2px;
    background: linear-gradient(120deg, #ff5f6d, #ffc371, #4facfe, #43e97b, #b86cff, #ff5f6d);
    background-size: 300% 300%;
    animation: rgb-border 4.2s linear infinite;
    opacity: 0.95;
  }

  &.card--link::after {
    inset: 1px;
    background: rgba(0, 0, 0, 0.16);
    mix-blend-mode: soft-light;
  }

  &.card--link:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 48px rgba(15, 23, 42, 0.16);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &.card--measure {
    height: auto;
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  .cover {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: linear-gradient(160deg, #d9e3ef 0%, #c4d0e0 100%);
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.001);
      transition: transform 0.55s ease, filter 0.4s ease;
    }
  }

  &.card--link:hover .cover img {
    transform: scale(1.045);
    filter: saturate(1.05) contrast(1.02);
  }

  .body {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    padding: 52px 16px 16px;
    background: linear-gradient(180deg, rgba(6, 11, 18, 0) 0%, rgba(6, 11, 18, 0.2) 28%, rgba(6, 11, 18, 0.86) 100%);
    color: #f8fafc;
    opacity: 0;
    transform: translateY(14px);
    transition: opacity 0.28s ease, transform 0.28s ease;
    pointer-events: none;

    h3 {
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-weight: 700;
      font-size: 16px;
      line-height: 1.35;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .author {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 10px;

      .avatar {
        display: flex;
        flex-direction: row;
        align-items: center;
        min-width: 0;

        img {
          width: 24px;
          height: 24px;
          object-fit: cover;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.65);
          background: rgba(255, 255, 255, 0.16);
        }

        span {
          margin-left: 8px;
          overflow: hidden;
          color: rgba(248, 250, 252, 0.92);
          font-size: 12px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .views {
        flex-shrink: 0;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.14);
        color: rgba(248, 250, 252, 0.96);
        font-size: 12px;
        backdrop-filter: blur(8px);
      }
    }
  }

  &.card--measure .body {
    position: static;
    z-index: auto;
    padding: 0;
    background: transparent;
    color: #111827;
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  &.card--measure .body h3 {
    font-size: 14px;
    -webkit-line-clamp: unset;
  }

  &.card--measure .body .author {
    margin-top: 8px;
  }

  &.card--measure .body .author .avatar img {
    border: none;
    background: #e5e7eb;
  }

  &.card--measure .body .author .avatar span,
  &.card--measure .body .author .views {
    color: #374151;
  }

  &.card--measure .body .author .views {
    padding: 0;
    background: transparent;
    backdrop-filter: none;
  }
}

@keyframes rgb-border {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@media (hover: hover) {
  .card:hover .body {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (hover: none) {
  .card .body {
    opacity: 1;
    transform: translateY(0);
  }
}
.v-enter-active,
.v-leave-active {
  opacity: 1;
  transition: all 0.4s linear;
  will-change: opacity;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  will-change: opacity;
}
</style>
