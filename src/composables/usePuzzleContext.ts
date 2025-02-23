import { getPuzzleContextKey } from '@/composables/PuzzleContext'
import { inject } from 'vue'

export const usePuzzleContext = <
  EmptyValue extends string = '0',
  BlockValue extends string = '#',
>() => {
  const context = inject(getPuzzleContextKey<EmptyValue, BlockValue>())
  if (!context) {
    throw new Error('usePuzzleContext must be used within a PuzzleContextProvider')
  }
  return context
}
