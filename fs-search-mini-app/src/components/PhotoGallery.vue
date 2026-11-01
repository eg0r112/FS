<template>
  <div :class="$style.gallery">
    <!-- Показываем текущее фото -->
    <div :class="$style.imageContainer">
      <div :class="$style.imageWrapper">
        <img
          :src="photos[currentIndex]"
          :alt="`Фото ${currentIndex + 1}`"
          :class="$style.photo"
        />
      </div>
      
      <!-- Стрелки навигации -->
      <button
        v-if="photos.length > 1"
        :class="[$style.arrow, $style.arrowLeft]"
        :disabled="currentIndex === 0"
        @click="prev"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <button
        v-if="photos.length > 1"
        :class="[$style.arrow, $style.arrowRight]"
        :disabled="currentIndex === photos.length - 1"
        @click="next"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <!-- Индикаторы (точки или счетчик) -->
      <div v-if="photos.length > 1" :class="$style.indicators">
        <!-- Всегда показываем счетчик "1 / 5" -->
        <div :class="$style.counter">
          {{ currentIndex + 1 }} / {{ photos.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTelegram } from '@/composables/useTelegram'

interface Props {
  photos: string[]
}

const props = defineProps<Props>()

const { hapticFeedback } = useTelegram()

const currentIndex = ref(0)

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    hapticFeedback('light')
  }
}

const next = () => {
  if (currentIndex.value < props.photos.length - 1) {
    currentIndex.value++
    hapticFeedback('light')
  }
}
</script>

<style lang="scss" module src="./PhotoGallery.module.scss"></style>

