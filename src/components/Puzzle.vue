<script setup lang="ts" generic="EmptyValue extends string = '0', BlockValue extends string = '#'">
import type { CrosswordPuzzle } from '@/types'
import { computed, type PropType } from 'vue'
import { useCrosswordData } from '@/composables/useCrosswordData'
import { providePuzzleContext } from '@/composables/providePuzzleContext'
import PuzzleBoard from './PuzzleBoard.vue'
import PuzzleCluesList from './PuzzleClues/PuzzleCluesList.vue'
import Icon from './Icon.vue'
import clockIconData from '@/assets/clock.svg?raw'
import infoIconData from '@/assets/info.svg?raw'
import chevronIconData from '@/assets/chevron-left.svg?raw'
import PuzzleCluesSelector from './PuzzleClues/PuzzleCluesSelector.vue'

const props = defineProps({
  puzzleData: {
    type: Object as PropType<
      CrosswordPuzzle<{ width: number; height: number }, EmptyValue, BlockValue>
    >,
    required: true,
  },
  clueSelectorFixedPosition: {
    type: String,
    default: '',
  },
})

const crossword = useCrosswordData(computed(() => props.puzzleData))
providePuzzleContext<EmptyValue, BlockValue>({
  puzzle: crossword,
})
const { isCompleted } = crossword

const checkCrosswordSolution = async () => {
  if (!crossword.crossword.value.uniqueid) {
    return console.error('Nie można sprawdzić krzyżówki, skontaktuj się z administracją')
  }

  const baseURL = import.meta.env.PROD
    ? 'https://www.miesiecznik.znak.com.pl'
    : 'http://localhost:8080'

  const coupon = await fetch(`${baseURL}/wp-json/crossword-plugin/v0/crossword/1/solve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      solution: crossword.saved.value.map((row, y) =>
        row.map((cell, x) => {
          const blockValue = crossword.metadata.value.block
          const puzzleCell = crossword.board.value[y][x].cell
          if (puzzleCell === blockValue) return blockValue
          if (puzzleCell === null) return ''
          return cell
        }),
      ),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      if (data.status !== 'success') return Promise.reject(data)
      if (data.code === 'wrong_solution') {
        alert('Niepoprawne rozwiązanie, spróbuj czegoś innego :)')
        return
      }
      return data.data.coupon
    })
    .catch((error) => {
      console.error('Error:', error)
    })

  alert('Wygrałeś, Twój kupon to: ' + coupon)
}
</script>

<template>
  <div
    class="grid grid-rows-[1fr_auto] [grid-template-areas:'board''clue-selector'] md:[grid-template-areas:'clue-selector_.''board_clues'] md:grid-cols-[min-content_minmax(0,1fr)] md:gap-y-4 md:gap-x-8 md:items-start"
  >
    <Teleport to="#frs-puzzle-header">
      <div class="bg-neutral-300">
        <div class="max-w-240 m-auto px-2 xs:px-4.5 py-1.5 flex justify-between items-center">
          <div>
            <Icon :data="clockIconData" class="text-4xl" />
            00:00
          </div>
          <div class="flex gap-4">
            <button
              class="cursor-pointer flex flex-col gap-0.5 text-center text-xs"
              :class="{ 'text-gray-400': !isCompleted }"
              :disabled="!isCompleted"
              :title="
                isCompleted
                  ? 'Sprawdź krzyżówkę'
                  : 'Uzupełnij wszystkie pola zanim będziesz mógł sprawdzić krzyżówkę'
              "
              type="button"
              @click="checkCrosswordSolution"
            >
              <Icon :data="chevronIconData" class="text-[2rem] m-auto mt-0.5 -rotate-105" />
              Gotowe
            </button>
            <button class="cursor-pointer flex flex-col gap-0.5 text-center text-xs" type="button">
              <Icon :data="infoIconData" class="text-[2rem] m-auto mt-0.5" />
              O krzyżówce
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <PuzzleCluesSelector
      class="[grid-area:clue-selector] fixed z-20 bottom-0 inset-x-0 md:translate-y-0 md:static"
      :style="
        clueSelectorFixedPosition && {
          top: clueSelectorFixedPosition,
          bottom: 'auto',
          position: 'absolute',
          transform: 'translateY(-100%)',
          transition: 'ease-out 0.1s',
        }
      "
    />
    <div class="[grid-area:board] mb-4 flex w-full md:w-auto">
      <PuzzleBoard class="m-auto" />
    </div>
    <PuzzleCluesList class="[grid-area:clues]" />

    <PuzzleCluesSelector class="invisible md:hidden" />
  </div>
</template>
