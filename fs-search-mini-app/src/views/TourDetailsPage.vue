<template>
  <div :class="$style.tourDetails">
    <!-- Верхняя часть: Фото + Описание слева, Параметры справа -->
    <div :class="$style.topSection">
      <!-- Левая часть: Фото + Описание отеля -->
      <div :class="$style.hotelSection">
        <div :class="$style.container">
          <!-- Галерея фотографий -->
          <div v-if="hotelGallery.length > 0" :class="$style.gallerySection">
            <h3 :class="$style.galleryTitle">Фотографии отеля</h3>
            <PhotoGallery :photos="hotelGallery" />
          </div>

          <!-- Информация об отеле -->
          <HotelInfo
            :hotel-name="hotelName"
            :location="location"
            :stars="hotelStars"
            :description="hotelDescription"
            :features="hotelFeatures"
            :description-blocks="hotelDescriptionBlocks"
          />
        </div>
      </div>

      <!-- Правая часть: Параметры поиска -->
      <div :class="$style.paramsSection">
        <TourSearchParams 
          :total-offers="tourDetailsStore.offers.length"
          :loading="tourDetailsStore.loading"
          @search="handleSearch"
          @load-prices="handleLoadPrices"
        />
      </div>
    </div>

    <!-- Результаты: Карточки номеров -->
    <div :class="$style.resultsWrapper">
      <div v-if="tourDetailsStore.loading" :class="$style.loading">
        <div :class="$style.spinner"></div>
        <p>Загрузка предложений...</p>
      </div>

      <div v-else-if="tourDetailsStore.error && !tourDetailsStore.fullHotel" :class="$style.error">
        <p>{{ tourDetailsStore.error }}</p>
        <Button variant="primary" @click="loadOffers">
          Попробовать снова
        </Button>
      </div>

      <div v-else :class="$style.offersContainer">
        <h2 :class="$style.sectionTitle">Выберите номер</h2>
        
        <!-- Фильтры - всегда показываем -->
        <div :class="$style.offersFilters">
          <!-- Тип рейса -->
          <div :class="$style.flightTabs">
            <button 
              :class="[$style.flightTab, { [$style.active]: selectedFlightType === 'all' }]"
              @click="selectFlightType('all')"
            >
              Все
            </button>
            <button 
              :class="[$style.flightTab, { [$style.active]: selectedFlightType === 'charter' }]"
              @click="selectFlightType('charter')"
            >
              Чартер + отель
            </button>
            <button 
              :class="[$style.flightTab, { [$style.active]: selectedFlightType === 'regular' }]"
              @click="selectFlightType('regular')"
            >
              Регулярный + отель
            </button>
            <button 
              :class="[$style.flightTab, { [$style.active]: selectedFlightType === 'hotelNoFly' }]"
              @click="selectFlightType('hotelNoFly')"
            >
              Только отель
            </button>
          </div>
          
          <!-- Селекты питания и типа номера -->
          <div :class="$style.selectFilters">
            <CustomSelect
              v-model="selectedMealId"
              label="Питание"
              :options="mealOptions"
              placeholder="Все типы питания"
              value-key="value"
              label-key="label"
            />
            <CustomSelect
              v-model="selectedRoomId"
              label="Тип номера"
              :options="roomOptions"
              placeholder="Все типы номеров"
              value-key="value"
              label-key="label"
            />
          </div>
        </div>
        
        <!-- Пустой результат - нет предложений вообще -->
        <div v-if="tourDetailsStore.offers.length === 0" :class="$style.empty">
          <p :class="$style.emptyIcon">🏨</p>
          <p :class="$style.emptyTitle">Нет доступных предложений</p>
          <p :class="$style.emptyText">Попробуйте изменить параметры поиска или выбрать другой тип рейса</p>
        </div>
        
        <!-- Есть офферы -->
        <template v-else>
          <p :class="$style.sectionSubtitle">
            {{ filteredOffers.length }} {{ pluralizeOffers(filteredOffers.length) }} 
            в {{ filteredGroupedByRoom.length }} {{ pluralizeRoomTypes(filteredGroupedByRoom.length) }}
          </p>
          
          <!-- Пустой результат фильтров -->
          <div v-if="filteredOffers.length === 0" :class="$style.emptyFilters">
            <p>Нет предложений по выбранным фильтрам</p>
            <Button variant="secondary" size="small" @click="resetFilters">
              Сбросить фильтры
            </Button>
          </div>
          
          <div v-else :class="$style.roomGroups">
            <RoomGroup
              v-for="group in filteredGroupedByRoom"
              :key="group.roomId"
              :room-id="group.roomId"
              :offers="group.offers"
              :rooms="tourDetailsStore.rooms"
              :meals="tourDetailsStore.meals"
              :room-types="fullHotel?.roomTypes"
              :min-price-overall="minPriceOverall"
              :all-offers="tourDetailsStore.offers"
              :hotel-images="fullHotel?.images"
              @select="handleSelectRoom"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RoomGroup from '@/components/RoomGroup.vue'
