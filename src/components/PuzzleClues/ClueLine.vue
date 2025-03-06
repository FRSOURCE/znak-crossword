<script setup lang="ts">
import type { ClueObject } from '@/types'
import { type PropType } from 'vue'

defineProps({
  clue: {
    type: Object as PropType<ClueObject>,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['click'])
</script>

<template>
  <p :class="{ '!block bg-active-600': isActive, 'hover:bg-blue-100': !isActive }">
    <button
      type="button"
      class="py-1 px-2 flex gap-x-2 cursor-pointer uppercase text-left"
      @click="emit('click')"
    >
      {{ clue.number }}&#41;
      <span v-html="clue.clue" />
    </button>
  </p>
</template>
