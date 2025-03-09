<script lang="ts">
const parser = import.meta.env.SSR
  ? {
      parseFromString: (data: string) => {
        const [svgElement, ...rest] = data.trim().split('>')
        rest.splice(rest.length - 2, 1)

        const attrs = svgElement
          .slice(5)
          .split(/"(?: |$)/)
          .reduce(
            (p, attr) => {
              if (!attr) return p
              const [name, value] = attr.split('=')
              p[name] = value.slice(1)
              return p
            },
            {} as Record<string, string>,
          )
        const documentElement = {
          getAttributeNames: () => Object.keys(attrs),
          getAttribute: (name: string) => attrs[name] ?? null,
          innerHTML: rest.join('>').trim(),
        }
        return { documentElement }
      },
    }
  : new DOMParser()
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