import HotelInfo from '@/components/HotelInfo.vue'
import PhotoGallery from '@/components/PhotoGallery.vue'
import TourSearchParams from '@/components/TourSearchParams.vue'
import Button from '@/components/shared/Button.vue'
import CustomSelect from '@/components/shared/CustomSelect.vue'
import type { TourOffer } from '@/types/tour-details'
import { useTelegram } from '@/composables/useTelegram'
import { useTourDetailsStore } from '@/stores/tourDetails'
import { useSearchStore } from '@/stores/search'
import { useTourSearchStore } from '@/stores/tourSearch'
import { getAvailableCheckins } from '@/api/fields'

const route = useRoute()
const router = useRouter()
const { showBackButton, hideBackButton, hapticFeedback } = useTelegram()

// Stores
const tourDetailsStore = useTourDetailsStore()
const searchStore = useSearchStore()
const tourSearchStore = useTourSearchStore()

// Информация об отеле из fullHotel или offers
const firstOffer = computed(() => tourDetailsStore.offers[0] || null)
const fullHotel = computed(() => tourDetailsStore.fullHotel)

const hotelName = computed(() => {
  // Приоритет: fullHotel, затем offers
  if (fullHotel.value?.localizedName) {
    return fullHotel.value.localizedName
  }
  return firstOffer.value?.hotelName || 'Загрузка...'
})

const location = computed(() => {
  // Адрес из fullHotel или townName из offers
  if (fullHotel.value?.address) {
    return fullHotel.value.address
  }
  return firstOffer.value?.townName || ''
})

const hotelStars = computed(() => {
  // Приоритет: fullHotel.hotelCategory, затем offers.stars
  if (fullHotel.value?.hotelCategory?.id) {
    return fullHotel.value.hotelCategory.id
  }
  if (firstOffer.value?.stars) {
    return firstOffer.value.stars
  }
  return 5
})

// Галерея фотографий отеля из fullHotel.images
const hotelGallery = computed(() => {
  if (fullHotel.value?.images && fullHotel.value.images.length > 0) {
    return fullHotel.value.images.map(img => img.src)
  }
  return []
})

