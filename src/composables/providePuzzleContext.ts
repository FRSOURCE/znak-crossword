import { getPuzzleContextKey, type ActiveCell } from '@/composables/PuzzleContext'
import { useCrosswordData } from '@/composables/useCrosswordData'
import { provide, ref } from 'vue'

export const providePuzzleContext = <
  EmptyValue extends string = '0',
  BlockValue extends string = '#',
>({
  puzzle,
}: {
  puzzle: ReturnType<typeof useCrosswordData<EmptyValue, BlockValue>>
}) => {
  const { board, dimensions, metadata } = puzzle
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

  provide(getPuzzleContextKey<EmptyValue, BlockValue>(), {
    puzzle,
    activeCell,
    setActiveCell,
  })

  return {
    activeCell,
    setActiveCell,
  }
}
