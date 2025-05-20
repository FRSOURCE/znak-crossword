import type { ClueObject, CrosswordPuzzle, Direction, LabeledCellObject } from '@/types'
import { useLocalStorage } from '@vueuse/core'
import { computed, toRef, type MaybeRefOrGetter } from 'vue'

/**
 * A composable function to normalize crossword puzzle data
 * @param crosswordData - a ref or getter of the crossword puzzle data
 * @returns an object containing the saved crossword board, clues, crossword, board, dimensions, and metadata
 */
export const useCrosswordData = <EmptyValue extends string = '0', BlockValue extends string = '#'>(
  crosswordData: MaybeRefOrGetter<
    CrosswordPuzzle<{ width: number; height: number }, EmptyValue, BlockValue>
  >,
) => {
  const crossword = toRef(crosswordData)
  const saved = useLocalStorage(
    () => `crossword-${crossword.value.uniqueid}`,
    () =>
      Array.from<string>({ length: crossword.value.dimensions.height })
        .fill('')
        .map(() => Array.from<string>({ length: crossword.value.dimensions.width }).fill('')),
  )
  const board = computed(() =>
    crossword.value.puzzle.map((row) =>
      row.map((cell): LabeledCellObject<EmptyValue, BlockValue> => {
        if (cell && typeof cell === 'object') return cell
        return { cell }
      }),
    ),
  )
  const block = computed(() => crossword.value.block ?? '#')
  const dimensions = computed(() => crossword.value.dimensions)
  const clues = computed(() => {
    const clues = {} as Record<Direction, ClueObject[]>
    for (const direction in crossword.value.clues) {
      clues[direction as Direction] = crossword.value.clues[direction as Direction].map((clue) => {
        if (Array.isArray(clue)) return { number: clue[0], clue: clue[1] }
        if (typeof clue === 'string') return { number: clue, clue }
        return clue
      })
    }
    return clues
  })
  const isCompleted = computed(() =>
    board.value.every((row, y) =>
      row.every(({ cell }, x) => cell === block.value || cell === null || !!saved.value[y][x]),
    ),
  )
  return {
    saved,
    clues,
    crossword,
    board,
    dimensions,
    isCompleted,
    metadata: computed(() => ({
      title: crossword.value.title,
      intro: crossword.value.intro,
      annotation: crossword.value.annotation,
      notes: crossword.value.notes,
      publisher: crossword.value.publisher,
      publication: crossword.value.publication,
      empty: crossword.value.empty ?? '0',
      block: block.value,
      id: crossword.value.uniqueid,
    })),
  }
}