// Краткое описание отеля из fullHotel
const hotelDescription = computed(() => {
  if (fullHotel.value) {
    // Приоритет 1: generalDescription или shortText
    if (fullHotel.value.generalDescription && fullHotel.value.generalDescription.trim()) {
      return fullHotel.value.generalDescription
    }
    if (fullHotel.value.shortText && fullHotel.value.shortText.trim()) {
      return fullHotel.value.shortText
    }
    
    // Приоритет 2: Формируем краткое описание
    const parts: string[] = []
    
    // Категория + тип (например: "5 звезд • Премиум")
    const categoryTag = []
    if (fullHotel.value.hotelCategory?.displayName) {
      categoryTag.push(fullHotel.value.hotelCategory.displayName)
    }
    if (fullHotel.value.typeTags?.length) {
      categoryTag.push(...fullHotel.value.typeTags.map(t => t.localizedName))
    }
    if (categoryTag.length > 0) {
      parts.push(categoryTag.join(' • '))
    }
    
    // Тип отдыха
    if (fullHotel.value.restTypes?.length) {
      parts.push(fullHotel.value.restTypes.map(r => r.name).join(', '))
    }
    
    // Основные рекомендации (первые 4)
    if (fullHotel.value.recommendations?.length) {
      const topRecs = fullHotel.value.recommendations
        .slice(0, 4)
        .map(r => r.name)
        .join(', ')
      parts.push(topRecs)
    }
    
    // Год постройки/реновации
    if (fullHotel.value.renovationYear && fullHotel.value.renovationYear > 0) {
      parts.push(`Реновация ${fullHotel.value.renovationYear}`)
    } else if (fullHotel.value.constructionYear && fullHotel.value.constructionYear > 0) {
      parts.push(`Год постройки: ${fullHotel.value.constructionYear}`)
    }
    
    if (parts.length > 0) {
      return parts.join('. ')
    }
  }
  // Fallback на данные из offers
  if (firstOffer.value) {
    const tourType = firstOffer.value.tourType?.name || ''
    const programType = firstOffer.value.programType?.name || ''
    return `${tourType}${programType ? ` • ${programType}` : ''}`
  }
  return ''
})

// Features из fullHotel и offers
const hotelFeatures = computed(() => {
  const features: Array<{ id: string; icon: string; text: string }> = []
  
  if (fullHotel.value) {
    // Рейтинг TopHotels
    if (fullHotel.value.topHotels?.rating) {
      features.push({ 
        id: 'rating', 
        icon: '⭐', 
        text: `${fullHotel.value.topHotels.rating.toFixed(1)} (${fullHotel.value.topHotels.ratesCount} отзывов)` 
      })
    }
    
    // Категория отеля
    if (fullHotel.value.hotelCategory?.displayName) {
      features.push({ id: 'category', icon: '🏨', text: fullHotel.value.hotelCategory.displayName })
    }
    
    // Год постройки/реновации
    if (fullHotel.value.renovationYear && fullHotel.value.renovationYear > 0) {
      features.push({ id: 'renovation', icon: '🔧', text: `Реновация ${fullHotel.value.renovationYear}` })
    } else if (fullHotel.value.constructionYear && fullHotel.value.constructionYear > 0) {
      features.push({ id: 'construction', icon: '🏗️', text: `Построен в ${fullHotel.value.constructionYear}` })
    }
    
    // Рекомендации (первые 3)
    const recommendations = fullHotel.value.recommendations?.slice(0, 3) || []
    recommendations.forEach(rec => {
      features.push({ id: `rec-${rec.id}`, icon: '✓', text: rec.name })
    })
  }
  
  // Добавляем данные из оффера если есть
  if (firstOffer.value) {
    // Мгновенное подтверждение
    if (firstOffer.value.isInstantConfirmation) {
      features.push({ id: 'instant', icon: '⚡', text: 'Мгновенное подтверждение' })
    }
  }
  
  return features
})

// Description Blocks из fullHotel (Бассейны, SPA, и т.д.)
const hotelDescriptionBlocks = computed(() => {
  if (fullHotel.value?.descriptionBlocks) {
    // Сортируем по sortOrder и фильтруем только непустые блоки
    return fullHotel.value.descriptionBlocks
      .filter(block => block.text || block.descriptionBlockFilters?.length)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }
  return []
})

// ===== ФИЛЬТРЫ ДЛЯ ОФФЕРОВ =====
const selectedFlightType = ref<'all' | 'charter' | 'regular' | 'hotelNoFly'>('all')
const selectedMealId = ref<string>('')
const selectedRoomId = ref<string>('')

