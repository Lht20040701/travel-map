<template>
  <VirtualWaterfall
      ref="vw"
      :virtual="waterfallOption.virtual"
      :gap="waterfallOption.gap"
      :enable-cache="waterfallOption.enableCache"
      :padding="waterfallOption.padding"
      :preload-screen-count="[waterfallOption.topPreloadScreenCount, waterfallOption.bottomPreloadScreenCount]"
      :item-min-width="waterfallOption.itemMinWidth"
      :max-column-count="waterfallOption.maxColumnCount"
      :min-column-count="waterfallOption.minColumnCount"
      :calc-item-height="calcItemHeight"
      :items="data.list"
  >
    <template #default="{ item }: { item: ItemOption }">
      <Card
          :item="item"
          :onlyImage="waterfallOption.onlyImage"
      >
      </Card>
    </template>
  </VirtualWaterfall>
</template>

<script setup lang="ts">
import { VirtualWaterfall } from '@lhlyu/vue-virtual-waterfall'
import Card from './Card.vue'
import useWaterfall from './useWaterfall.ts'

const { waterfallOption, data, calcItemHeight } = useWaterfall()
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
