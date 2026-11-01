<template>
  <div :class="$style.roomGroup">
    <!-- Заголовок группы с названием номера -->
    <div :class="$style.roomGroup__header">
      <h3 :class="$style.roomGroup__title">{{ roomName }}</h3>
      <div :class="$style.roomGroup__dates">
        {{ formatDateShort(firstOffer.checkinDate) }} - {{ formatDateShort(firstOffer.checkoutDate) }} • {{ firstOffer.nightsCount }} {{ pluralizeNights(firstOffer.nightsCount) }}
      </div>
      
      <!-- Информация о номере из roomTypes -->
      <div v-if="roomTypeInfo" :class="$style.roomGroup__info">
        <!-- Галерея фото номера -->
        <div v-if="roomImages.length > 0" :class="$style.roomGroup__gallery">
          <PhotoGallery :photos="roomImages" />
        </div>

        <div :class="$style.roomGroup__meta">
          <span v-if="roomTypeInfo.square" :class="$style.roomGroup__metaItem">
            📐 {{ roomTypeInfo.square }} м²
          </span>
          <span v-if="roomTypeInfo.numberOfBeds" :class="$style.roomGroup__metaItem">
            🛏️ {{ roomTypeInfo.numberOfBeds }} {{ pluralizeBeds(roomTypeInfo.numberOfBeds) }}
          </span>
          <span v-if="roomTypeInfo.view?.name" :class="$style.roomGroup__metaItem">
            👁️ Вид {{ roomTypeInfo.view.name }}
          </span>
        </div>
        
        <p v-if="roomTypeInfo.description" :class="$style.roomGroup__description">
          {{ roomTypeInfo.description }}
        </p>
        
        <!-- Удобства номера -->
        <div v-if="roomTypeInfo.amenities?.length" :class="$style.roomGroup__amenities">
          <div 
            v-for="amenity in visibleAmenities" 
            :key="amenity.id"
            :class="[$style.amenity, { [$style['amenity--paid']]: amenity.payType === 'Paid' }]"
            :title="amenity.name"
          >
            <img 
              v-if="amenity.iconUrl" 
              :src="amenity.iconUrl" 
              :alt="amenity.name"
              :class="$style.amenity__icon"
            />
            <span :class="$style.amenity__name">{{ amenity.name }}</span>
          </div>
          <button 
            v-if="roomTypeInfo.amenities.length > 8 && !showAllAmenities"
            :class="$style.amenitiesMore"
            @click="showAllAmenities = true"
          >
            +{{ roomTypeInfo.amenities.length - 8 }}
          </button>
        </div>
      </div>
    </div>

    <!-- Группы по типу питания -->
    <div :class="$style.roomGroup__meals">
      <div 
        v-for="(mealGroup, mealId) in groupedByMeal" 
        :key="mealId"
        :class="$style.mealGroup"
      >
        <div :class="$style.mealGroup__header">
          <span :class="$style.mealGroup__name">🍽️ {{ getMealName(Number(mealId)) }}</span>
          <span :class="$style.mealGroup__count">{{ mealGroup.length }} {{ pluralizeOffers(mealGroup.length) }}</span>
        </div>

        <!-- Офферы внутри типа питания, сгруппированные по тарифу -->
        <div :class="$style.mealGroup__offers">
          <div 
            v-for="(tariffOffers, tariffKey) in groupByTariff(mealGroup)" 
            :key="tariffKey"
            :class="$style.tariffGroup"
          >
            <div :class="$style.tariffGroup__header">
              <span 
                :class="$style.tariffGroup__name"
                @click.stop="openTariffModal"
              >
                {{ formatTariffName(tariffOffers[0].programType?.name) }}
                <span :class="$style.tariffGroup__infoIcon">ℹ️</span>
              </span>
            </div>

            <div :class="$style.tariffGroup__offers">
              <div 
                v-for="(offer, index) in tariffOffers" 
                :key="offer.tourKey"
                :class="[$style.offerCard, { [$style['offerCard--best']]: index === 0 && isBestPrice(offer) }]"
                @click="() => selectOffer(offer)"
              >
                <!-- Бейджи -->
                <div v-if="index === 0 && isBestPrice(offer)" :class="$style.offerCard__badge">
                  Лучшая цена
                </div>
                <div v-if="hasDiscount(offer)" :class="$style.offerCard__discount">
                  -{{ discountPercent(offer) }}%
                </div>

                <div :class="$style.offerCard__content">
                  <div :class="$style.offerCard__info">
                    <span :class="$style.offerCard__flight">{{ flightTypeName(offer) }}</span>
                    <span v-if="offer.isInstantConfirmation" :class="$style.offerCard__instant">⚡ Мгновенно</span>
                  </div>

                  <div :class="$style.offerCard__priceBlock">
                    <div v-if="offer.price.oldValue > 0" :class="$style.offerCard__oldPrice">
                      {{ formatNumber(offer.price.oldValue) }} ₽
                    </div>
                    <div :class="$style.offerCard__price">
                      {{ formatNumber(offer.price.value) }} ₽
                    </div>
                  </div>

                  <button :class="$style.offerCard__button" @click.stop="() => selectOffer(offer)">
                    Выбрать
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с информацией о тарифе -->
    <TariffInfoModal
      :show="showTariffModal"
      :has-promo="hasPromoTariff"
      :show-promo-info="showPromoInfo"
      @close="showTariffModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { TourOffer, RoomOption, MealOption, RoomType, HotelImage } from '@/types/tour-details'
