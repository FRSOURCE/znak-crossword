<script setup lang="ts">
import { computed } from 'vue'
import { usePuzzleContext } from '@/composables/usePuzzleContext'
import type { ClueObject, Direction } from '@/types'
import Icon from '../Icon.vue'
import chevronLeftData from '@/assets/chevron-left.svg?raw'

const {
  puzzle: { clues },
  activeClue,
  setActiveClue,
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

const activatePreviousClue = () => {
  if (!activeClue.value) return
  const clueIndex = clueList.value.findIndex((clue) => {
    return (
      clue.direction === activeClue.value?.direction &&
      clue.clue.number === activeClue.value?.clue?.number
    )
  })
  if (clueIndex === -1 || clueIndex <= 0) return
  setActiveClue(clueList.value[clueIndex - 1])
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
  setActiveClue(clueList.value[clueIndex + 1])
}
</script>

<template>
  <div class="flex justify-between py-2.5 bg-active-600">
    <button type="button" class="px-2 cursor-pointer" @click="activatePreviousClue()">
      <Icon :data="chevronLeftData" class="text-3xl" />
    </button>
    <div class="self-center w-full font-medium uppercase text-center leading-4">
      <button
        v-if="activeClue?.clue"
        type="button"
        class="cursor-pointer uppercase font-medium"
        :class="{ 'text-sm': activeClue.clue.clue?.length && activeClue.clue.clue?.length > 45 }"
        @click="setActiveClue({ direction: activeClue.direction, clue: activeClue.clue })"
        v-html="activeClue.clue.clue"
      />
      <span v-else class="text-sm"
        >Wybierz pole krzyżówki, by zobaczyć związaną z nim podpowiedź</span
      >
    </div>
    <button type="button" class="px-2 cursor-pointer" @click="activateNextClue()">
      <Icon :data="chevronLeftData" class="text-3xl rotate-180" />
    </button>
  </div>
</template>
