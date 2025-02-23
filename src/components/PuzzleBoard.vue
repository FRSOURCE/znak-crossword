<script setup lang="ts" generic="EmptyValue extends string = '0', BlockValue extends string = '#'">
import PuzzleCell from '@/components/PuzzleCell.vue'
import { usePuzzleContext } from '@/composables/usePuzzleContext'

const {
  setActiveCell,
  puzzle: { dimensions, saved, board, metadata },
} = usePuzzleContext<EmptyValue, BlockValue>()
</script>

<template>
  <div
    role="grid"
    class="flex flex-col rounded overflow-hidden gap-px border bg-current"
    translate="no"
  >
    <div v-for="row in dimensions.height" :key="row" class="flex gap-px" role="row">
      <div v-for="column in dimensions.width" :key="column">
        <PuzzleCell
          role="gridcell"
          class="w-12 h-12 text-2xl"
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
  </div>
</template>
