<script setup lang="ts">
import { useMediaQuery, computedAsync, throttledRef } from '@vueuse/core'
import { computed, defineAsyncComponent, onMounted, ref, type UnwrapRef } from 'vue'
import Puzzle from '@/components/Puzzle.vue'
import type { CrosswordPuzzle } from '@/types'
import NewsletterBanner from '@/components/NewsletterBanner.vue'
import PuzzleInfoBanner from '@/components/PuzzleInfoBanner.vue'
import Navbar from '@/components/Navbar.vue'
import Icon from '@/components/Icon.vue'
import logoIconData from '@/assets/logo-crossword.svg?raw'

const clueSelectorFixedPosition = ref<string>()
const clueSelectorFixedPositionThrottled = throttledRef(clueSelectorFixedPosition, 10)
const hasTouchPointer = useMediaQuery('(pointer: coarse)')

if (!import.meta.env.SSR && window.visualViewport) {
  const VIEWPORT_VS_CLIENT_HEIGHT_RATIO = 0.75
  const { visualViewport } = window
  const recalculateViewportHeight = () => {
    const realVisualViewportHeight = visualViewport.height * visualViewport.scale
    let isMobileKeyboardShown =
      realVisualViewportHeight / window.screen.height < VIEWPORT_VS_CLIENT_HEIGHT_RATIO
    document.body.style.height = `${window.visualViewport?.height}px`
    document.documentElement.style.height = `${window.visualViewport?.height}px`
    clueSelectorFixedPosition.value =
      hasTouchPointer.value && isMobileKeyboardShown
        ? `${Math.ceil(realVisualViewportHeight + window.scrollY)}px`
        : undefined
  }

  recalculateViewportHeight()
  window.visualViewport.addEventListener('resize', recalculateViewportHeight, { passive: true })
  window.addEventListener('scroll', recalculateViewportHeight, { passive: true })
}

const AsyncDebugPuzzleMenu = defineAsyncComponent(() => import('./components/DebugPuzzleMenu.vue'))

const isDebugMode = computed(() => {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('debug') !== null
})
const isGameStarted = ref(false)

const demoPuzzles = {
  test: () => import('@/assets/test.ipuz'),
  another: () => import('@/assets/another.ipuz'),
  'even bigger': () => import('@/assets/even-bigger.ipuz'),
  '7x7': () => import('@/assets/even-bigger-7x7.ipuz'),
}
const puzzles = ref(
  demoPuzzles as {
    [k in keyof typeof demoPuzzles | 'default-ssr']?: () =>
      | Promise<typeof import('*.ipuz')>
      | typeof import('*.ipuz')
  },
)
const activePuzzleId = ref(
  import.meta.env.PROD && import.meta.env.VITE_IS_STAGE !== 'true'
    ? 'default-ssr'
    : (Object.keys(puzzles.value)[1] as keyof UnwrapRef<typeof puzzles>),
)
const isPuzzleDataLoading = ref(false)
const puzzleLoadingError = ref<unknown | undefined>()
const puzzleData = computedAsync(
  async () => {
    puzzleLoadingError.value = undefined
    return (await puzzles.value[activePuzzleId.value]?.())?.default
  },
  undefined,
  {
    evaluating: isPuzzleDataLoading,
    onError(e) {
      puzzleLoadingError.value = e
    },
  },
)

onMounted(() => {
  if (import.meta.env.PROD && import.meta.env.VITE_IS_STAGE !== 'true') {
    puzzles.value = {
      ...puzzles.value,
      ['default-ssr']: () => ({
        default: (
          window as unknown as {
            ZNAK_CROSSWORD_DATA: CrosswordPuzzle<{ width: number; height: number }>
          }
        ).ZNAK_CROSSWORD_DATA,
      }),
    }
  }
})
</script>
<template>
  <main class="h-full w-full flex flex-col">
    <Navbar />
    <AsyncDebugPuzzleMenu
      v-if="isDebugMode"
      :puzzles="puzzles"
      v-model:active-puzzle-id="activePuzzleId"
    />
    <div v-if="!isGameStarted" :class="{ 'sr-only md:not-sr-only': isGameStarted }">
      <div
        class="mt-6 px-2 xs:px-4.5 flex justify-center items-center gap-6 md:mt-10 md:gap-8 tracking-tight xs:tracking-normal"
        :class="{ 'flex-col text-center': !isGameStarted }"
      >
        <Icon :data="logoIconData" class="text-8xl" />
        <h1 class="text-3xl font-bold">Krzyżówka ZNAKU</h1>
      </div>
    </div>
    <PuzzleInfoBanner v-if="!isGameStarted" @start-game-click="isGameStarted = true" class="mt-4" />
    <div
      v-else
      class="grow flex flex-col w-full items-center md:justify-center md:block max-w-240 mx-auto sm:px-3 pt-8 md:pt-11"
    >
      <template v-if="isPuzzleDataLoading">Loading</template>
      <template v-else-if="puzzleLoadingError">
        <pre class="break-normal text-wrap">
Błąd podczas wczytywania puzzli: {{ puzzleLoadingError }} {{ puzzleData }}</pre
        >
        Skontaktuj się z nami, jeśli problem się powtarza.
      </template>
      <template v-else-if="!puzzleData">
        <p>Aktualnie nie ma żadnej aktywnej krzyżówki.</p>
        <p>Uważasz, że to błąd? Napisz do nas!</p>
      </template>
      <template v-else>
        <client-only>
          <Puzzle
            :puzzleData="puzzleData"
            :clue-selector-fixed-position="clueSelectorFixedPositionThrottled"
            class="w-full"
          />
        </client-only>
      </template>
    </div>
    <NewsletterBanner :is-game-started="isGameStarted" />
  </main>
</template>
