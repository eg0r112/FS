<template>
  <div :class="$style.roomCard" @click="onSelect">
    <!-- Бейджи -->
    <div v-if="offer.index === 0" :class="$style.roomCard__badge">
      Лучшая цена
    </div>
    <div v-if="hasDiscount" :class="$style.roomCard__discount">
      -{{ discountPercent }}%
    </div>

    <div :class="$style.roomCard__content">
      <!-- Заголовок -->
      <div :class="$style.roomCard__header">
        <h3 :class="$style.roomCard__title">{{ roomName }}</h3>
        <div :class="$style.roomCard__dates">
          {{ formatDateShort(offer.checkinDate) }} - {{ formatDateShort(offer.checkoutDate) }} • {{ offer.nightsCount }} {{ pluralizeNights(offer.nightsCount) }}
        </div>
      </div>

      <!-- Питание -->
      <div :class="$style.roomCard__meal">
        🍽️ {{ mealName }}
      </div>

      <!-- Детали -->
      <div :class="$style.roomCard__details">
        <span :class="$style.roomCard__detail">
          {{ flightTypeName }}
        </span>
        <span v-if="offer.isInstantConfirmation" :class="$style.roomCard__detail">
          ⚡ Мгновенно
        </span>
      </div>

      <!-- Тариф -->
      <div 
        :class="$style.roomCard__tariff"
        @click.stop="openTariffModal"
      >
        {{ formatTariffName(offer.programType?.name) }}
        <span :class="$style.roomCard__tariffIcon">ℹ️</span>
      </div>

      <!-- Footer с ценой -->
      <div :class="$style.roomCard__footer">
        <div :class="$style.roomCard__priceBlock">
          <div v-if="offer.price.oldValue > 0" :class="$style.roomCard__oldPrice">
            {{ formatNumber(offer.price.oldValue) }} ₽
          </div>
          <div :class="$style.roomCard__price">
            {{ formatNumber(offer.price.value) }} ₽
          </div>
          <div :class="$style.roomCard__priceNote">
            за {{ offer.paxes.adultsCount }} {{ pluralizeAdults(offer.paxes.adultsCount) }}
            <template v-if="offer.paxes.childrenCount > 0">
              + {{ offer.paxes.childrenCount }} дет.
            </template>
          </div>
        </div>

        <button :class="$style.roomCard__button" @click.stop="onSelect">
          Выбрать
        </button>
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
import type { TourOffer, RoomOption, MealOption } from '@/types/tour-details'
import { formatNumber } from '@/utils/helpers'
import { useTelegram } from '@/composables/useTelegram'
import TariffInfoModal from '@/components/shared/TariffInfoModal.vue'

interface Props {
  offer: TourOffer
  rooms: RoomOption[]
  meals: MealOption[]
  allOffers?: TourOffer[] // Все офферы для определения доступных тарифов
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [offer: TourOffer]
}>()

const { hapticFeedback } = useTelegram()

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

// Модальное окно с информацией о тарифе
const showTariffModal = ref(false)

// Определяем, есть ли промо тариф среди всех офферов
const hasPromoTariff = computed(() => {
  const offersToCheck = props.allOffers || [props.offer]
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

const roomName = computed(() => {
  const room = props.rooms.find(r => r.id === props.offer.roomId)
  return room?.name || 'Номер'
})

const mealName = computed(() => {
  const meal = props.meals.find(m => m.mealTypeId === props.offer.mealId)
  return meal?.mealTypeName || meal?.mealTypeGroupName || 'Питание'
})

const flightTypeName = computed(() => {
  const tourType = props.offer.tourType?.name || ''
  if (tourType.toLowerCase().includes('наземное')) {
    return '🏨 Только отель'
  }
  if (props.offer.isRegularFlight) {
    return '✈️ Регулярный рейс'
  }
  return '✈️ Чартер + отель'
})

const hasDiscount = computed(() => {
  return props.offer.price.oldValue > 0
})

const discountPercent = computed(() => {
  if (!hasDiscount.value) return 0
  return Math.round(((props.offer.price.oldValue - props.offer.price.value) / props.offer.price.oldValue) * 100)
})

const formatDateShort = (dateString: string) => {
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

const pluralizeAdults = (count: number): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'взр.'
  return 'взр.'
}

const onSelect = () => {
  hapticFeedback('medium')
  emit('select', props.offer)
}
</script>

<style lang="scss" module src="./RoomCard.module.scss"></style>