// Опции для фильтра питания
const mealOptions = computed(() => {
  const mealsArray = tourDetailsStore.meals || []
  const options = [{ value: '', label: 'Все типы питания' }]
  
  // Собираем уникальные типы питания из офферов
  const uniqueMealIds = new Set<number>()
  tourDetailsStore.offers.forEach(offer => {
    uniqueMealIds.add(offer.mealId)
  })
  
  uniqueMealIds.forEach(mealId => {
    // Ищем meal в массиве по mealTypeId или mealTypeGroupId
    const meal = mealsArray.find(m => m.mealTypeId === mealId || m.mealTypeGroupId === mealId)
    if (meal) {
      options.push({ value: mealId.toString(), label: meal.mealTypeName || meal.mealTypeGroupName })
    }
  })
  
  return options
})

// Опции для фильтра типа номера
const roomOptions = computed(() => {
  const roomsArray = tourDetailsStore.rooms || []
  const options = [{ value: '', label: 'Все типы номеров' }]
  
  // Собираем уникальные типы номеров из офферов
  const uniqueRoomIds = new Set<number>()
  tourDetailsStore.offers.forEach(offer => {
    uniqueRoomIds.add(offer.roomId)
  })
  
  uniqueRoomIds.forEach(roomId => {
    // Ищем room в массиве по id
    const room = roomsArray.find(r => r.id === roomId)
    if (room) {
      options.push({ value: roomId.toString(), label: room.name })
    }
  })
  
  return options
})

// Фильтрация офферов (локальная - питание и тип номера)
// Тип рейса фильтруется через API
const filteredOffers = computed(() => {
  return tourDetailsStore.offers.filter(offer => {
    // Фильтр по питанию
    if (selectedMealId.value && offer.mealId.toString() !== selectedMealId.value) {
      return false
    }
    
    // Фильтр по типу номера
    if (selectedRoomId.value && offer.roomId.toString() !== selectedRoomId.value) {
      return false
    }
    
    return true
  })
})

// Группировка отфильтрованных офферов по типу номера
const filteredGroupedByRoom = computed(() => {
  const groups: Record<number, TourOffer[]> = {}
  
  for (const offer of filteredOffers.value) {
    if (!groups[offer.roomId]) {
      groups[offer.roomId] = []
    }
    groups[offer.roomId].push(offer)
  }
  
  // Сортируем группы по минимальной цене в каждой
  const sortedEntries = Object.entries(groups).sort((a, b) => {
    const minA = Math.min(...a[1].map(o => o.price.value))
    const minB = Math.min(...b[1].map(o => o.price.value))
    return minA - minB
  })
  
  return sortedEntries.map(([roomId, offers]) => ({
    roomId: Number(roomId),
    offers: offers.sort((a, b) => a.price.value - b.price.value)
  }))
})

// Выбор типа рейса - перезагружаем офферы из API
const selectFlightType = async (type: 'all' | 'charter' | 'regular' | 'hotelNoFly') => {
  hapticFeedback('light')
  selectedFlightType.value = type
  // Перезагружаем офферы с новым типом рейса
  await loadOffers()
}

// Сброс фильтров
const resetFilters = () => {
  hapticFeedback('light')
  selectedFlightType.value = 'all'
  selectedMealId.value = ''
  selectedRoomId.value = ''
}

// Склонение слова "вариант"
const pluralizeOffers = (count: number): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'вариант'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'варианта'
  return 'вариантов'
}

// Склонение слова "тип номера"
const pluralizeRoomTypes = (count: number): string => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'типе номера'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'типах номеров'
  return 'типах номеров'
}

// Минимальная цена среди всех офферов
const minPriceOverall = computed(() => {
  if (tourDetailsStore.offers.length === 0) return 0
  return Math.min(...tourDetailsStore.offers.map(o => o.price.value))
})

