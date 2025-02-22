import type { CrosswordPuzzle } from '@/types'
import { useLocalStorage } from '@vueuse/core'
import { computed, toRef, type MaybeRefOrGetter } from 'vue'

export const useCrossword = <EmptyValue extends string = '0', BlockValue extends string = '#'>({
  crosswordData,
}: {
  crosswordData: MaybeRefOrGetter<
    CrosswordPuzzle<
      {
        width: number
        height: number
      },
      EmptyValue,
      BlockValue
    >
  >
}) => {
  const crossword = toRef(crosswordData)
  const saved = useLocalStorage(
    () => `crossword-${crossword.value.uniqueid}`,
    () =>
      new Array(crossword.value.dimensions.height)
        .fill('')
        .map(() => new Array(crossword.value.dimensions.width).fill('')),
  )
  const board = computed(() => crossword.value.puzzle)
  const dimensions = computed(() => crossword.value.dimensions)
  return {
    saved,
    crossword,
    board,
    dimensions,
    metadata: computed(() => ({
      title: crossword.value.title,
      intro: crossword.value.intro,
      annotation: crossword.value.annotation,
      notes: crossword.value.notes,
      publisher: crossword.value.publisher,
      publication: crossword.value.publication,
      empty: crossword.value.empty || '0',
      block: crossword.value.block || '#',
    })),
  }
}
