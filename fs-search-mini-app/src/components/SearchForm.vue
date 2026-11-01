<template>
  <form :class="$style['search-form']" @submit.prevent="handleSubmit">
    <!-- Откуда -->
    <CustomSelect
      v-model="fromIdModel"
      label="Откуда"
      :options="cityOptions"
      placeholder="Выберите город"
      :disabled="loadingCities || isSearching"
      required
      value-key="value"
      label-key="label"
      :max-visible="5"
      @update:model-value="handleCityChange"
    />

    <!-- Куда -->
    <CountrySelect
      v-model="toIdModel"
      label="Куда"
      :options="countries"
      placeholder="Выберите страну"
      :disabled="loadingCountries || !searchStore.searchParams.fromId || isSearching"
      required
      value-key="ebgNodeId"
      label-key="localizedName"
      @update:model-value="handleCountryChange"
    />

    <!-- Дата вылета -->
    <div :class="$style.dateInputWrapper">
      <label :class="$style.dateLabel">
        Дата вылета
        <span :class="$style.required">*</span>
      </label>
      <button
        :class="[$style.dateButton, 'date-button']"
        :disabled="loadingDates || !searchStore.searchParams.fromId || !searchStore.searchParams.toId || isSearching"
        @click="showCalendar = true"
        type="button"
      >
        {{ searchStore.searchParams.date ? formatDisplayDate(searchStore.searchParams.date, searchStore.searchParams.endDate) : 'Выберите дату' }}
      </button>
    </div>

    <!-- Calendar Popup -->
    <CalendarPopup
      v-model:show="showCalendar"
      v-model="searchStore.searchParams.date"
      :checkin-months="checkinMonths"
      :loading="loadingDates"
      @change="handleDateChange"
    />

    <!-- Длительность -->
    <CustomSelect
      v-model="searchStore.searchParams.nights"
      label="Длительность"
      :options="durationOptions"
      placeholder="Выберите"
      :disabled="loadingNights || !searchStore.searchParams.date || isSearching"
      required
      value-key="value"
      label-key="label"
      :max-visible="5"
      @update:model-value="(value) => handleChange(value)"
    />

    <!-- Кто едет -->
    <TouristsCounter
      :adults="searchStore.searchParams.adults"
      :children-ages="searchStore.searchParams.childrenAges"
      :disabled="isSearching"
      @update:adults="updateAdults"
      @update:children-ages="updateChildrenAges"
    />

    <Button 
      type="submit" 
      variant="primary" 
      size="large" 
      icon="🔍"
      full-width
      :loading="isSearching"
      :disabled="isSearching"
      @click="handleSubmit"
    >
      {{ isSearching ? 'Поиск туров...' : 'Найти туры' }}
    </Button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'
import { useSearchStore } from '@/stores/search'
import { format, parseISO, addDays, isValid } from 'date-fns'
import { ru } from 'date-fns/locale'
import Button from '@/components/shared/Button.vue'
import CustomSelect from '@/components/shared/CustomSelect.vue'
import CountrySelect from '@/components/shared/CountrySelect.vue'
import CalendarPopup from '@/components/shared/CalendarPopup.vue'
import TouristsCounter from '@/components/shared/TouristsCounter.vue'
import { mockDurations } from '@/mocks/filters'
import { 
  getDepartureCities, 
  getArrival, 
  getAvailableCheckins,
  getNightsByFreightType,
  type DepartureCity, 
  type ArrivalCountry,
  type CheckinMonth,
  type NightOption
} from '@/api/fields'

const router = useRouter()
const { hapticFeedback, showAlert } = useTelegram()
const searchStore = useSearchStore()

const cities = ref<DepartureCity[]>([])
const countries = ref<ArrivalCountry[]>([])
const durations = ref(mockDurations)
const availableDates = ref<string[]>([])
const availableNights = ref<NightOption[]>([])
const checkinMonths = ref<CheckinMonth[]>([])
const showCalendar = ref(false)
const loadingCities = ref(false)
const loadingCountries = ref(false)
const loadingDates = ref(false)
const loadingNights = ref(false)
const isSearching = ref(false)
const userSelectedNights = ref<number | null>(null) // Флаг для отслеживания пользовательского выбора

// Computed models для работы с опциональными значениями
const fromIdModel = computed({
  get: () => searchStore.searchParams.fromId?.toString() || '',
  set: (value) => searchStore.setSearchParams({ fromId: parseInt(value) || undefined })
})

const toIdModel = computed({
  get: () => searchStore.searchParams.toId?.toString() || '',
  set: (value) => searchStore.setSearchParams({ toId: parseInt(value) || undefined })
})

