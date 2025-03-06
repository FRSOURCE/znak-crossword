import { getPuzzleContextKey, type ActiveCell, type ActiveClue } from '@/composables/PuzzleContext'
import { useCrosswordData } from '@/composables/useCrosswordData'
import type { ClueNum, ClueObject, Direction } from '@/types'
import { computed, provide, ref } from 'vue'

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

  const activeClues = computed(() => {
    const activeClues: { direction: Direction; number: ClueNum }[] = []
    const { x, y, direction } = activeCell.value
    if (x === undefined || y === undefined) return activeClues
    if (direction === 'horizontal') {
      if (puzzle.clues.value?.Across) {
        for (let currentX = x; currentX >= 0; --currentX) {
          const { cell } = board.value[y][currentX]
          if (cell === metadata.value.block || cell === null) break
          if (cell === metadata.value.empty || cell === undefined) continue
          if (!puzzle.clues.value.Across.find((clue) => clue.number === cell)) continue
          activeClues.push({ direction: 'Across', number: cell })
        }
      }
    } else if (direction === 'vertical') {
      if (puzzle.clues.value?.Down) {
        for (let currentY = y; currentY >= 0; --currentY) {
          const { cell } = board.value[currentY][x]
          if (cell === metadata.value.block || cell === null) break
          if (cell === metadata.value.empty || cell === undefined) continue
          if (!puzzle.clues.value.Down.find((clue) => clue.number === cell)) continue
          activeClues.push({ direction: 'Down', number: cell })
        }
      }
    }

    return activeClues
  })
  const activeClue = computed(() => {
    const clue = activeClues.value[0]
    if (!clue) return
    const { direction, number } = clue
    return {
      direction,
      clue: puzzle.clues.value[direction].find((clue) => clue.number === number),
    }
  })

  const setActiveClue = ({ direction, clue }: ActiveClue) => {
    const number = clue?.number
    if (number === undefined) return
    board.value.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell?.cell && cell?.cell === number) {
          activeCell.value = { x, y, direction: direction === 'Across' ? 'horizontal' : 'vertical' }
        }
      })
    })
  }

  provide(getPuzzleContextKey<EmptyValue, BlockValue>(), {
    puzzle,
    activeCell,
    setActiveCell,
    activeClue,
    setActiveClue,
  })

  return {
    activeCell,
    setActiveCell,
  }
}
