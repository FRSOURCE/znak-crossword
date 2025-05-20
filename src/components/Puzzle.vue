<script setup lang="ts" generic="EmptyValue extends string = '0', BlockValue extends string = '#'">
import { computed, nextTick, ref, useTemplateRef, watch, type PropType, type UnwrapRef } from 'vue'
import { useClipboard, useNow, watchDebounced } from '@vueuse/core'
import type { CrosswordPuzzle } from '@/types'
import { useCrosswordData } from '@/composables/useCrosswordData'
import { providePuzzleContext } from '@/composables/providePuzzleContext'
import PuzzleBoard from './PuzzleBoard.vue'
import PuzzleCluesList from './PuzzleClues/PuzzleCluesList.vue'
import Icon from '@/components/Icon.vue'
import clockIconData from '@/assets/clock.svg?raw'
import copyIconData from '@/assets/copy.svg?raw'
import checkIconData from '@/assets/check.svg?raw'
import infoIconData from '@/assets/info.svg?raw'
// import chevronIconData from '@/assets/chevron-left.svg?raw'
import PuzzleCluesSelector from './PuzzleClues/PuzzleCluesSelector.vue'
import Modal from '@/components/Modal.vue'
import Button from './Button.vue'
import { useConfetti } from '@/composables/useConfetti'
import { useBreakpoints } from '@/composables/useBreakpoints'

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

const { md } = useBreakpoints()
const canvas = useTemplateRef('canvas')
const { shoot: shootDesktop } = useConfetti({ topDelay: 1500 })
const { shoot } = useConfetti({ canvas, mode: ['top'], duration: 5 })

