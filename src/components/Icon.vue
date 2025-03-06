<script lang="ts">
const parser = new DOMParser()
</script>

<script lang="ts" setup>
import { computed, h } from 'vue'

const props = defineProps({
  data: {
    type: String,
    required: true,
  },
})

const svgElement = computed(() => {
  const doc = parser.parseFromString(props.data, 'image/svg+xml')
  return doc.documentElement
})

const render = () =>
  h(
    'svg',
    {
      ...svgElement.value.getAttributeNames().reduce(
        (acc, name) => {
          acc[name] = svgElement.value.getAttribute(name)
          return acc
        },
        {} as Record<string, string | null>,
      ),
      innerHTML: svgElement.value.innerHTML,
    },
    [],
  )
</script>

<template>
  <render class="stroke-current inline-block w-[1em] h-[1em] align-middle" />
</template>
