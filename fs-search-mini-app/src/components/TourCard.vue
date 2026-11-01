<template>
  <div :class="$style['tour-card']" @click.stop="handleClick">
    <div :class="$style['tour-card__image-container']">
      <img
        :src="tour.hotel.photoUrl"
        :alt="tour.hotel.name"
        :class="$style['tour-card__image']"
        loading="lazy"
      />
      <div v-if="discount > 0" :class="$style['tour-card__badge']">
        -{{ discount }}%
      </div>
      <div :class="$style['tour-card__instant']" v-if="tour.isInstantConfirmation">
        ⚡ Мгновенное подтверждение
      </div>
    </div>

    <div :class="$style['tour-card__content']">
      <div :class="$style['tour-card__header']">
        <div :class="$style['tour-card__stars']">
          <span v-for="n in tour.hotel.stars" :key="n" :class="$style['tour-card__star']">★</span>
        </div>
        <div v-if="tour.hotel.topHotels" :class="$style['tour-card__rating']">
          {{ parseFloat(tour.hotel.topHotels.rating).toFixed(1) }}
          <span :class="$style['tour-card__rating-icon']">⭐</span>
        </div>
      </div>

      <h3 :class="$style['tour-card__title']">{{ tour.hotel.name }}</h3>
      
      <p :class="$style['tour-card__location']">
        📍 {{ tour.hotel.cityName }}, {{ tour.hotel.countryName }}
      </p>

      <div :class="$style['tour-card__features']">
        <span
          v-for="filter in topFilters"
          :key="filter.id"
          :class="$style['tour-card__feature']"
        >
          {{ filter.name }}
        </span>
      </div>

      <div v-if="mealName" :class="$style['tour-card__meal']">
        🍽️ {{ mealName }}
      </div>

      <div :class="$style['tour-card__footer']">
        <div :class="$style['tour-card__price-block']">
          <div v-if="oldPrice" :class="$style['tour-card__old-price']">
            {{ formatPrice(oldPrice) }} {{ currency }}
          </div>
          <div :class="$style['tour-card__price']">
            {{ formatPrice(price) }} {{ currency }}
          </div>
          <div :class="$style['tour-card__price-note']">
            за {{ tour.priceOffer.people.adults }} {{ pluralizeAdults(tour.priceOffer.people.adults) }}, {{ nights }} {{ pluralizeNights(nights) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import type { Tour } from '@/types'
import { formatNumber, calculateDiscount } from '@/utils/helpers'
import { useTelegram } from '@/composables/useTelegram'
import { useSearchStore } from '@/stores/search'

interface Props {
  tour: Tour
}

const props = defineProps<Props>()
const router = useRouter()
const { hapticFeedback } = useTelegram()
const searchStore = useSearchStore()

// Находим минимальную цену из всех доступных цен
const price = computed(() => {
  if (!props.tour.priceOffer.price || props.tour.priceOffer.price.length === 0) return 0
  return Math.min(...props.tour.priceOffer.price.map(p => p.value))
})

// Находим старую цену для минимальной цены
const oldPrice = computed(() => {
  if (!props.tour.priceOffer.price || props.tour.priceOffer.price.length === 0) return undefined
  const minPrice = props.tour.priceOffer.price.reduce((min, p) => p.value < min.value ? p : min)
  return minPrice.oldValue
})

const discount = computed(() => {
  if (!oldPrice.value) return 0
  return calculateDiscount(oldPrice.value, price.value)
})

// Берем количество ночей из первой цены или из startDate
const nights = computed(() => {
  if (props.tour.priceOffer.price && props.tour.priceOffer.price.length > 0) {
    return props.tour.priceOffer.price[0]?.nightsCount || '7'
  }
  return '7'
})

// Берем название питания из первой цены
const mealName = computed(() => {
  if (props.tour.priceOffer.price && props.tour.priceOffer.price.length > 0) {
    return props.tour.priceOffer.price[0]?.mealName || props.tour.priceOffer.meal[0]?.name_ru
  }
  return props.tour.priceOffer.meal[0]?.name_ru
})

// Валюта из первой цены
const currency = computed(() => {
  if (props.tour.priceOffer.price && props.tour.priceOffer.price.length > 0) {
    return props.tour.priceOffer.price[0]?.currencyAlias || '₽'
  }
  return '₽'
})

// Функции для склонения
const pluralizeAdults = (count: string | number): string => {
  const num = typeof count === 'string' ? parseInt(count) : count
  const mod10 = num % 10
  const mod100 = num % 100
  
  if (mod10 === 1 && mod100 !== 11) return 'взр.'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'взр.'
  return 'взр.'
}

const pluralizeNights = (count: string | number): string => {
  const num = typeof count === 'string' ? parseInt(count) : count
  const mod10 = num % 10
  const mod100 = num % 100
  
  if (mod10 === 1 && mod100 !== 11) return 'ночь'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'ночи'
  return 'ночей'
}

const topFilters = computed(() => {
  return props.tour.hotel.priorityFilters.slice(0, 3)
})

const formatPrice = (value: number) => {
  return formatNumber(value)
}

const handleClick = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  hapticFeedback('medium')
  
  // Получаем параметры поиска из searchStore
  const searchParams = searchStore.searchParams
  
  router.push({
    name: 'TourDetails',
    params: { hotelId: props.tour.hotel.id },
    query: {
      departureCityId: searchParams.fromId?.toString() || '274286',
      arrivalCountryId: searchParams.toId?.toString() || '18803',
      nights: searchParams.nights?.toString() || '7',
      adults: searchParams.adults?.toString() || '2',
      childrenAges: searchParams.childrenAges.length > 0 ? searchParams.childrenAges.join(',') : undefined,
      date: searchParams.date || format(new Date(), 'yyyy-MM-dd')
    }
  })
}
</script>

<style lang="scss" module src="./TourCard.module.scss"></style>