// Преобразуем в формат для SelectInput
const cityOptions = computed(() => 
  cities.value.map(city => ({
    value: city.ebgNodeId.toString(),
    label: city.localizedName
  }))
)


const durationOptions = computed(() => {
  // Если есть доступные ночи из API, используем их
  if (availableNights.value.length > 0) {
    return availableNights.value
      .filter(night => !night.disabled)
      .map(night => ({
        value: night.night.toString(),
        label: `${night.night} ${night.night === 1 ? 'ночь' : night.night < 5 ? 'ночи' : 'ночей'}`
      }))
  }
  // Иначе используем моки
  return durations.value.map(duration => ({
    value: duration.value.toString(),
    label: duration.label
  }))
})

const handleChange = async (value?: string | number) => {
  hapticFeedback('light')
  // handleChange вызывается при изменении длительности пользователем
  // Сохраняем выбор пользователя, чтобы не перезаписывать его при загрузке ночей
  if (value !== undefined) {
    const nightsValue = typeof value === 'number' ? value : parseInt(value.toString())
    if (!isNaN(nightsValue)) {
      userSelectedNights.value = nightsValue
    }
  }
}

const handleDateChange = async (startDate: string, endDate?: string) => {
  searchStore.setSearchParams({ date: startDate, endDate })
  
  // При изменении даты загружаем доступные ночи для новой даты
  if (startDate && 
      searchStore.searchParams.fromId && 
      searchStore.searchParams.toId) {
    await loadAvailableNights()
  }
}

// Форматирование даты для отображения
const formatDisplayDate = (dateStr: string, endDateStr?: string) => {
  try {
    const date = parseISO(dateStr)
    if (endDateStr) {
      const endDate = parseISO(endDateStr)
      return `${format(date, 'd MMM', { locale: ru })} - ${format(endDate, 'd MMM yyyy', { locale: ru })}`
    }
    return format(date, 'd MMMM yyyy', { locale: ru })
  } catch {
    return dateStr
  }
}

const handleCityChange = async (value: string | number) => {
  const cityId = parseInt(value.toString())
  searchStore.setSearchParams({ fromId: cityId })
  hapticFeedback('light')
  
  // Загружаем страны для выбранного города
  if (cityId) {
    await loadCountries(cityId)
  }
}

const handleCountryChange = async (value: string | number) => {
  const countryId = parseInt(value.toString())
  searchStore.setSearchParams({ toId: countryId })
  hapticFeedback('light')
  
  // Загружаем доступные даты для выбранного города и страны
  if (countryId && searchStore.searchParams.fromId) {
    await loadAvailableDates(countryId, searchStore.searchParams.fromId)
  }
}

// Загрузка городов отправления
const loadCities = async () => {
  loadingCities.value = true
  try {
    const data = await getDepartureCities()
    cities.value = data
    
    // Если нет сохраненного города, устанавливаем первый по умолчанию
    if (!searchStore.searchParams.fromId && data.length > 0) {
      const firstCity = data[0]
      searchStore.setSearchParams({ 
        fromId: firstCity.ebgNodeId, 
        from: firstCity.localizedName 
      })
      // Загружаем страны для первого города
      await loadCountries(firstCity.ebgNodeId)
    }
  } catch (error) {
    console.error('Failed to load cities:', error)
    await showAlert('Ошибка загрузки городов. Попробуйте позже.')
  } finally {
    loadingCities.value = false
  }
}

// Загрузка стран для выбранного города
const loadCountries = async (departureCityId: number, skipAutoLoad = false) => {
  loadingCountries.value = true
  try {
    const data = await getArrival(departureCityId)
    countries.value = data.countries
    
    // Если не пропущена автоматическая загрузка
    if (!skipAutoLoad) {
      // Если нет сохраненной страны, устанавливаем первую по умолчанию
      if (!searchStore.searchParams.toId && data.countries.length > 0) {
        const firstCountry = data.countries[0]
        searchStore.setSearchParams({ 
          toId: firstCountry.ebgNodeId, 
          to: firstCountry.localizedName 
        })
        // Загружаем доступные даты для первого города и страны
        await loadAvailableDates(firstCountry.ebgNodeId, departureCityId)
      } else if (searchStore.searchParams.toId) {
        // Если страна уже выбрана, загружаем даты
        await loadAvailableDates(searchStore.searchParams.toId, departureCityId)
      }
    }
  } catch (error) {
    console.error('Failed to load countries:', error)
    await showAlert('Ошибка загрузки стран. Попробуйте позже.')
  } finally {
    loadingCountries.value = false
  }
}

