import type { InjectionKey, Ref } from 'vue'

export type ActiveCell = { x?: number; y?: number; direction: 'horizontal' | 'vertical' }
export type PuzzleBoardContext = {
  activeCell: Ref<ActiveCell>
  setActiveCell: (input: ActiveCell) => void
}

export const puzzleBoardContextKey = Symbol(
  'PuzzleBoardContext',
) as InjectionKey<PuzzleBoardContext>
