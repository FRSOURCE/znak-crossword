<template>
  <p class="m-auto max-w-160 px-2 xs:px-4.5 text-xs uppercase text-primary-600">
    Najpiękniejszy polski magazyn intelektualny
  </p>
  <div
    class="mt-4 mx-auto max-w-160 px-2 xs:px-4.5 grid gap-x-3.5 [grid-template-areas:'title_title''img_desc'] md:[grid-template-areas:'img_title''img_desc'] md:grid-rows-[min-content_1fr]"
  >
    <img
      src="@/assets/newsletter.webp"
      srcset="@/assets/newsletter.webp 120w, @/assets/newsletter-2x.webp 240w"
      width="120"
      height="120"
      alt="Ręka trzymająca kolorowy egzemplarz miesięcznika ZNAK"
      class="[grid-area:img]"
    />
    <h2
      class="mb-3 md:mb-0 font-serif font-medium font-bold text-2xl text-center md:text-left [grid-area:title]"
    >
      Podaruj sobie inspirację
    </h2>
    <p class="font-medium [grid-area:desc] max-w-62 md:max-w-none">
      Dołącz do naszych newsletterowiczów, żeby zacząć rok z wyjątkowymi tekstami i poleceniami
      ZNAKu! <span class="md:inline-block">Co tydzień damy Ci znać o krzyżówce.</span>
    </p>
  </div>

  <Button
    href="https://www.miesiecznik.znak.com.pl/#:~:text=Najlepsze%20tre%C5%9Bci%20co%20tydzie%C5%84"
    size="sm"
    class="mt-6 md:mt-2 mx-auto px-16 block"
    target="_blank"
  >
    Zapisz mnie
  </Button>
</template>

<script setup lang="ts">
import Button from '@/components/Button.vue'
</script>
