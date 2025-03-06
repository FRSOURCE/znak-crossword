<script setup lang="ts" generic="EmptyValue extends string = '0', BlockValue extends string = '#'">
import PuzzleCell from '@/components/PuzzleCell.vue'
import { usePuzzleContext } from '@/composables/usePuzzleContext'
import { computed } from 'vue'

const {
  setActiveCell,
  puzzle: { dimensions, saved, board, metadata },
} = usePuzzleContext<EmptyValue, BlockValue>()

const cellSizeClasses = computed(() => {
  if (dimensions.value.width > 6 || dimensions.value.height > 6)
    return 'w-11 h-11 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18'

  return 'w-12 h-12 xs:w-15 xs:h-15 sm:w-17 sm:h-17 md:w-18 md:h-18 lg:w-24 lg:h-24'
})
</script>

<template>
  <div
    role="grid"
    class="flex flex-col rounded overflow-hidden gap-px border-2 bg-black md:border-4 md:rounded-lg md:gap-0.5"
    translate="no"
  >
    <div v-for="row in dimensions.height" :key="row" class="flex gap-px md:gap-0.5" role="row">
      <PuzzleCell
        v-for="column in dimensions.width"
        :key="column"
        role="gridcell"
        class="flex-shrink-0"
        :class="cellSizeClasses"
        v-model="saved[row - 1][column - 1]"
        :cell="board[row - 1][column - 1]"
        :row="row - 1"
        :column="column - 1"
        :empty-value="metadata.empty"
        :block-value="metadata.block"
        @keydown.up.prevent="setActiveCell({ y: row - 2, x: column - 1, direction: 'vertical' })"
        @keydown.down.prevent="setActiveCell({ y: row, x: column - 1, direction: 'vertical' })"
        @keydown.left.prevent="
          setActiveCell({ y: row - 1, x: column - 2, direction: 'horizontal' })
        "
        @keydown.right.prevent="setActiveCell({ y: row - 1, x: column, direction: 'horizontal' })"
      />
    </div>
  </div>
</template>