const loadOffers = async () => {
  const hotelId = route.params.hotelId as string
  
  // Set hotel info from route
  tourDetailsStore.setHotelInfo({
    id: hotelId,
    name: hotelName.value,
    location: location.value,
    stars: hotelStars.value
  })
  
  // Use params from tourSearchStore - это гарантирует, что изменения в TourSearchParams влияют на результаты
  const params = tourSearchStore.searchParams
  
  // Формируем параметры API в соответствии с GetByHotelsRequest
  const apiParams = {
    clientId: 'b2c:ru',
    lang: 'ru',
    departureCityId: params.departureCityId,
    arrivalCountryId: searchStore.searchParams.toId?.toString() || '18803',
    minStartDate: params.departureDate,
    maxStartDate: params.departureDate, // При изменении даты в TourSearchParams меняется и запрос
    nightsFrom: params.nights.toString(),
    nightsTo: params.nights.toString(), // При изменении ночей в TourSearchParams меняется и запрос
    adults: params.adults.toString(), // При изменении взрослых в TourSearchParams меняется и запрос
    children: params.childrenAges, // Массив возрастов детей (строки)
    currency: '1',
    catclaim: '', // Пустой catclaim
    programTypes: [1, 5, 14, 87, 114, 281, 312],
    hotelIds: [parseInt(hotelId)],
    flightTypes: selectedFlightType.value // all, charter, regular, hotelNoFly
  }
  
  console.log('🔍 Загрузка предложений с параметрами:', {
    date: params.departureDate,
    nights: params.nights,
    adults: params.adults,
    childrenAges: params.childrenAges,
    departureCityId: params.departureCityId,
    flightTypes: selectedFlightType.value
  })
  
  try {
    await tourDetailsStore.fetchTourDetails(hotelId, apiParams)
    if (!tourDetailsStore.error) {
      hapticFeedback('success')
      
      // Загружаем доступные даты из API только при первой загрузке
      if (tourSearchStore.availableDates.length === 0) {
        await loadAvailableDates()
      }
      
      // Обновляем цену для текущей даты из реального ответа API
      updateDatePriceFromOffers(params.departureDate)
    } else {
      hapticFeedback('error')
    }
  } catch (err) {
    hapticFeedback('error')
    console.error('Failed to load offers:', err)
  }
}

// Обновляем минимальную цену для дат из офферов API
// Учитываем диапазон checkinDate - checkoutDate каждого оффера
const updateDatePriceFromOffers = (_dateStr: string) => {
  console.log('📊 updateDatePriceFromOffers:', {
    offersCount: tourDetailsStore.offers.length,
    availableDatesCount: tourSearchStore.availableDates.length
  })
  
  if (tourDetailsStore.offers.length === 0) {
    console.log('⚠️ Нет офферов для обновления цены')
    return
  }
  
  // Собираем минимальные цены для каждой даты из всех офферов
  // Каждый оффер охватывает диапазон checkinDate - checkoutDate
  const datePrices: Record<string, number> = {}
  
  for (const offer of tourDetailsStore.offers) {
    // Получаем checkinDate в формате YYYY-MM-DD
    const checkinDate = offer.checkinDate?.split('T')[0]
    
    if (checkinDate) {
      // Обновляем минимальную цену для этой даты заезда
      if (!datePrices[checkinDate] || offer.price.value < datePrices[checkinDate]) {
        datePrices[checkinDate] = offer.price.value
      }
    }
  }
  
  console.log('💵 Цены по датам:', datePrices)
  
  // Обновляем цены в доступных датах
  const updatedDates = tourSearchStore.availableDates.map(d => {
    if (datePrices[d.date]) {
      return { ...d, minPrice: datePrices[d.date], available: true }
    }
    return d
  })
  
  tourSearchStore.setAvailableDates(updatedDates)
  console.log(`💰 Обновлены цены для ${Object.keys(datePrices).length} дат`)
}

