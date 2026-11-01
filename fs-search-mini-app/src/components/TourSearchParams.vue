<template>
  <div :class="$style.searchParams">
    <h3 :class="$style.title">Параметры поиска</h3>
    
    <div :class="$style.summary">
      <p :class="$style.summaryText">
        Цена за {{ tourSearchStore.searchParams.adults }} взрослых, вылет на {{ formatDate(tourSearchStore.searchParams.departureDate) }}, на {{ tourSearchStore.searchParams.nights }} ночей
      </p>
    </div>

    <div :class="$style.filters">
      <!-- Дата вылета -->
      <div :class="$style.dateInputWrapper">
        <label :class="$style.label">Дата вылета</label>
        <button
          :class="$style.dateButton"
          @click="showCalendar = true"
          type="button"
        >
          {{ formatDisplayDate(tourSearchStore.searchParams.departureDate) }}
        </button>
      </div>

      <!-- Date Picker Popup -->
      <SingleDatePicker
        v-model:show="showCalendar"
        v-model="tourSearchStore.searchParams.departureDate"
        :hotel-id="route.params.hotelId as string"
        :departure-city-id="parseInt(tourSearchStore.searchParams.departureCityId)"
        :arrival-country-id="searchStore.searchParams.toId || 0"
        :adults="tourSearchStore.searchParams.adults"
        @change="handleCalendarChange"
      />

      <!-- Количество ночей -->
      <div :class="$style.filterGroup">
        <label :class="$style.label">Длительность</label>
        <div :class="$style.nightsSelector">
          <button 
            v-for="night in nightOptions" 
            :key="night"
            :class="[$style.nightBtn, { [$style.active]: tourSearchStore.searchParams.nights === night }]"
            @click="selectNights(night)"
          >
            {{ night }}
          </button>
        </div>
      </div>

      <!-- Туристы -->
      <TouristsCounter
        :adults="tourSearchStore.searchParams.adults"
        :children-ages="tourSearchStore.searchParams.childrenAges"
        label="Туристы"
        @update:adults="updateAdults"
        @update:children-ages="updateChildrenAges"
      />

      <!-- Кнопка поиска -->
      <Button 
        variant="primary" 
        size="large" 
        full-width
        :loading="loading"
        @click="handleSearch"
      >
        <template v-if="loading">Поиск...</template>
        <template v-else-if="totalOffers > 0">
          Найдено {{ totalOffers }} {{ pluralize(totalOffers, 'предложение', 'предложения', 'предложений') }}
        </template>
        <template v-else>Найти предложения</template>
      </Button>
    </div>

    <!-- Доступные даты - вынесены отдельно -->
    <DateSlider
      v-if="tourSearchStore.availableDates.length > 0"
      v-model="tourSearchStore.searchParams.departureDate"
      :dates="tourSearchStore.availableDates"
      label="Доступные даты вылета"
      @update:model-value="handleDateChange"
      @load-prices="handleLoadPrices"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRoute } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'
import { useTourSearchStore } from '@/stores/tourSearch'
import { useSearchStore } from '@/stores/search'
import Button from '@/components/shared/Button.vue'
import SingleDatePicker from '@/components/shared/SingleDatePicker.vue'
import TouristsCounter from '@/components/shared/TouristsCounter.vue'
import DateSlider from '@/components/shared/DateSlider.vue'
import { getNightsByFreightType, type NightOption } from '@/api/fields'

interface Props {
  totalOffers?: number
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  totalOffers: 0,
  loading: false
})

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'load-prices', dates: { minDate: string; maxDate: string }): void
}>()

const route = useRoute()
const { hapticFeedback } = useTelegram()
const tourSearchStore = useTourSearchStore()
const searchStore = useSearchStore()

// Состояние календаря
const showCalendar = ref(false)

// Состояние загрузки ночей
const availableNights = ref<NightOption[]>([])
const loadingNights = ref(false)

// Вычисляемое свойство для опций ночей (только доступные)
const nightOptions = computed(() => {
  if (availableNights.value.length > 0) {
    return availableNights.value
      .filter(night => !night.disabled)
      .map(night => night.night)
  }
  // Fallback - если API не вернул данные
  return [3, 5, 7, 10, 14]
})

