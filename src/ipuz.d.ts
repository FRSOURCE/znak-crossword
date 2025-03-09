declare module '*.ipuz' {
  import type { CrosswordPuzzle } from '@/types'
  const content: CrosswordPuzzle<{ width: number; height: number }>
  export default content
}
