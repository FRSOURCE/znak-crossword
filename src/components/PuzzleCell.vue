<script setup lang="ts" generic="EmptyValue extends string = '0', BlockValue extends string = '#'">
import type { CrosswordValue, LabeledCellObject } from '@/types'
import { computed, nextTick, useTemplateRef, watch, type PropType } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { usePuzzleContext } from '@/composables/usePuzzleContext'

const props = defineProps({
  cell: {
    type: [Object, String, Number, null] as PropType<LabeledCellObject<EmptyValue, BlockValue>>,
    required: true,
  },
  row: {
    type: Number,
    required: true,
  },
  column: {
    type: Number,
    required: true,
  },
  emptyValue: {
    type: String,
    required: true,
  },
  blockValue: {
    type: String,
    required: true,
  },
})

const modelValue = defineModel({
  type: String as PropType<CrosswordValue<EmptyValue, BlockValue>>,
  required: true,
})
const hasNonTouchPointer = useMediaQuery('(pointer: fine)')
const inputRef = useTemplateRef<HTMLInputElement>('input')
const { activeCell, setActiveCell } = usePuzzleContext<EmptyValue, BlockValue>()
const isActiveLine = computed(
  () =>
    (activeCell.value?.direction === 'vertical' && activeCell.value?.x === props.column) ||
    (activeCell.value?.direction === 'horizontal' && activeCell.value?.y === props.row),
)

const setModelValueFromEvent = (e: Event) => {
  const { target } = e
  if (!(target instanceof HTMLInputElement)) return
  setModelValue(target.value)
}
const setModelValue = (inputValue: string) => {
  const value = (inputValue[0] || '').toUpperCase()
  modelValue.value = value

  if (activeCell.value.direction === 'horizontal') {
    setActiveCell({
      y: props.row,
      x: props.column + (value === '' ? -1 : 1),
      direction: 'horizontal',
    })
  } else {
    setActiveCell({
      y: props.row + (value === '' ? -1 : 1),
      x: props.column,
      direction: 'vertical',
    })
  }

  nextTick(() => {
    // only on touchscreen-only devices
    // deselect input field when we got to the end of the word
    if (activeCell.value.x !== props.column || activeCell.value.y !== props.row) return
    if (hasNonTouchPointer.value) {
      inputRef.value?.select()
      return
    }
    inputRef.value?.blur()
    setActiveCell({ direction: activeCell.value.direction })
  })
}
const onDelete = (e: Event) => {
  const { target } = e
  if (!(target instanceof HTMLInputElement)) return
  if (target.value !== '') return
  setModelValue('')
}

watch(activeCell, (activeCell) => {
  if (!activeCell || activeCell.x !== props.column || activeCell.y !== props.row) return

  setTimeout(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  }, 0)
})

async function sha256(source: string) {
  const sourceBytes = new TextEncoder().encode(source)
  const digest = await crypto.subtle.digest('SHA-256', sourceBytes)
  const resultBytes = [...new Uint8Array(digest)]
  return resultBytes.map((x) => x.toString(16).padStart(2, '0')).join('')
}
</script>

<template>
  <div v-if="cell.cell === blockValue" class="bg-gray-600" />
  <div v-else-if="cell.cell === null" />
  <div
    v-else
    class="bg-white relative before:content-[attr(data-clue)] before:absolute before:top-0.5 before:left-0.5 text-gray-800 before:text-sm focus-within:!bg-yellow-200 hover:!bg-yellow-100"
    :class="{ '!bg-blue-200': isActiveLine }"
    :data-clue="typeof cell.cell === 'number' ? cell.cell : undefined"
  >
    <input
      class="w-full h-full opacity-0"
      ref="input"
      autocorrect="off"
      autocomplete="off"
      maxlength="1"
      :value="modelValue"
      @focus="setActiveCell({ y: row, x: column, direction: activeCell?.direction })"
      @input="setModelValueFromEvent"
      @keyup.delete="onDelete"
      @pointerdown="
        setActiveCell({
          y: row,
          x: column,
          direction:
            activeCell.x === column && activeCell.y === row
              ? activeCell.direction === 'horizontal'
                ? 'vertical'
                : 'horizontal'
              : activeCell?.direction,
        }) === undefined && inputRef?.select()
      "
      @pointerup.prevent
    />
    <div
      class="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none text-3xl text-center"
    >
      {{ modelValue }}
    </div>
  </div>
</template>