import { formatNumber } from '@/utils/helpers'
import { useTelegram } from '@/composables/useTelegram'
import PhotoGallery from '@/components/PhotoGallery.vue'
import TariffInfoModal from '@/components/shared/TariffInfoModal.vue'

interface Props {
  roomId: number
  offers: TourOffer[]
  rooms: RoomOption[]
  meals: MealOption[]
  minPriceOverall: number
  roomTypes?: RoomType[]
  allOffers?: TourOffer[] // Все офферы для определения доступных тарифов
  hotelImages?: HotelImage[] // Все изображения отеля из fullHotel.images
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [offer: TourOffer]
}>()

const { hapticFeedback } = useTelegram()

// Показывать все удобства или только первые 8
const showAllAmenities = ref(false)

// Модальное окно с информацией о тарифе
const showTariffModal = ref(false)

// Функция для форматирования названия тарифа
const formatTariffName = (tariffName?: string): string => {
  if (!tariffName) return 'Тариф Стандарт'
  
  const nameLower = tariffName.toLowerCase()
  
  // Если содержит "промо" - возвращаем "Тариф Промо"
  if (nameLower.includes('промо')) {
    return 'Тариф Промо'
  }
  
  // Если "GR" или другие стандартные варианты - возвращаем "Тариф Стандарт"
  if (nameLower.includes('gr') || nameLower.includes('стандарт')) {
    return 'Тариф Стандарт'
  }
  
  // По умолчанию - "Тариф Стандарт"
  return 'Тариф Стандарт'
}

// Определяем, есть ли промо тариф среди всех офферов
const hasPromoTariff = computed(() => {
  const offersToCheck = props.allOffers || props.offers
  return offersToCheck.some(offer => {
    const tariffName = offer.programType?.name || ''
    const nameLower = tariffName.toLowerCase()
    return nameLower.includes('промо')
  })
})

// Показывать информацию об акции (когда доступны оба тарифа)
const showPromoInfo = computed(() => {
  return hasPromoTariff.value
})

const openTariffModal = () => {
  hapticFeedback('light')
  showTariffModal.value = true
}

// Название номера
const roomName = computed(() => {
  // Сначала ищем в roomTypes
  if (roomTypeInfo.value?.name) {
    return roomTypeInfo.value.name
  }
  const room = props.rooms.find(r => r.id === props.roomId)
  return room?.name || 'Номер'
})