// Загрузка доступных дат заезда
const loadAvailableDates = async (arrivalCountryId: number, departureCityId: number) => {
  if (!arrivalCountryId || !departureCityId) return
  
  loadingDates.value = true
  try {
    const adultsCount = searchStore.searchParams.adults || 2
    const checkins = await getAvailableCheckins(
      arrivalCountryId,
      departureCityId,
      adultsCount
    )
    
    // Сохраняем полные данные месяцев для календаря
    checkinMonths.value = checkins
    
    // Извлекаем все доступные даты (где isCharter: true)
    const dates: string[] = []
    checkins.forEach((month: CheckinMonth) => {
      month.days.forEach((day: any) => {
        if (day.isCharter && !day.pastDay && day.number > 0) {
          // Если checkin заполнен, используем его
          if (day.checkin && day.checkin.trim() !== '') {
            dates.push(day.checkin)
          } else if (month.first_date) {
            // Формируем дату: берем первый день месяца и добавляем смещение
            try {
              const firstDay = parseISO(month.first_date)
              if (isValid(firstDay)) {
                const targetDate = addDays(firstDay, day.number - 1)
                dates.push(format(targetDate, 'yyyy-MM-dd'))
              }
            } catch (error) {
              console.warn('Failed to parse date:', month.first_date, error)
            }
          }
        }
      })
    })
    
    // Убираем дубликаты и сортируем
    availableDates.value = [...new Set(dates)].sort()
    
    // Находим ближайшую доступную дату (не прошедшую)
    const today = format(new Date(), 'yyyy-MM-dd')
    const nearestDate = availableDates.value.find(date => date >= today) || availableDates.value[0]
    
    // Если выбрана дата, которой нет в доступных, сбрасываем её
    if (searchStore.searchParams.date && !availableDates.value.includes(searchStore.searchParams.date)) {
      if (nearestDate) {
        searchStore.setSearchParams({ date: nearestDate })
        // Загружаем ночи для новой даты
        await loadAvailableNights()
      } else {
        searchStore.setSearchParams({ date: '' })
      }
    } else if (availableDates.value.length > 0 && !searchStore.searchParams.date) {
      // Устанавливаем ближайшую доступную дату по умолчанию
      searchStore.setSearchParams({ date: nearestDate })
      await loadAvailableNights()
    }
  } catch (error) {
    console.error('Failed to load available dates:', error)
    // Не показываем ошибку пользователю, просто используем все даты
  } finally {
    loadingDates.value = false
  }
}

// Загрузка доступных ночей
const loadAvailableNights = async () => {
  const departureCityId = searchStore.searchParams.fromId
  const arrivalCountryId = searchStore.searchParams.toId
  const date = searchStore.searchParams.date
  
  if (!departureCityId || !arrivalCountryId || !date) return
  
  loadingNights.value = true
  try {
    const adults = searchStore.searchParams.adults || 2
    const childrenCount = searchStore.searchParams.childrenAges?.length ?? 0
    
    const nights = await getNightsByFreightType(
      departureCityId,
      arrivalCountryId,
      adults,
      date, // checkinBeg
      date, // checkinEnd
      childrenCount,
      0, // freightType (0 = все типы)
      undefined // regions (не передаем, если не нужен)
    )
    
    availableNights.value = nights
    
    // Получаем доступные значения ночей
    const availableNightValues = nights.filter(n => !n.disabled).map(n => n.night)
    const selectedNights = searchStore.searchParams.nights
    
    // Если пользователь уже выбрал ночи и они доступны, сохраняем его выбор
    if (userSelectedNights.value && availableNightValues.includes(userSelectedNights.value)) {
      // Пользователь выбрал ночи и они доступны - сохраняем выбор
      if (selectedNights !== userSelectedNights.value) {
        searchStore.setSearchParams({ nights: userSelectedNights.value })
      }
      return // Не перезаписываем пользовательский выбор
    }
    
    // Перезаписываем только если:
    // 1. Выбранные ночи недоступны (не в списке доступных)
    // 2. Или ночи вообще не выбраны
    // НЕ перезаписываем, если выбранные ночи доступны!
    if (selectedNights && !availableNightValues.includes(selectedNights)) {
      // Выбранные ночи недоступны - выбираем первое доступное
      if (availableNightValues.length > 0) {
        const newNights = availableNightValues[0]
        searchStore.setSearchParams({ nights: newNights })
        userSelectedNights.value = newNights
      }
    } else if (!selectedNights && availableNightValues.length > 0) {
      // Ночи не выбраны - устанавливаем первое доступное только если действительно нет выбора
      const newNights = availableNightValues[0]
      searchStore.setSearchParams({ nights: newNights })
      userSelectedNights.value = newNights
    } else if (selectedNights && availableNightValues.includes(selectedNights)) {
      // Выбранные ночи доступны - сохраняем выбор пользователя
      userSelectedNights.value = selectedNights
    }
  } catch (error) {
    console.error('Failed to load available nights:', error)
    // Не показываем ошибку, используем моки
  } finally {
    loadingNights.value = false
  }
}

