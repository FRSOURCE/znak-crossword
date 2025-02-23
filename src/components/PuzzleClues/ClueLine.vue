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
  <p
    class="hidden md:block"
    :class="{ '!block bg-blue-200': isActive, 'hover:bg-blue-100': !isActive }"
  >
    <button type="button" class="py-1 px-2 flex gap-x-2 cursor-pointer" @click="emit('click')">
      <span class="hidden md:block">{{ clue.number }}</span>
      <span v-html="clue.clue" />
    </button>
  </p>
</template>
