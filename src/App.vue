<script setup lang="ts">
import { computedAsync, throttledRef } from '@vueuse/core'
import { computed, ref } from 'vue'
import logoIconData from '@/assets/logo-crossword.svg?raw'
import Puzzle from './components/Puzzle.vue'
import Icon from './components/Icon.vue'

const clueSelectorFixedPosition = ref<string>()
const clueSelectorFixedPositionThrottled = throttledRef(clueSelectorFixedPosition, 10)

if (!import.meta.env.SSR && window.visualViewport) {
  const VIEWPORT_VS_CLIENT_HEIGHT_RATIO = 0.75
  const { visualViewport } = window
  const recalculateViewportHeight = () => {
    const realVisualViewportHeight = visualViewport.height * visualViewport.scale
    let isMobileKeyboardShown =
      realVisualViewportHeight / window.screen.height < VIEWPORT_VS_CLIENT_HEIGHT_RATIO
    document.body.style.height = `${window.visualViewport?.height}px`
    document.documentElement.style.height = `${window.visualViewport?.height}px`
    clueSelectorFixedPosition.value = isMobileKeyboardShown
      ? `${Math.ceil(realVisualViewportHeight + window.scrollY)}px`
      : undefined
  }

  recalculateViewportHeight()
  window.visualViewport.addEventListener('resize', recalculateViewportHeight, { passive: true })
  window.addEventListener('scroll', recalculateViewportHeight, { passive: true })
}

const puzzles = {
  test: () => import('@/assets/test.ipuz'),
  another: () => import('@/assets/another.ipuz'),
  'even bigger': () => import('@/assets/even-bigger.ipuz'),
  '7x7': () => import('@/assets/even-bigger-7x7.ipuz'),
}
const activePuzzleId = ref(Object.keys(puzzles)[1] as keyof typeof puzzles)
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

const openDevMenu = ref(false)
const isDebugMode = computed(() => {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('debug') !== null
})
</script>
<template>
  <main class="h-full w-full flex flex-col">
    <header class="sticky z-100 top-0 w-full bg-white" id="frs-puzzle-header">
      <nav class="py-2.5 border-b">
        <div class="m-auto max-w-240 px-2 xs:px-4.5 flex items-center justify-between">
          <a class="inline-block" href="https://www.miesiecznik.znak.com.pl/">
            <img
              src="@/assets/logo.webp"
              srcset="@/assets/logo.webp 180w, @/assets/logo-2x.webp 360w"
              sizes="(min-width: 30em) 180px,
                    136px"
              alt="Logotyp miesięcznika Znak - wielki napis ZNAK, a poniżej niego napis miesięcznik"
            />
          </a>
          <a
            class="inline-block px-4.5 py-3.5 text-xs font-bold bg-primary-600 uppercase text-white rounded-full"
            href="https://www.miesiecznik.znak.com.pl/"
            >Strona Główna</a
          >
        </div>
      </nav>
    </header>
    <div
      v-if="isDebugMode"
      class="fixed z-100 left-0 top-0 bottom-0 transition bg-white"
      :class="{ ['-translate-x-full']: !openDevMenu }"
    >
      <button
        class="relative top-36 -right-full bg-[#fff9] p-4 transition-[right] duration-500"
        type="button"
        @click="openDevMenu = !openDevMenu"
        :class="{ 'right-0': openDevMenu }"
      >
        {{ openDevMenu ? '< Close debug window' : 'Open debug window >' }}
      </button>
      Load puzzles menu:
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
    </div>
    <div class="sr-only md:not-sr-only">
      <div class="mt-6 px-2 xs:px-4.5 md:flex justify-center items-center gap-8">
        <Icon :data="logoIconData" class="text-8xl" />
        <h1 class="text-3xl font-bold">Krzyżówka ZNAKU</h1>
      </div>
    </div>
    <div
      class="grow flex flex-col w-full items-center justify-center md:block max-w-240 mx-auto sm:px-3 pt-8 md:pt-11"
    >
      <template v-if="isPuzzleDataLoading">Loading</template>
      <template v-else-if="puzzleLoadingError">
        <pre class="break-normal text-wrap">
Error loading the puzzle: {{ puzzleLoadingError }} {{ puzzleData }}</pre
        >
      </template>
      <template v-else-if="!puzzleData">No puzzle data</template>
      <Puzzle
        v-else
        :puzzleData="puzzleData"
        :clue-selector-fixed-position="clueSelectorFixedPositionThrottled"
        class="w-full"
      />
    </div>
    <section
      class="hidden md:flex flex-col pt-6 pb-8 items-center bg-linear-to-b from-[#F4F3F4] to-white"
    >
      <p class="m-auto max-w-160 px-2 xs:px-4.5 text-xs uppercase text-primary-600">
        Najpiękniejszy polski magazyn intelektualny
      </p>
      <div class="mt-4 mx-auto max-w-160 px-2 xs:px-4.5 flex gap-3.5">
        <img
          src="@/assets/newsletter.webp"
          srcset="@/assets/newsletter.webp 120w, @/assets/newsletter-2x.webp 240w"
          width="120"
          height="120"
          alt="Ręka trzymająca kolorowy egzemplarz miesięcznika ZNAK"
        />
        <div class="font-medium">
          <h2 class="font-serif font-bold text-2xl">Podaruj sobie inspirację</h2>
          <p>
            Dołącz do naszych newsletterowiczów, żeby zacząć rok z wyjątkowymi tekstami i
            poleceniami ZNAKu!
          </p>
          <p>Co tydzień damy Ci znać o krzyżówce.</p>
        </div>
      </div>
      <a
        class="mt-2 block px-16 py-2 text-xs font-bold bg-primary-600 uppercase text-white rounded-full"
        href="https://www.miesiecznik.znak.com.pl/wsluchajsie/"
        >Zapisz mnie</a
      >
    </section>
  </main>
</template>
