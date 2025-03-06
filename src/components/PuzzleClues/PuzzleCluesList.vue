<script setup lang="ts">
import { usePuzzleContext } from '@/composables/usePuzzleContext'
import ClueLine from '@/components/PuzzleClues/ClueLine.vue'

const {
  puzzle: { clues },
  activeClue,
  setActiveClue,
} = usePuzzleContext()
</script>

<template>
  <div class="hidden md:flex flex-col gap-10">
    <div v-for="(cluesArray, direction) in clues" :key="direction" class="hidden md:block">
      <div class="hidden md:block font-bold uppercase">
        {{ direction === 'Across' ? 'Poziomo' : 'Pionowo' }}
      </div>
      <div class="flex flex-col font-medium">
        <ClueLine
          v-for="(clue, i) in cluesArray"
          :key="i"
          :clue="clue"
          :is-active="
            !!clue.number &&
            activeClue?.direction === direction &&
            activeClue?.clue?.number === clue.number
          "
          @click="setActiveClue({ direction, clue })"
        />
      </div>
    </div>
  </div>
</template>
