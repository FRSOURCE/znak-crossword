import { createSharedComposable, useBreakpoints as useBreakpointsVueuse } from '@vueuse/core'

// https://tailwindcss.com/docs/responsive-design
export const useBreakpoints = createSharedComposable(() =>
  useBreakpointsVueuse({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }),
)
