<script setup lang="ts" generic="EmptyValue extends string = '0', BlockValue extends string = '#'">
import type { CrosswordValue, LabeledCell } from '@/types'
import { computed, inject, nextTick, ref, useTemplateRef, watch, type PropType } from 'vue'
import { puzzleBoardContextKey, type ActiveCell } from './PuzzleBoardContext'
import { set, useMediaQuery } from '@vueuse/core'

const props = defineProps({
  cell: {
    type: [Object, String, Number, null] as PropType<LabeledCell>,
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

const setModelValueFromEvent = (e: Event) => {
  const { target } = e
  if (!(target instanceof HTMLInputElement)) return
  setModelValue(target.value)
}
const setModelValue = (inputValue: string) => {
  const value = (inputValue[0] || '').toUpperCase()
  // target.value = ''
  console.log(value)
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

const value = computed(() =>
  props.cell && typeof props.cell === 'object' ? (props.cell.cell ?? ':') : props.cell,
)
const cellRef = useTemplateRef<HTMLDivElement>('cell')
const inputRef = useTemplateRef<HTMLInputElement>('input')

const { activeCell, setActiveCell } = inject(
  puzzleBoardContextKey,
  () => ({
    activeCell: ref({ direction: 'horizontal' } as ActiveCell),
    setActiveCell: (_) => {},
  }),
  true,
)
const isActiveLine = computed(
  () =>
    (activeCell.value?.direction === 'vertical' && activeCell.value?.x === props.column) ||
    (activeCell.value?.direction === 'horizontal' && activeCell.value?.y === props.row),
)

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
const { HTMLInputElement } = window
</script>

<template>
  <div v-if="value === blockValue" ref="cell" class="bg-gray-600" />
  <div v-else-if="value === null" ref="cell" />
  <div
    v-else
    ref="cell"
    class="bg-white relative before:content-[attr(data-clue)] before:absolute before:top-0.5 before:left-0.5 text-gray-500 before:text-sm focus-within:!bg-yellow-200"
    :class="{ '!bg-blue-200': isActiveLine }"
    :data-clue="typeof value === 'number' ? value : undefined"
  >
    <input
      class="w-full h-full -opacity-0 select-none opacity-0"
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
        })
      "
    />
    <div
      class="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none text-3xl text-center"
    >
      {{ modelValue }}
    </div>
  </div>
</template>