// Загрузка доступных дат из API get-available-checkins
const loadAvailableDates = async () => {
  const hotelId = route.params.hotelId as string
  const params = tourSearchStore.searchParams
  const arrivalCountryId = parseInt(searchStore.searchParams.toId?.toString() || '18803')
  const departureCityId = parseInt(params.departureCityId)
  const adultsCount = params.adults
  
  console.log('📅 Загрузка доступных дат для отеля:', {
    hotelId,
    arrivalCountryId,
    departureCityId,
    adultsCount
  })
  
  try {
    const checkinMonths = await getAvailableCheckins(
      arrivalCountryId,
      departureCityId,
      adultsCount,
      undefined, // isResirvation
      hotelId // hotelIds
    )
    
    // Преобразуем ответ API в формат DateOption
    const availableDates: { date: string; minPrice: number; available: boolean }[] = []
    
    for (const month of checkinMonths) {
      for (const day of month.days) {
        // Пропускаем прошедшие даты
        if (day.pastDay) continue
        
        // Берём дату в формате YYYY-MM-DD из iso или checkin
        const dateStr = day.iso ? day.iso.split('T')[0] : day.checkin
        
        availableDates.push({
          date: dateStr,
          minPrice: 0, // Цена будет загружена при выборе даты
          available: true
        })
      }
    }
    
    // Сортируем по дате
    availableDates.sort((a, b) => a.date.localeCompare(b.date))
    
    console.log(`📅 Загружено ${availableDates.length} доступных дат из API`)
    tourSearchStore.setAvailableDates(availableDates)
    
    // Если текущая выбранная дата не в списке доступных, выбираем первую доступную
    if (availableDates.length > 0) {
      const currentDate = params.departureDate
      const isCurrentDateAvailable = availableDates.some(d => d.date === currentDate)
      
      if (!isCurrentDateAvailable) {
        console.log('📅 Текущая дата недоступна, выбираем первую доступную:', availableDates[0].date)
        tourSearchStore.updateSearchParams({ departureDate: availableDates[0].date })
      }
      
      // Цены загружаются при скролле DateSlider через checkAndLoadPrices
      // Не делаем автозагрузку здесь, чтобы не дублировать запросы
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки доступных дат:', error)
    // При ошибке оставляем пустой список дат
    tourSearchStore.setAvailableDates([])
  }
}

// Загрузка цен для диапазона дат
const loadPricesForRange = async (minDate: string, maxDate: string) => {
  const hotelId = route.params.hotelId as string
  const params = tourSearchStore.searchParams
  
  const apiParams = {
    clientId: 'b2c:ru',
    lang: 'ru',
    departureCityId: params.departureCityId,
    arrivalCountryId: searchStore.searchParams.toId?.toString() || '18803',
    minStartDate: minDate,
    maxStartDate: maxDate,
    nightsFrom: params.nights.toString(),
    nightsTo: params.nights.toString(),
    adults: params.adults.toString(),
    children: params.childrenAges, // Массив возрастов детей (строки)
    currency: '1',
    catclaim: '',
    programTypes: [1, 5, 14, 87, 114, 281, 312],
    hotelIds: [parseInt(hotelId)],
    flightTypes: selectedFlightType.value // all, charter, regular, hotelNoFly
  }
  
  try {
    const { getTourOffersByHotels } = await import('@/api/tour-details')
    const response = await getTourOffersByHotels(apiParams)
    
    if (response.offers && response.offers.length > 0) {
      const datePrices: Record<string, number> = {}
      
      for (const offer of response.offers) {
        const checkinDate = offer.checkinDate?.split('T')[0]
        if (checkinDate) {
          if (!datePrices[checkinDate] || offer.price.value < datePrices[checkinDate]) {
            datePrices[checkinDate] = offer.price.value
          }
        }
      }
      
      console.log('💵 Загружены цены для диапазона:', datePrices)
      
      const updatedDates = tourSearchStore.availableDates.map(d => {
        if (datePrices[d.date]) {
          return { ...d, minPrice: datePrices[d.date], available: true }
        }
        return d
      })
      
      tourSearchStore.setAvailableDates(updatedDates)
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки цен:', error)
  }
}

const handleSearch = () => {
  loadOffers()
}

// Загрузка цен для диапазона дат при скролле DateSlider
const handleLoadPrices = async (dates: { minDate: string; maxDate: string }) => {
  console.log('💰 Запрос загрузки цен при скролле:', dates)
  await loadPricesForRange(dates.minDate, dates.maxDate)
}

const handleSelectRoom = (offer: TourOffer) => {
  hapticFeedback('medium')
  tourDetailsStore.selectOffer(offer)
  
  // Переходим на страницу авторизации, которая затем перенаправит на оплату
  router.push({
    name: 'Auth',
    params: { tourKey: offer.tourKey },
    query: {
      tourId: offer.tourId.toString(),
      roomId: offer.roomId.toString(),
      mealId: offer.mealId.toString(),
      hotelName: offer.hotelName,
      roomName: tourDetailsStore.rooms.find(r => r.id === offer.roomId)?.name,
      mealName: tourDetailsStore.meals.find(m => m.mealTypeId === offer.mealId)?.mealTypeName,
      price: offer.price.value.toString(),
      oldPrice: offer.price.oldValue > 0 ? offer.price.oldValue.toString() : undefined,
      nights: offer.nightsCount.toString(),
      checkIn: offer.checkinDate,
      checkOut: offer.checkoutDate,
      adults: offer.paxes.adultsCount.toString(),
      children: offer.paxes.childrenCount.toString(),
      accomodation: offer.accomodation.name,
      programType: offer.programType.name
    }
  })
}

// Нормализация даты из URL (ISO формат -> YYYY-MM-DD)
const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return ''
  
  // Если уже в формате YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  // Парсим ISO формат (2025-12-09T00:00:00+03:00)
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

onMounted(async () => {
  showBackButton(() => {
    router.back()
  })
  
  // Инициализируем параметры поиска из route.query
  const queryDepartureCityId = route.query.departureCityId as string
  const queryArrivalCountryId = route.query.arrivalCountryId as string
  const queryNights = route.query.nights as string
  const queryAdults = route.query.adults as string
  const queryChildrenAges = route.query.childrenAges as string // Формат: "3,7,12"
  const queryDate = route.query.date as string
  
  // Нормализуем дату из URL
  const normalizedDate = normalizeDate(queryDate)
  
  console.log('📅 Дата из URL:', queryDate, '→ нормализовано:', normalizedDate)
  console.log('🌍 arrivalCountryId из URL:', queryArrivalCountryId)
  
  // Обновляем arrivalCountryId в searchStore если передан
  if (queryArrivalCountryId) {
    searchStore.searchParams.toId = parseInt(queryArrivalCountryId)
  }
  
  // Парсим возрасты детей из query string
  const childrenAgesFromQuery = queryChildrenAges ? queryChildrenAges.split(',').filter(age => age.trim()) : []
  
  if (queryDepartureCityId || queryNights || queryAdults || queryChildrenAges || normalizedDate) {
    tourSearchStore.updateSearchParams({
      departureCityId: queryDepartureCityId || tourSearchStore.searchParams.departureCityId,
      nights: queryNights ? parseInt(queryNights) : tourSearchStore.searchParams.nights,
      adults: queryAdults ? parseInt(queryAdults) : tourSearchStore.searchParams.adults,
      childrenAges: childrenAgesFromQuery.length > 0 ? childrenAgesFromQuery : tourSearchStore.searchParams.childrenAges,
      departureDate: normalizedDate || tourSearchStore.searchParams.departureDate
    })
  }
  
  loadOffers()
})

onBeforeUnmount(() => {
  hideBackButton()
})
</script>

<style lang="scss" module src="./TourDetailsPage.module.scss"></style>

