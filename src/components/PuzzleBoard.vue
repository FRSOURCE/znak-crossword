<script setup lang="ts" generic="EmptyValue extends string = '0', BlockValue extends string = '#'">
import type { CrosswordPuzzle, LabeledCell, LabeledCellPrimitive } from '@/types'
import { computed, provide, ref, type PropType } from 'vue'
import PuzzleCell from '@/components/PuzzleCell.vue'
import { useCrossword } from '@/composables/useCrossword'
import { puzzleBoardContextKey, type ActiveCell } from './PuzzleBoardContext'

const props = defineProps({
  puzzleData: {
    type: Object as PropType<
      CrosswordPuzzle<{ width: number; height: number }, EmptyValue, BlockValue>
    >,
    required: true,
  },
})

const { board, saved, dimensions, metadata } = useCrossword({
  crosswordData: computed(() => props.puzzleData),
})

const activeCell = ref<ActiveCell>({ direction: 'horizontal' })
const setActiveCell = ({
  x,
  y,
  direction,
}: {
  y?: number
  x?: number
  direction: ActiveCell['direction']
}) => {
  if (direction !== activeCell.value.direction) {
    activeCell.value = { ...activeCell.value, direction }
    return
  }
  if (x === undefined || y === undefined) {
    activeCell.value = { x, y, direction }
    return
  }
  if (x === activeCell.value?.x && y === activeCell.value?.y) return
  if (x < 0 || x >= dimensions.value.width || y < 0 || y >= dimensions.value.height) return
  if (
    ([metadata.value.block, null] as (typeof board)['value'][number][number][]).includes(
      board.value[y][x],
    )
  ) {
    return
  }

  activeCell.value = { x, y, direction }
}

provide(puzzleBoardContextKey, {
  activeCell,
  setActiveCell,
})
</script>

<template>
  <div role="grid" class="flex flex-col rounded overflow-hidden gap-px" translate="no">
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
