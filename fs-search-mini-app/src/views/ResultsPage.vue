<template>
  <div :class="$style['results-page']">
    <div :class="$style['results-page__header']">
      <div :class="$style['results-page__info']">
        <h1 :class="$style['results-page__title']">Найдено туров: {{ filteredTours.length }}</h1>
        <p :class="$style['results-page__params']">
          {{ searchSummary }}
        </p>
      </div>
      <Button
        variant="primary"
        size="medium"
        icon="⚙"
        :class="$style['results-page__filter-button']"
        @click="toggleFilters"
      >
        Фильтры
      </Button>
    </div>

    <!-- Desktop layout: 2 columns -->
    <div :class="$style['results-page__container']">
      <!-- Фильтры (desktop sidebar / mobile collapsible) -->
      <aside :class="$style['results-page__sidebar']">
        <div :class="$style['results-page__sidebar-content']">
          <SearchFilters @close="toggleFilters" />
        </div>
      </aside>

      <!-- Результаты -->
      <main :class="$style['results-page__main']">
        <!-- Mobile filters -->
        <Transition name="slide">
          <div v-if="showFilters" :class="$style['results-page__filters-mobile']">
            <SearchFilters @close="toggleFilters" />
          </div>
        </Transition>

        <!-- Сортировка -->
        <div v-if="!toursStore.loading && filteredTours.length > 0" :class="$style['results-page__sort']">
          <TourSort 
            v-model="toursStore.sort" 
            :disabled="toursStore.loading"
            @update:model-value="handleSortChange"
          />
        </div>

        <div v-if="toursStore.loading" :class="$style['results-page__loading']">
          <div :class="$style['results-page__loader']"></div>
          <p>Загружаем туры...</p>
        </div>

        <div v-else-if="filteredTours.length === 0" :class="$style['results-page__empty']">
          <span :class="$style['results-page__empty-icon']">🔍</span>
          <h3>Туры не найдены</h3>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
          <Button 
            variant="secondary" 
            size="medium"
            @click="filtersStore.resetFilters()"
          >
            Сбросить фильтры
          </Button>
        </div>

        <div v-else :class="$style['results-page__list']">
          <TourCard
            v-for="tour in filteredTours"
            :key="tour.md5_id"
            :tour="tour"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute, type LocationQueryValue } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'
import { useToursStore } from '@/stores/tours'
import { useFiltersStore } from '@/stores/filters'
import { useSearchStore } from '@/stores/search'
import { formatDate } from '@/utils/helpers'
import SearchFilters from '@/components/SearchFilters.vue'
import TourCard from '@/components/TourCard.vue'
import TourSort from '@/components/shared/TourSort.vue'
import Button from '@/components/shared/Button.vue'

const router = useRouter()
const route = useRoute()
const { showBackButton, hideBackButton, hapticFeedback } = useTelegram()

// Stores
const toursStore = useToursStore()
const filtersStore = useFiltersStore()
const searchStore = useSearchStore()

const showFilters = ref(false)

const searchSummary = computed(() => {
  const { date, nights, adults } = route.query
  const childrenAges = searchStore.searchParams.childrenAges || []
  const parts = []
  
  // Используем название страны из searchStore (если есть) или показываем ID
  const toName = searchStore.searchParams.to || route.query.to
  if (toName) parts.push(`в ${toName}`)
  
  if (date) {
    // Форматируем дату из ISO формата в читаемый вид
    const formattedDate = formatDate(String(date), 'long')
    if (formattedDate) {
      parts.push(`на ${formattedDate}`)
    } else {
      // Если не удалось распарсить, пробуем просто извлечь дату
      const dateMatch = String(date).match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) {
        parts.push(`на ${dateMatch[1]}`)
      } else {
        parts.push(`на ${date}`)
      }
    }
  }
  if (nights) parts.push(`${nights} ночей`)
  
  const travelers = []
  if (adults) travelers.push(`${adults} взр.`)
  if (childrenAges.length > 0) travelers.push(`${childrenAges.length} дет.`)
  if (travelers.length) parts.push(travelers.join(', '))
  
  return parts.join(' • ')
})

// Теперь фильтрация происходит на бэке, поэтому просто возвращаем туры
const filteredTours = computed(() => toursStore.tours)

const toggleFilters = () => {
  showFilters.value = !showFilters.value
  hapticFeedback('light')
}

const handleSortChange = async () => {
  // Перезагружаем туры с новой сортировкой
  await loadTours()
}

const loadTours = async () => {
  // Load tours with search params from route
  // Преобразуем LocationQueryValue в нужные типы
  const getQueryString = (value: LocationQueryValue | LocationQueryValue[] | null | undefined): string | undefined => {
    if (value === null || value === undefined) return undefined
    if (Array.isArray(value)) return value[0] || undefined
    return value || undefined
  }
  
  const getQueryNumber = (value: LocationQueryValue | LocationQueryValue[] | null | undefined): string | number | undefined => {
    const str = getQueryString(value)
    return str ? (isNaN(Number(str)) ? str : Number(str)) : undefined
  }
  
  const searchParams = {
    from: getQueryNumber(route.query.from),
    to: getQueryNumber(route.query.to),
    date: getQueryString(route.query.date),
    nights: getQueryNumber(route.query.nights),
    adults: getQueryNumber(route.query.adults)
    // childrenAges берутся из searchStore внутри fetchTours
  }
  
  await toursStore.fetchTours(searchParams)
}

// Перезагружаем туры при изменении фильтров (но не при первой загрузке и не во время загрузки)
const isInitialLoad = ref(true)
let lastFiltersJson = ''

watch(
  () => filtersStore.activeFilters,
  (newFilters) => {
    if (isInitialLoad.value) {
      return
    }
    
    // Не делаем запрос если уже идёт загрузка
    if (toursStore.loading) {
      return
    }
    
    // Сравниваем JSON чтобы избежать лишних запросов при одинаковых данных
    const newJson = JSON.stringify(newFilters)
    if (newJson === lastFiltersJson) {
      return
    }
    lastFiltersJson = newJson
    
    // Перезагружаем туры с новыми фильтрами
    loadTours()
  },
  { deep: true }
)

onMounted(async () => {
  showBackButton(() => {
    router.push('/')
  })
  
  // Синхронизируем searchStore с URL параметрами
  // Это важно для TourCard, который берёт fromId/toId из store
  const fromId = route.query.from
  const toId = route.query.to
  
  if (fromId) {
    searchStore.setSearchParams({ 
      fromId: parseInt(fromId.toString()),
      date: route.query.date?.toString() || '',
      nights: parseInt(route.query.nights?.toString() || '7'),
      adults: parseInt(route.query.adults?.toString() || '2')
      // childrenAges уже в store из SearchForm
    })
  }
  if (toId) {
    searchStore.setSearchParams({ toId: parseInt(toId.toString()) })
  }
  
  // Загружаем туры при монтировании
  await loadTours()
  // После первой загрузки разрешаем watch срабатывать
  // Используем nextTick, чтобы убедиться, что все изменения применены
  await new Promise(resolve => setTimeout(resolve, 100))
  isInitialLoad.value = false
})

onUnmounted(() => {
  hideBackButton()
})
</script>

<style lang="scss" module src="./ResultsPage.module.scss"></style>