// Информация о типе номера из fullHotel.roomTypes
const roomTypeInfo = computed(() => {
  if (!props.roomTypes?.length) return null
  
  // Ищем по samoId === roomId
  let roomType = props.roomTypes.find(rt => rt.samoId === props.roomId)
  
  // Если не нашли, пробуем найти по имени
  if (!roomType) {
    const room = props.rooms.find(r => r.id === props.roomId)
    if (room?.name) {
      roomType = props.roomTypes.find(rt => 
        rt.name.toLowerCase() === room.name.toLowerCase() ||
        rt.alternativeName?.toLowerCase() === room.name.toLowerCase()
      )
    }
  }
  
  return roomType || null
})

// Видимые удобства (первые 8 или все)
const visibleAmenities = computed(() => {
  if (!roomTypeInfo.value?.amenities) return []
  
  const sorted = [...roomTypeInfo.value.amenities].sort((a, b) => a.sortOrder - b.sortOrder)
  
  if (showAllAmenities.value) {
    return sorted
  }
  return sorted.slice(0, 8)
})

// Фотографии номера
const roomImages = computed(() => {
  if (!roomTypeInfo.value?.images?.length || !props.hotelImages?.length) return []
  
  // Берем id из roomType.images, ищем в hotelImages и берем src оттуда
  return roomTypeInfo.value.images
    .map(roomImg => {
      // Ищем изображение в общем массиве по id
      const hotelImg = props.hotelImages?.find(img => img.id === roomImg.id)
      return hotelImg ? hotelImg.src : null
    })
    .filter((src): src is string => src !== null) // Убираем null значения
})

// Склонение для кроватей
const pluralizeBeds = (count: number): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'место'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'места'
  return 'мест'
}

// Первый оффер для отображения общей информации
const firstOffer = computed(() => props.offers[0])

// Группировка по типу питания (mealId)
const groupedByMeal = computed(() => {
  const groups: Record<number, TourOffer[]> = {}
  
  for (const offer of props.offers) {
    if (!groups[offer.mealId]) {
      groups[offer.mealId] = []
    }
    groups[offer.mealId].push(offer)
  }
  
  // Сортируем внутри каждой группы по цене
  for (const mealId in groups) {
    groups[mealId].sort((a, b) => a.price.value - b.price.value)
  }
  
  return groups
})

// Группировка по тарифу
const groupByTariff = (offers: TourOffer[]): Record<string, TourOffer[]> => {
  const groups: Record<string, TourOffer[]> = {}
  
  for (const offer of offers) {
    const key = offer.programType?.key?.toString() || 'default'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(offer)
  }
  
  return groups
}

// Получить название типа питания
const getMealName = (mealId: number): string => {
  // mealId в офферах соответствует mealTypeId в meals
  const meal = props.meals.find(m => m.mealTypeId === mealId || m.mealTypeGroupId === mealId)
  return meal?.mealTypeName || meal?.mealTypeGroupName || 'Питание'
}

// Проверка на лучшую цену среди всех офферов
const isBestPrice = (offer: TourOffer): boolean => {
  return offer.price.value === props.minPriceOverall
}

const hasDiscount = (offer: TourOffer): boolean => {
  return offer.price.oldValue > 0
}

const discountPercent = (offer: TourOffer): number => {
  if (!hasDiscount(offer)) return 0
  return Math.round(((offer.price.oldValue - offer.price.value) / offer.price.oldValue) * 100)
}

const flightTypeName = (offer: TourOffer): string => {
  const tourType = offer.tourType?.name || ''
  if (tourType.toLowerCase().includes('наземное')) {
    return '🏨 Только отель'
  }
  if (offer.isRegularFlight) {
    return '✈️ Регулярный'
  }
  return '✈️ Чартер'
}

const formatDateShort = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, 'd MMM', { locale: ru })
  } catch {
    return dateString
  }
}

const pluralizeNights = (count: number): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'ночь'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'ночи'
  return 'ночей'
}

const pluralizeOffers = (count: number): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'вариант'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'варианта'
  return 'вариантов'
}

const selectOffer = (offer: TourOffer) => {
  hapticFeedback('medium')
  emit('select', offer)
}
</script>

<style lang="scss" module src="./RoomGroup.module.scss"></style>
