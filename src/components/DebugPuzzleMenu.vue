<template>
  <div
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
        @click="activePuzzleId = puzzleId as keyof Puzzle"
        class="px-4 py-2 border rounded hover:opacity-50 cursor-pointer"
        :class="{ 'bg-yellow-200': activePuzzleId === puzzleId }"
      >
        {{ puzzleId }}
      </button>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
  generic="
    Puzzle extends {
      [k in string]: () => Promise<typeof import('*.ipuz')> | typeof import('*.ipuz')
    }
  "
>
import { ref, type PropType } from 'vue'

defineProps({
  puzzles: {
    type: Object as PropType<Puzzle>,
    required: true,
  },
})

const activePuzzleId = defineModel('activePuzzleId', {
  type: String as unknown as PropType<keyof Puzzle>,
  required: true,
})

const openDevMenu = ref(false)
</script>
