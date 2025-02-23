<script setup lang="ts" generic="EmptyValue extends string = '0', BlockValue extends string = '#'">
import type { CrosswordPuzzle } from '@/types'
import { computed, type PropType } from 'vue'
import { useCrosswordData } from '@/composables/useCrosswordData'
import { providePuzzleContext } from '@/composables/providePuzzleContext'
import PuzzleBoard from './PuzzleBoard.vue'
import PuzzleClues from './PuzzleClues/PuzzleClues.vue'

const props = defineProps({
  puzzleData: {
    type: Object as PropType<
      CrosswordPuzzle<{ width: number; height: number }, EmptyValue, BlockValue>
    >,
    required: true,
  },
})

const puzzle = useCrosswordData(computed(() => props.puzzleData))
providePuzzleContext<EmptyValue, BlockValue>({
  puzzle,
})
</script>

<template>
  <div class="flex gap-8">
    <PuzzleBoard />
    <PuzzleClues />
  </div>
</template>