const updateAdults = async (value: number) => {
  searchStore.setSearchParams({ adults: value })
  
  // Перезагружаем даты и ночи при изменении количества взрослых
  if (searchStore.searchParams.fromId && searchStore.searchParams.toId) {
    await loadAvailableDates(
      searchStore.searchParams.toId,
      searchStore.searchParams.fromId
    )
    if (searchStore.searchParams.date) {
      await loadAvailableNights()
    }
  }
}

const updateChildrenAges = async (ages: string[]) => {
  searchStore.setSearchParams({ childrenAges: ages })
  
  // Перезагружаем ночи при изменении детей
  if (searchStore.searchParams.date && 
      searchStore.searchParams.fromId && 
      searchStore.searchParams.toId) {
    await loadAvailableNights()
  }
}

const handleSubmit = async (event?: Event) => {
  if (event) {
    event.preventDefault()
  }
  
  // Если уже идет поиск, не выполняем повторно
  if (isSearching.value) {
    return
  }
  
  hapticFeedback('medium')
  
  // Валидация обязательных полей
  if (!searchStore.searchParams.fromId) {
    showAlert('Пожалуйста, выберите город отправления')
    return
  }
  
  if (!searchStore.searchParams.toId) {
    showAlert('Пожалуйста, выберите страну назначения')
    return
  }
  
  if (!searchStore.searchParams.date) {
    showAlert('Пожалуйста, выберите дату вылета')
    return
  }
  
  if (!searchStore.searchParams.nights) {
    showAlert('Пожалуйста, выберите длительность поездки')
    return
  }
  
  // Устанавливаем состояние загрузки
  isSearching.value = true
  
  try {
    // Get city and country names for display
    const fromCity = cities.value.find(c => c.ebgNodeId === searchStore.searchParams.fromId)
    const toCountry = countries.value.find(c => c.ebgNodeId === searchStore.searchParams.toId)
    
    // Update search params with names
    searchStore.setSearchParams({
      from: fromCity?.localizedName || '',
      to: toCountry?.localizedName || ''
    })
    
    // Navigate to results with IDs instead of names
    await router.push({
      name: 'Results',
      query: {
        from: searchStore.searchParams.fromId,
        to: searchStore.searchParams.toId,
        date: searchStore.searchParams.date,
        nights: searchStore.searchParams.nights,
        adults: searchStore.searchParams.adults,
        children: searchStore.searchParams.childrenAges?.join(',') || ''
      }
    })
  } catch (error) {
    console.error('Navigation error:', error)
    isSearching.value = false
  }
  // Не сбрасываем isSearching здесь, так как после навигации компонент будет размонтирован
}

// Load saved search params on mount
onMounted(async () => {
  // Сохраняем начальные значения, чтобы понять, были ли они установлены до загрузки
  const hadFromId = !!searchStore.searchParams.fromId
  const hadToId = !!searchStore.searchParams.toId
  const hadDate = !!searchStore.searchParams.date
  
  // Загружаем города
  await loadCities()
  
  // Если город был установлен ДО загрузки (сохраненный), загружаем страны и даты
  // Если город был установлен ВНУТРИ loadCities (первый по умолчанию), то loadCountries уже вызван
  if (hadFromId && searchStore.searchParams.fromId) {
    // Город был сохранен, загружаем страны (без автоматической загрузки дат)
    await loadCountries(searchStore.searchParams.fromId, true)
    
    // Если страна была сохранена, загружаем даты и ночи
    if (hadToId && searchStore.searchParams.toId && searchStore.searchParams.fromId) {
      await loadAvailableDates(
        searchStore.searchParams.toId, 
        searchStore.searchParams.fromId
      )
      
      // Если дата была сохранена, загружаем ночи
      if (hadDate && searchStore.searchParams.date) {
        await loadAvailableNights()
      }
    }
  }
  // Если город был установлен в loadCities, то loadCountries уже вызван с автоматической загрузкой
  
  // Set default values if they are empty (только если нет данных из API)
  if (!searchStore.searchParams.date && availableDates.value.length === 0) {
    searchStore.setSearchParams({ date: format(new Date(), 'yyyy-MM-dd') })
  }
  
  if (!searchStore.searchParams.nights && availableNights.value.length === 0) {
    searchStore.setSearchParams({ nights: 7 })
  }
})
</script>

<style lang="scss" module src="./SearchForm.module.scss"></style>