// Проверка, заблокирована ли ночь
const isNightDisabled = (night: number): boolean => {
  if (availableNights.value.length === 0) return false
  const nightOption = availableNights.value.find(n => n.night === night)
  return nightOption?.disabled ?? false
}

// Форматирование даты для кнопки
const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return 'Выберите дату'
  try {
    const date = parseISO(dateStr)
    return format(date, 'd MMMM yyyy', { locale: ru })
  } catch {
    return dateStr
  }
}

const formatDate = (date: string) => {
  try {
    const d = parseISO(date)
    return format(d, 'd MMMM', { locale: ru })
  } catch {
    return date
  }
}

const pluralize = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10
  const mod100 = count % 100
  
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

const selectNights = (nights: number) => {
  // Не даём выбрать заблокированные ночи
  if (isNightDisabled(nights)) return
  
  hapticFeedback('light')
  tourSearchStore.updateSearchParams({ nights })
}

const updateAdults = (value: number) => {
  tourSearchStore.updateSearchParams({ adults: value })
}

const updateChildrenAges = (ages: string[]) => {
  tourSearchStore.updateSearchParams({ childrenAges: ages })
}

const handleDateChange = (date: string) => {
  tourSearchStore.updateSearchParams({ departureDate: date })
  // Перезагружаем ночи при изменении даты (из слайдера)
  loadAvailableNights()
}

const handleCalendarChange = (startDate: string) => {
  hapticFeedback('light')
  tourSearchStore.updateSearchParams({ departureDate: startDate })
  // Перезагружаем ночи при изменении даты
  loadAvailableNights()
}

const handleSearch = () => {
  hapticFeedback('medium')
  console.log('🔍 Поиск с параметрами:', tourSearchStore.searchParams)
  emit('search')
}

const handleLoadPrices = (dates: { minDate: string; maxDate: string }) => {
  emit('load-prices', dates)
}

// Загрузка доступных ночей из API
const loadAvailableNights = async () => {
  const departureCityId = parseInt(tourSearchStore.searchParams.departureCityId)
  const arrivalCountryId = searchStore.searchParams.toId
  const date = tourSearchStore.searchParams.departureDate
  
  if (!departureCityId || !arrivalCountryId || !date) return
  
  loadingNights.value = true
  try {
    const adults = tourSearchStore.searchParams.adults
    const childrenCount = tourSearchStore.searchParams.childrenAges?.length ?? 0
    
    const nights = await getNightsByFreightType(
      departureCityId,
      arrivalCountryId,
      adults,
      date, // minStartDate
      date, // maxStartDate
      childrenCount,
      0 // flightType (0 = все типы)
    )
    
    availableNights.value = nights
    console.log('🌙 Загружены доступные ночи:', nights)
    
    // Если текущее значение ночей недоступно, выбираем первое доступное
    const availableNightValues = nights.filter(n => !n.disabled).map(n => n.night)
    const currentNights = tourSearchStore.searchParams.nights
    
    if (availableNightValues.length > 0 && !availableNightValues.includes(currentNights)) {
      // Выбираем ближайшее доступное значение
      const closestNight = availableNightValues.reduce((prev, curr) => 
        Math.abs(curr - currentNights) < Math.abs(prev - currentNights) ? curr : prev
      )
      tourSearchStore.updateSearchParams({ nights: closestNight })
      console.log('🌙 Выбраны ближайшие доступные ночи:', closestNight)
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки ночей:', error)
    // При ошибке оставляем текущие значения
  } finally {
    loadingNights.value = false
  }
}

// Загружаем ночи при монтировании
onMounted(() => {
  loadAvailableNights()
})

// Перезагружаем ночи при изменении даты
watch(() => tourSearchStore.searchParams.departureDate, (newDate, oldDate) => {
  if (newDate !== oldDate) {
    loadAvailableNights()
  }
})
</script>

<style lang="scss" module src="./TourSearchParams.module.scss"></style>
