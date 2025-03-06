import type { useCrosswordData } from '@/composables/useCrosswordData'
import type { ClueObject, Direction } from '@/types'
import type { ComputedRef, InjectionKey, Ref } from 'vue'

export type ActiveCell = { x?: number; y?: number; direction: 'horizontal' | 'vertical' }
export type ActiveClue = { direction: Direction; clue?: ClueObject }
export type PuzzleContext<EmptyValue extends string = '0', BlockValue extends string = '#'> = {
  puzzle: ReturnType<typeof useCrosswordData<EmptyValue, BlockValue>>
  activeCell: Ref<ActiveCell>
  setActiveCell: (input: ActiveCell) => void
  activeClue: ComputedRef<ActiveClue | undefined>
  setActiveClue: ({ direction, clue }: ActiveClue) => void
}

const puzzleContextKey = Symbol('PuzzleBoardContext')
export const getPuzzleContextKey = <
  EmptyValue extends string = '0',
  BlockValue extends string = '#',
>() => puzzleContextKey as InjectionKey<PuzzleContext<EmptyValue, BlockValue>>