let timeDiff = 0
let startTime = new Date()
const { now, pause: pauseNow, resume: resumeNow } = useNow({ interval: 1000, controls: true })
const isTimerActive = ref(true)
const timeElapsed = computed(() => {
  const diffInSeconds = Math.floor((now.value.getTime() - startTime.getTime() + timeDiff) / 1000)
  const seconds = diffInSeconds % 60
  const minutes = Math.floor(diffInSeconds / 60) % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

watch(isTimerActive, (isActive) => {
  if (isActive) {
    startTime = new Date()
    resumeNow()
  } else {
    pauseNow()
    timeDiff += now.value.getTime() - startTime.getTime()
  }
})

const crossword = useCrosswordData(computed(() => props.puzzleData))
providePuzzleContext<EmptyValue, BlockValue>({
  puzzle: crossword,
})
const { isCompleted } = crossword

const infoModalOpen = ref(false)
const modalOpen = ref(false)
const modalState = ref<'loading' | 'completed' | 'wrongSolution' | 'error' | undefined>()

watch(modalOpen, () => {
  if (!open) {
    setTimeout(() => {
      if (modalOpen.value) return
      modalState.value = undefined
    }, 500)
  }
})

const coupon = ref('')
const { copy: copyCoupon, copied: couponCopied } = useClipboard({ source: coupon })

watchDebounced(
  [crossword.saved, isCompleted],
  () => {
    if (isCompleted.value) {
      checkCrosswordSolution()
    }
  },
  { deep: true, debounce: 2500 },
)

const fetchCheckSolution = async (id: string): Promise<{
  coupon?: string
  nextModalState: UnwrapRef<typeof modalState>
}> => {
  const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
  const {
    dimensions: { value: dimensions },
    saved: { value: saved },
  } = crossword

  try {
    const res = await fetch(
      `${baseURL}/wp-json/crossword-plugin/v0/crossword/${id}/solve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // eslint-disable-next-line eslint-plugin-unicorn(no-new-array)
          solution: new Array(dimensions.width).fill(0).map((_, y) =>
            // eslint-disable-next-line eslint-plugin-unicorn(no-new-array)
            new Array(dimensions.height).fill(0).map((_, x) => {
              const cell = saved[y][x]
              const blockValue = crossword.metadata.value.block
              const puzzleCell = crossword.board.value[y][x].cell
              if (puzzleCell === blockValue) return blockValue
              if (puzzleCell === null) return ''
              return cell
            }),
          ),
        }),
      },
    )
    const data = await res.json()
    if (data.code === 'wrong_solution') return { nextModalState: 'wrongSolution' }
    if (data.status !== 'success') return { nextModalState: 'error' }

    return { coupon: data.data.coupon, nextModalState: 'completed' }
  } catch (e) {
    console.error('Error fetching solution:', e)
    return { nextModalState: 'error' }
  }
}

const checkCrosswordSolution = async () => {
  if (!crossword.metadata.value.id) {
    return console.error('Nie można sprawdzić krzyżówki, skontaktuj się z administracją')
  }
  modalOpen.value = true
  modalState.value = 'loading'
  isTimerActive.value = false

  const [{ coupon: couponData, nextModalState }] = await Promise.all([
    fetchCheckSolution(crossword.metadata.value.id),
    new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 4000)
    }),
  ])

  modalState.value = nextModalState

  if (couponData && nextModalState === 'completed') {
    coupon.value = couponData
    nextTick(() =>
      requestAnimationFrame(() => {
        if (md.value) shootDesktop()
        else shoot()
      }),
    )
  }
}

const onModalClose = () => {
  if (modalState.value !== 'completed') isTimerActive.value = true
  modalOpen.value = false
}
</script>

<template>
  <div
    class="grid grid-rows-[1fr_auto] [grid-template-areas:'board''clue-selector'] md:[grid-template-areas:'clue-selector_.''board_clues'] md:grid-cols-[min-content_minmax(0,1fr)] md:gap-y-4 md:gap-x-8 md:items-start"
  >
    <Teleport to="#frs-puzzle-header">
      <div class="bg-neutral-300">
        <div
          class="max-w-240 m-auto px-2 xs:px-4.5 py-1.5 md:py-3 flex justify-between items-center"
        >
          <div>
            <Icon :data="clockIconData" class="text-4xl" />
            {{ timeElapsed }}
          </div>
          <div class="flex gap-4">
            <!-- <button
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
            </button> -->
            <button
              class="cursor-pointer flex flex-col gap-0.5 text-center text-xs"
              type="button"
              @click="infoModalOpen = true"
            >
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
    <div class="[grid-area:board] mb-6 flex w-full md:w-auto">
      <PuzzleBoard class="m-auto" />
    </div>
    <PuzzleCluesList class="[grid-area:clues]" />

    <PuzzleCluesSelector class="invisible md:hidden" />

    <Modal
      :model-value="modalOpen"
      @update:model-value="onModalClose"
      class="flex flex-col items-center text-center"
      show-after-mount
      :closable="modalState !== 'loading'"
      :dialog-class="modalState === 'completed' ? '!from-[#A5FFBC] to-40%' : ''"
      v-slot="{ close }"
    >
      <canvas
        class="fixed w-full h-full top-0 left-0 z-10 pointer-events-none"
        width="100%"
        height="100%"
        ref="canvas"
      ></canvas>
      <p class="m-auto max-w-160 px-2 xs:px-4.5 pb-4 text-xs uppercase text-primary-600">
        Krzyżowka ZNAKU
      </p>
      <div class="flex flex-col items-center" v-if="modalState === 'completed'">
        <h2 class="mb-3 font-serif font-bold text-2xl">50% zniżki jest Twoje!</h2>
        <p class="font-medium">Gratulujemy, rozwiązanie krzyżówki zajęło Ci: {{ timeElapsed }}!</p>
        <p class="font-medium mt-2">
          Skopiuj i zapisz poniższy kod rabatowy. Wklej go w okienko "Dodaj kod rabatowy" podczas
          kupowania subskrypcji.
        </p>
        <button
          type="button"
          class="mt-2 md:mt-4 py-3 pr-4 bg-neutral-100 rounded-xl cursor-pointer focus-visible:outline-2 outline-offset-2 outline-primary-600 hover:opacity-60 transition-opacity"
          @click="copyCoupon()"
          aria-label="Kliknij, by skopiować kod rabatowy"
        >
          <span class="px-8">{{ coupon }}</span>
          <Icon :data="couponCopied ? checkIconData : copyIconData" class="text-4xl" />
        </button>

        <Button
          href="https://www.miesiecznik.znak.com.pl/subskrypcja/"
          size="sm"
          class="mt-4 mx-auto px-10 block"
          target="_blank"
        >
          Kupuję subskrypcję
        </Button>

        <p class="mt-4 text-xs">
          Kod rabatowy jest ważny przez 60 dni od daty opublikowania krzyżówki.
        </p>
      </div>
      <div v-else-if="modalState === 'loading'">
        <h2 class="mb-3 font-serif font-bold text-2xl">Sprawdzanie krzyżówki...</h2>
        <p class="font-medium">
          Proszę czekać, Twoje rozwiązanie jest teraz wnikliwie oceniane przez naszych jurorów 🔍
        </p>
        <p class="mt-4 text-sm font-medium">Prosimy, nie zamykaj tej strony.</p>
      </div>
      <div v-else-if="modalState === 'wrongSolution'">
        <h2 class="mb-3 font-serif font-bold text-2xl">Jesteś blisko!</h2>
        <p class="font-medium">Niestety to jeszcze nie jest poprawne rozwiązanie krzyzówki.</p>
        <p class="font-medium">
          Spróbuj ponownie i odbierz 50% zniżki na subskrypcję Miesięcznika Znak.
        </p>
        <Button size="sm" class="mt-6 md:mt-4 mx-auto px-16 block" @click="close()">
          Próbuję dalej!
        </Button>
      </div>
      <div v-else>
        <h2 class="mb-3 font-serif font-bold text-2xl">Błąd!</h2>
        <p class="font-medium">Mamy błąd z naszym serwerem.</p>
        <p class="font-medium">
          Spróbuj ponownie za jakiś czas lub skontaktuj się z nami, jeśli problem się powtarza.
        </p>
        <Button size="sm" class="mt-6 md:mt-4 mx-auto px-16 block" @click="close()">
          Zamknij
        </Button>
      </div>
    </Modal>

    <Modal
      v-model="infoModalOpen"
      class="flex flex-col items-center text-center"
      show-after-mount
      closable
      v-slot="{ close }"
    >
      <p class="m-auto max-w-160 px-2 xs:px-4.5 pb-4 text-xs uppercase text-primary-600">
        Krzyżowka ZNAKU
      </p>
      <div class="flex flex-col items-center">
        <h2 class="mb-3 font-serif font-bold text-2xl">Baw się z nami co tydzień!</h2>
        <p class="font-medium">Gdy ją rozwiążesz, otrzymasz 50% zniżki na subskrypcję.</p>
        <p class="font-bold">Miłej zabawy!</p>
        <Button size="sm" class="mt-6 md:mt-4 mx-auto px-16 block" @click="close()">
          Zamknij
        </Button>
      </div>
    </Modal>
  </div>
</template>
