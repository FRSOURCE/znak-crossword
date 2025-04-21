<template>
  <Modal
    v-if="isGameStarted && showNewsletterBannerStorage"
    :model-value="!md && isGameStarted && showNewsletterBanner"
    @update:model-value="showNewsletterBanner = showNewsletterBannerStorage = $event"
    class="flex flex-col items-center"
    dialog-class="md:hidden"
    show-after-mount
  >
    <NewsletterBannerContent />
  </Modal>
  <section
    class="hidden md:flex flex flex-col mt-2 pt-6 pb-8 items-center bg-linear-to-b from-[#F4F3F4] to-white"
  >
    <NewsletterBannerContent />
  </section>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal.vue'
import { useLocalStorage, whenever } from '@vueuse/core'
import { ref, toRefs } from 'vue'
import NewsletterBannerContent from './NewsletterBannerContent.vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

const { md } = useBreakpoints()

const props = defineProps({
  isGameStarted: {
    type: Boolean,
    required: true,
  },
})
const { isGameStarted } = toRefs(props)

const showNewsletterBannerStorage = useLocalStorage('znak::showNewsletterBanner', true)
const showNewsletterBanner = ref(false)

whenever(isGameStarted, () => {
  if (showNewsletterBannerStorage.value) {
    setTimeout(() => (showNewsletterBanner.value = true), 10000)
  }
})
</script>
