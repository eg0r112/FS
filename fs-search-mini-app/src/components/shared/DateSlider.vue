<template>
  <div :class="$style.dateSlider">
    <label v-if="label" :class="$style.label">{{ label }}</label>
    
    <div :class="$style.sliderContainer">
      <!-- Стрелка влево -->
      <button 
        v-if="canScrollLeft"
        :class="[$style.arrow, $style.arrowLeft]"
        @click="scrollToPrev"
        aria-label="Предыдущие даты"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <!-- Слайдер дат -->
      <div 
        ref="sliderRef" 
        :class="$style.slider"
        @scroll="handleScroll"
      >
        <button 
          v-for="date in availableDates" 
          :key="date.date"
          :class="[$style.dateCard, { 
            [$style.active]: date.date === modelValue,
            [$style.hasPrice]: date.minPrice > 0
          }]"
          @click="selectDate(date)"
        >
          <span :class="$style.dateDay">{{ formatDateShort(date.date) }}</span>
          <span :class="$style.datePrice">
            <template v-if="date.minPrice > 0">
              от {{ formatPrice(date.minPrice) }} ₽
            </template>
            <template v-else-if="date.date === modelValue">
              загрузка...
            </template>
            <template v-else>
              выбрать
            </template>
          </span>
        </button>
      </div>
      
      <!-- Стрелка вправо -->
      <button 
        v-if="canScrollRight"
        :class="[$style.arrow, $style.arrowRight]"
        @click="scrollToNext"
        aria-label="Следующие даты"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useTelegram } from '@/composables/useTelegram'

export interface DateOption {
  date: string
  minPrice: number
  available: boolean
}

interface Props {
  dates: DateOption[]
  modelValue: string
  label?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'load-prices', dates: { minDate: string; maxDate: string }): void
}>()

const { hapticFeedback } = useTelegram()

// Фильтруем только доступные даты
const availableDates = computed(() => props.dates.filter(d => d.available))

const sliderRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

onMounted(async () => {
  await nextTick()
  updateScrollButtons()
  scrollToActive()
  // Загружаем цены для изначально видимых дат
  setTimeout(() => {
    checkAndLoadPrices()
  }, 100)
})

onUnmounted(() => {
  // Очищаем таймер debounce при размонтировании
  if (priceLoadDebounceTimer) {
    clearTimeout(priceLoadDebounceTimer)
  }
})

watch(() => props.modelValue, async () => {
  await nextTick()
  scrollToActive()
})

watch(() => availableDates.value.length, async () => {
  await nextTick()
  updateScrollButtons()
})

const updateScrollButtons = () => {
  if (!sliderRef.value) return
  
  const slider = sliderRef.value
  canScrollLeft.value = slider.scrollLeft > 10
  canScrollRight.value = slider.scrollLeft < slider.scrollWidth - slider.clientWidth - 10
}

// Отслеживаем какие конкретные даты уже были запрошены для загрузки цен
const requestedDates = ref<Set<string>>(new Set())

// Debounce таймер для загрузки цен
let priceLoadDebounceTimer: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_DELAY = 300 // ms

// Сбрасываем кеш запрошенных дат при изменении списка доступных дат
watch(() => props.dates, () => {
  requestedDates.value.clear()
}, { deep: true })

const handleScroll = () => {
  updateScrollButtons()
  debouncedCheckAndLoadPrices()
}

// Debounced версия checkAndLoadPrices
const debouncedCheckAndLoadPrices = () => {
  if (priceLoadDebounceTimer) {
    clearTimeout(priceLoadDebounceTimer)
  }
  
  priceLoadDebounceTimer = setTimeout(() => {
    checkAndLoadPrices()
  }, DEBOUNCE_DELAY)
}

// Проверяем видимые даты и загружаем цены если нужно
const checkAndLoadPrices = () => {
  if (!sliderRef.value) return
  
  const slider = sliderRef.value
  const cards = slider.querySelectorAll('button')
  if (cards.length === 0) return
  
  const sliderRect = slider.getBoundingClientRect()
  const visibleDates: string[] = []
  
  cards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect()
    // Проверяем, видна ли карточка (частично или полностью)
    if (cardRect.right > sliderRect.left && cardRect.left < sliderRect.right) {
      const date = availableDates.value[index]
      // Запрашиваем только даты без цены И которые еще не были запрошены
      if (date && date.minPrice === 0 && !requestedDates.value.has(date.date)) {
        visibleDates.push(date.date)
      }
    }
  })
  
  // Если есть видимые даты без цены - запрашиваем загрузку
  if (visibleDates.length > 0) {
    const minDate = visibleDates.reduce((a, b) => a < b ? a : b)
    const maxDate = visibleDates.reduce((a, b) => a > b ? a : b)
    
    // Отмечаем все запрошенные даты
    visibleDates.forEach(date => requestedDates.value.add(date))
    
    console.log('📅 Запрос загрузки цен для дат:', minDate, '-', maxDate)
    emit('load-prices', { minDate, maxDate })
  }
}

const scrollToPrev = () => {
  if (!sliderRef.value) return
  hapticFeedback('light')
  
  const slider = sliderRef.value
  const cards = slider.querySelectorAll('button')
  if (cards.length === 0) return
  
  // Получаем ширину одной карточки + gap
  const firstCard = cards[0] as HTMLElement
  const cardWidth = firstCard.offsetWidth
  const gap = 8 // $spacing-sm
  const twoCardsWidth = (cardWidth + gap) * 2 // Скроллим на 2 карточки
  
  slider.scrollTo({
    left: slider.scrollLeft - twoCardsWidth,
    behavior: 'smooth'
  })
}

const scrollToNext = () => {
  if (!sliderRef.value) return
  hapticFeedback('light')
  
  const slider = sliderRef.value
  const cards = slider.querySelectorAll('button')
  if (cards.length === 0) return
  
  // Получаем ширину одной карточки + gap
  const firstCard = cards[0] as HTMLElement
  const cardWidth = firstCard.offsetWidth
  const gap = 8 // $spacing-sm
  const twoCardsWidth = (cardWidth + gap) * 2 // Скроллим на 2 карточки
  
  slider.scrollTo({
    left: slider.scrollLeft + twoCardsWidth,
    behavior: 'smooth'
  })
}

const scrollToActive = () => {
  if (!sliderRef.value) return
  
  const activeCard = sliderRef.value.querySelector('.active') as HTMLElement
  if (!activeCard) return
  
  const slider = sliderRef.value
  const cardLeft = activeCard.offsetLeft
  const cardWidth = activeCard.offsetWidth
  const sliderWidth = slider.clientWidth
  
  const scrollPosition = cardLeft - (sliderWidth / 2) + (cardWidth / 2)
  
  slider.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  })
  
  setTimeout(updateScrollButtons, 300)
}

const formatDateShort = (date: string) => {
  try {
    const d = parseISO(date)
    const day = format(d, 'd MMM', { locale: ru })
    const weekday = format(d, 'EEE', { locale: ru })
    return `${day}, ${weekday}`
  } catch {
    return date
  }
}

const formatPrice = (price: number) => {
  return price.toLocaleString('ru-RU')
}

const selectDate = (date: DateOption) => {
  if (!date.available) return
  hapticFeedback('light')
  emit('update:modelValue', date.date)
}
</script>

<style lang="scss" module src="./DateSlider.module.scss"></style>

