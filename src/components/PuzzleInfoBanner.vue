<template>
  <div class="mx-auto max-w-160 px-2 xs:px-4.5 pb-8 text-center text-xl leading-9 font-medium">
    <p>Co tydzień przygotowujemy dla Ciebie nową krzyżówkę.</p>
    <p>
      Rozwiąż ją i otrzymaj kod na zakup subskrypcji miesięcznika
      o&nbsp;<strong>50%&nbsp;taniej</strong>!
      <span class="block md:inline">Dołącz do zabawy!</span>
    </p>
    <Button @click="$emit('start-game-click')" size="lg" class="mt-6 mx-auto block">Zagraj</Button>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/Button.vue'

defineEmits<{
  (e: 'start-game-click'): void
}>()
</script>
