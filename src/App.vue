<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import { ref } from 'vue'
import Puzzle from './components/Puzzle.vue'

if (!import.meta.env.SSR && window.visualViewport) {
  document.body.style.height = `${window.visualViewport.height}px`
  window.visualViewport.addEventListener(
    'resize',
    () => {
      document.body.style.height = `${window.visualViewport?.height}px`
    },
    { passive: true },
  )
}

const puzzles = {
  test: () => import('@/assets/test.ipuz'),
  another: () => import('@/assets/another.ipuz'),
}
const activePuzzleId = ref(Object.keys(puzzles)[0] as keyof typeof puzzles)
const isPuzzleDataLoading = ref(false)
const puzzleLoadingError = ref<unknown | undefined>()
const puzzleData = computedAsync(
  async () => {
    puzzleLoadingError.value = undefined
    return (await puzzles[activePuzzleId.value]()).default
  },
  undefined,
  {
    evaluating: isPuzzleDataLoading,
    onError(e) {
      puzzleLoadingError.value = e
    },
  },
)
</script>
<template>
  <main class="h-full flex flex-col items-center justify-center gap-2">
    Puzzles:
    <div class="flex gap-x-2 mb-4">
      <button
        type="button"
        v-for="(_, puzzleId) in puzzles"
        :disabled="activePuzzleId === puzzleId"
        @click="activePuzzleId = puzzleId"
        class="px-4 py-2 border rounded hover:opacity-50 cursor-pointer"
        :class="{ 'bg-yellow-200': activePuzzleId === puzzleId }"
      >
        {{ puzzleId }}
      </button>
    </div>
    <div v-if="isPuzzleDataLoading">Loading</div>
    <div v-else-if="puzzleLoadingError" class="max-w-120">
      <pre class="break-normal text-wrap">
Error loading the puzzle: {{ puzzleLoadingError }} {{ puzzleData }}</pre
      >
    </div>
    <div v-else-if="!puzzleData">No puzzle data</div>
    <Puzzle v-else :puzzleData="puzzleData" />
  </main>
</template>
