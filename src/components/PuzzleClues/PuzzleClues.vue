<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { usePuzzleContext } from '@/composables/usePuzzleContext'
import ClueLine from '@/components/PuzzleClues/ClueLine.vue'
import type { ClueNum, ClueObject, Direction } from '@/types'

const {
  puzzle: { clues, board, metadata },
  activeCell,
} = usePuzzleContext()

const clueList = computed(() => {
  const clueList: { direction: Direction; clue: ClueObject }[] = []
  for (const direction in clues.value) {
    clues.value[direction as Direction].forEach((clue) => {
      clueList.push({ direction: direction as Direction, clue })
    })
  }
  return clueList
})
const activeClues = computed(() => {
  const activeClues: { direction: Direction; number: ClueNum }[] = []
  const { x, y, direction } = activeCell.value
  if (x === undefined || y === undefined) return activeClues
  if (direction === 'horizontal') {
    if (clues.value?.Across) {
      for (let currentX = x; currentX >= 0; --currentX) {
        const { cell } = board.value[y][currentX]
        if (cell === metadata.value.block || cell === null) break
        if (cell === metadata.value.empty || cell === undefined) continue
        if (!clues.value.Across.find((clue) => clue.number === cell)) continue
        activeClues.push({ direction: 'Across', number: cell })
      }
    }
  } else if (direction === 'vertical') {
    if (clues.value?.Down) {
      for (let currentY = x; currentY >= 0; --currentY) {
        const { cell } = board.value[currentY][x]
        if (cell === metadata.value.block || cell === null) break
        if (cell === metadata.value.empty || cell === undefined) continue
        if (!clues.value.Down.find((clue) => clue.number === cell)) continue
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
    clue: clues.value[direction].find((clue) => clue.number === number),
  }
})

const activateClue = ({ direction, clue }: { direction: Direction; clue?: ClueObject }) => {
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

const activatePreviousClue = () => {
  if (!activeClue.value) return
  const clueIndex = clueList.value.findIndex((clue) => {
    return (
      clue.direction === activeClue.value?.direction &&
      clue.clue.number === activeClue.value?.clue?.number
    )
  })
  if (clueIndex === -1 || clueIndex <= 0) return
  activateClue(clueList.value[clueIndex - 1])
}

const activateNextClue = () => {
  if (!activeClue.value) return
  const clueIndex = clueList.value.findIndex((clue) => {
    return (
      clue.direction === activeClue.value?.direction &&
      clue.clue.number === activeClue.value?.clue?.number
    )
  })
  if (clueIndex === -1 || clueIndex >= clueList.value.length - 1) return
  activateClue(clueList.value[clueIndex + 1])
}
</script>

<template>
  <div class="fixed top-0 inset-x-0 md:static">
    <span class="hidden md:block">Clues:</span>
    <div class="flex md:gap-2">
      <button type="button" class="px-2 bg-blue-200 md:hidden" @click="activatePreviousClue()">
        &lt;
      </button>
      <div class="w-full md:hidden">
        <ClueLine
          v-if="activeClue?.clue"
          :clue="activeClue.clue"
          is-active
          @click="activateClue({ direction: activeClue.direction, clue: activeClue.clue })"
        />
        <div v-else class="px-2 py-1 text-center bg-blue-200">
          Choose a crossword cell to see a hint
        </div>
      </div>
      <div v-for="(cluesArray, direction) in clues" :key="direction" class="hidden md:block">
        <div class="hidden md:block font-bold">{{ direction }}</div>
        <div class="flex flex-col">
          <ClueLine
            v-for="(clue, i) in cluesArray"
            :key="i"
            :clue="clue"
            :is-active="
              !!clue.number &&
              !!activeClues.find(
                (activeClue) =>
                  activeClue.direction === direction && activeClue.number === clue.number,
              )
            "
            @click="activateClue({ direction, clue })"
          />
        </div>
      </div>
      <button type="button" class="px-2 bg-blue-200 md:hidden" @click="activateNextClue()">
        &gt;
      </button>
    </div>
  </div>
</template>
