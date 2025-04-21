<template>
  <component
    :is="innerTag"
    v-bind="innerAttrs"
    class="inline-block font-bold bg-primary-600 uppercase text-white rounded-full cursor-pointer hover:bg-primary-300 focus:bg-primary-300 active:bg-primary-300 transition-colors duration-50"
    :class="sizeClasses"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs, type PropType } from 'vue'

const props = defineProps({
  tag: {
    type: String,
    default: '',
  },
  size: {
    type: String as PropType<'sm' | 'md' | 'lg'>,
    default: 'md',
  },
})

const attrs = useAttrs()

const innerTag = computed(() => {
  if (props.tag) return props.tag
  if (attrs.href) return 'a'
  return 'button'
})

const innerAttrs = computed(() => {
  if (innerTag.value === 'button') {
    return {
      type: 'button',
    }
  }
  return {}
})

const sizeClasses = computed(() => {
  if (props.size === 'sm') return 'px-4.5 py-2 text-xs'
  if (props.size === 'md') return ''
  if (props.size === 'lg') return 'px-10 py-4 text-xl'
})
</script>
