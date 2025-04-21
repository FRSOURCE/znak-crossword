import { useBreakpoints } from '@/composables/useBreakpoints'
import originalConfetti from 'canvas-confetti'
import { type Ref } from 'vue'

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const commonConfig = {
  disableForReducedMotion: true,
}

const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']

export const useConfetti = ({
  duration = 10,
  canvas,
  mode = ['sides', 'top'],
  topDelay = 0,
}: {
  /* in s */
  duration?: number
  canvas?: Ref<HTMLCanvasElement | null>
  mode?: ('sides' | 'top')[]
  /* in ms */
  topDelay?: number
} = {}) => {
  const { md } = useBreakpoints()
  const getConfettiInstance = () => {
    if (canvas?.value) {
      return originalConfetti.create(canvas.value, {
        resize: true,
        disableForReducedMotion: true,
      })
    }
    return originalConfetti
  }

  const shoot = () => {
    const confetti = getConfettiInstance()

    let skew = 1
    let counter = 0
    const end = Date.now() + duration * 1000
    const step = async () => {
      ++counter
      const deviceScale = md.value ? 3 : 1
      const avgSize = deviceScale / 2 + 1
      const now = Date.now()
      const timeLeft = Math.max(0, end - now) / 1000
      skew = Math.max(0.8, skew - 0.01)

      if (mode.includes('sides') && [0, 5].includes(counter % 10) && timeLeft > 4) {
        const sideConfig = {
          ...commonConfig,
          particleCount: 4 * deviceScale,
          angle: 84 - deviceScale * 8,
          spread: 55,
          scalar: avgSize,
          startVelocity: 25 + 20 * deviceScale,
          ticks: 200 + 100 * deviceScale,
          colors,
        }
        confetti({
          ...sideConfig,
          origin: { x: 0, y: md.value ? 0.55 : 0.6 },
        })
        confetti({
          ...sideConfig,
          angle: 180 - sideConfig.angle,
          origin: { x: 1, y: md.value ? 0.55 : 0.6 },
        })
      }
      if (mode.includes('top') && counter > topDelay / 50) {
        confetti({
          ...commonConfig,
          particleCount: 1,
          startVelocity: 0,
          ticks: 300 + deviceScale * 30,
          colors: [colors[Math.floor(Math.random() * colors.length)]],
          origin: {
            x: Math.random(),
            // since particles fall down, skew start toward the top
            y: Math.random() * skew - 0.7,
          },
          gravity: randomInRange(0.7, 1),
          scalar: randomInRange(0.8, avgSize * 1.2),
          drift: randomInRange(-0.2 * deviceScale, 0.2 * deviceScale),
        })
        if (counter === 40) counter = 30
      }

      if (now < end) {
        requestAnimationFrame(() => setTimeout(step, 50))
      }
    }
    step()
  }

  return { shoot }
}
