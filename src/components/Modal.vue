<template>
  <dialog
    ref="dialog"
    class="fixed inset-auto bottom-0 z-20 m-0 border-t max-w-none w-full translate-y-full bg-linear-to-b from-[#F4F3F4] to-white transition-all duration-800 outline-hidden backdrop:bg-neutral-900/0 backdrop:transition-colors backdrop:duration-600 backdrop:delay-200 md:bottom-auto md:top-full md:inset-x-8 md:border-0 md:m-auto md:w-auto md:max-w-120 md:rounded-md"
    :class="[
      { '!translate-y-0 backdrop:bg-neutral-900/30 backdrop:!delay-0 md:!top-8': model },
      ...(Array.isArray(dialogClass) ? dialogClass : [dialogClass]),
    ]"
    @click="closable && $event.target === dialog && close()"
  >
    <div v-bind="$attrs" class="pt-6 pb-8 px-4">
      <button
        class="absolute top-5 right-3 cursor-pointer flex flex-col gap-0.5 text-center text-xs focus-visible:outline-2 outline-offset-2 outline-primary-600 rounded-xs hover:opacity-60 transition-opacity"
        type="button"
        @click="close()"
        aria-label="Zamknij modal"
        autofocus
        v-if="closable"
      >
        <Icon :data="crossIconData" class="text-xl" />
      </button>
      <slot :close="close" />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { useTemplateRef, ref, onMounted, watch, type PropType, onUnmounted, nextTick } from 'vue'
import crossIconData from '@/assets/cross.svg?raw'
import Icon from '@/components/Icon.vue'
import { useEventListener } from '@vueuse/core'

const model = defineModel({ type: Boolean, required: true })
const dialog = useTemplateRef('dialog')
const props = defineProps({
  showAfterMount: {
    type: Boolean,
    default: false,
  },
  dialogClass: {
    type: [String, Array] as PropType<string | string[]>,
    default: '',
  },
  closable: {
    type: Boolean,
    default: true,
  },
})
defineOptions({
  inheritAttrs: false,
})

useEventListener('keydown', (event) => {
  if (dialog.value?.open && event.key === 'Escape' && props.closable) {
    event.preventDefault()
    model.value = false
  }
})

const open = ref<boolean>()

const close = () => {
  model.value = false
}

const syncModelOpen = () => {
  watch(
    model,
    () => {
      if (open.value === model.value) return
      if (model.value) {
        open.value = model.value
      } else {
        nextTick(() =>
          setTimeout(() => {
            if (model.value) return
            open.value = false
          }, 500),
        )
      }
    },
    { immediate: true },
  )
}

if (props.showAfterMount) {
  onMounted(() => {
    syncModelOpen()
  })
} else {
  syncModelOpen()
}

watch(
  open,
  (open) => {
    if (open) {
      dialog.value?.showModal()
    } else {
      dialog.value?.close()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (dialog.value?.open) {
    dialog.value.close()
  }
})
</script>
