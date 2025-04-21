<template>
  <header class="sticky z-100 top-0 w-full bg-white" id="frs-puzzle-header">
    <nav class="py-2.5 border-b">
      <div class="m-auto max-w-240 px-2 xs:px-4.5 flex justify-between">
        <a class="inline-block" href="https://www.miesiecznik.znak.com.pl/">
          <img
            src="@/assets/logo.webp"
            srcset="@/assets/logo.webp 180w, @/assets/logo-2x.webp 360w"
            sizes="(min-width: 30em) 180px,
                    136px"
            alt="Logotyp miesięcznika Znak - wielki napis ZNAK, a poniżej niego napis miesięcznik"
          />
        </a>
        <Button
          href="https://www.miesiecznik.znak.com.pl/"
          size="sm"
          class="inline-flex items-center md:my-1.5"
          >Strona Główna</Button
        >
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import Button from '@/components/Button.vue'
</script>
