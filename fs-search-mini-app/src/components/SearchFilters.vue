<template>
  <div :class="$style.searchFilters">
    <div :class="$style.header">
      <h3 :class="$style.title">Фильтры</h3>
      <div :class="$style.actions">
        <button :class="$style.resetBtn" @click="handleReset">
          Сбросить
        </button>
        <button :class="$style.closeBtn" @click="handleClose">
          ✕
        </button>
      </div>
    </div>

    <div :class="$style.content">
      <!-- Динамически рендерим фильтры на основе данных из API -->
      <template v-for="filterConfig in dynamicFilters" :key="filterConfig.key">
        <!-- Популярные фильтры -->
        <FilterGroupComponent 
          v-if="filterConfig.type === 'popular' && filterConfig.data && filterConfig.data.length > 0" 
          :title="filterConfig.title"
        >
          <CheckboxInput
            v-for="item in filterConfig.data"
            :key="item.id"
            v-model="selectedValues[filterConfig.key][item.id]"
            :label="item.name_ru"
            @update:model-value="applyFiltersToStore"
          />
        </FilterGroupComponent>

        <!-- Цена -->
        <FilterGroupComponent 
          v-else-if="filterConfig.type === 'price'" 
          :title="filterConfig.title"
        >
          <PriceRangeInput
            :model-value="{ min: filtersStore.activeFilters.priceRange[0], max: filtersStore.activeFilters.priceRange[1] }"
            :min="filtersStore.priceRange.min"
            :max="filtersStore.priceRange.max"
            @update:model-value="(val) => onPriceChange({ min: val.min, max: val.max })"
          />
        </FilterGroupComponent>

        <!-- Поиск отеля -->
        <FilterGroupComponent 
          v-else-if="filterConfig.type === 'hotelName'" 
          :title="filterConfig.title"
        >
          <TextInput
            :model-value="filtersStore.activeFilters.hotelName"
            placeholder="Название отеля"
            type="text"
            @update:model-value="onHotelNameChange"
          />
        </FilterGroupComponent>

        <!-- Мгновенное подтверждение -->
        <FilterGroupComponent 
          v-else-if="filterConfig.type === 'instantConfirmation'" 
          :title="filterConfig.title"
        >
          <ToggleSwitch
            v-model="filtersStore.activeFilters.isInstantConfirmation"
            :label="filterConfig.title"
            @update:model-value="() => { hapticFeedback('light'); applyFiltersToStore() }"
          />
        </FilterGroupComponent>

        <!-- Рейтинг по отзывам (RadioGroup) -->
        <FilterGroupComponent 
          v-else-if="filterConfig.type === 'radio' && filterConfig.data && filterConfig.data.length > 0 && filterConfig.radioOptions" 
          :title="filterConfig.title"
        >
          <RadioGroup
            v-if="filterConfig.storeKey === 'topHotels'"
            :model-value="filtersStore.activeFilters.topHotels ?? 4"
            :options="filterConfig.radioOptions"
            :name="filterConfig.key"
            @update:model-value="(val) => { filtersStore.activeFilters.topHotels = val as number; hapticFeedback('light'); applyFiltersToStore() }"
          />
        </FilterGroupComponent>

        <!-- Регионы и курорты (с вложенностью) -->
        <FilterGroupComponent 
          v-else-if="filterConfig.type === 'regions' && filterConfig.data && filterConfig.data.length > 0" 
          :title="filterConfig.title"
        >
          <template v-for="region in filterConfig.data" :key="region.id">
            <CheckboxInput
              v-model="selectedValues[filterConfig.key][region.id]"
              :label="`${region.localizedName} (${getRegionCount(region.id)})`"
              @update:model-value="applyFiltersToStore"
            />
            <!-- Вложенные города -->
            <template v-if="region.children && region.children.length > 0">
              <CheckboxInput
                v-for="city in region.children"
                :key="city.id"
                v-model="selectedValues[filterConfig.key][city.id]"
                :label="`  ${city.localizedName}`"
                @update:model-value="applyFiltersToStore"
              />
            </template>
            </template>
        </FilterGroupComponent>

        <!-- Остальные фильтры (CheckboxInput) -->
        <FilterGroupComponent 
          v-else-if="filterConfig.type === 'checkbox' && filterConfig.data && filterConfig.data.length > 0" 
          :title="filterConfig.title"
        >
          <CheckboxInput
            v-for="item in filterConfig.data"
            :key="item.id"
            v-model="selectedValues[filterConfig.key][item.id]"
            :label="getFilterLabel(item, filterConfig.key)"
            @update:model-value="applyFiltersToStore"
          />
        </FilterGroupComponent>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, reactive, onMounted } from 'vue'
import { useTelegram } from '@/composables/useTelegram'
import { useToast } from '@/composables/useToast'
import { useFiltersStore } from '@/stores/filters'
import { debounce } from '@/utils/helpers'
import type { Filters, FilterOption } from '@/types'
import FilterGroupComponent from '@/components/shared/FilterGroup.vue'
import CheckboxInput from '@/components/shared/CheckboxInput.vue'
import PriceRangeInput from '@/components/shared/PriceRangeInput.vue'
import TextInput from '@/components/shared/TextInput.vue'
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue'
import RadioGroup from '@/components/shared/RadioGroup.vue'

interface DynamicFilterConfig {
  key: string
  title: string
  type: 'popular' | 'price' | 'hotelName' | 'instantConfirmation' | 'radio' | 'regions' | 'checkbox'
  storeKey?: string
  paramName?: string
  data?: any[]
  radioOptions?: Array<{ value: string | number; label: string }>
  sortOrder: number
}

const { hapticFeedback } = useTelegram()
const { success } = useToast()
const filtersStore = useFiltersStore()

// Динамический объект для хранения выбранных значений
const selectedValues = reactive<Record<string, Record<string | number, boolean>>>({})

// Маппинг специальных фильтров (не FilterGroup)
const specialFiltersMap: Record<string, { type: DynamicFilterConfig['type'], storeKey?: string }> = {
  popularTypes: { type: 'popular', storeKey: 'popularTypes' },
  price: { type: 'price' },
  searchHotel: { type: 'hotelName', storeKey: 'hotelName' },
  regionsAndResorts: { type: 'regions', storeKey: 'regions' },
  isInstantConfirmation: { type: 'instantConfirmation', storeKey: 'isInstantConfirmation' },
  topHotels: { type: 'radio', storeKey: 'topHotels' }
}

// Маппинг storeKey для FilterGroup фильтров
const filterGroupStoreKeyMap: Record<string, string> = {
  categoryOfHotel: 'stars',
  mealTypes: 'meals'
}

// Формируем динамические фильтры на основе данных из API
const dynamicFilters = computed<DynamicFilterConfig[]>(() => {
  const filters: DynamicFilterConfig[] = []
  const apiFilters = filtersStore.apiFilters as Filters | null

  if (!apiFilters) return []

  // Проходим по всем ключам в apiFilters
  Object.keys(apiFilters).forEach((key) => {
    const filterValue = (apiFilters as any)[key]
    
    // Пропускаем служебные поля
    if (key === 'md5_id' || key === 'country' || key === 'enrichment') return

    // Обрабатываем специальные фильтры
    if (specialFiltersMap[key]) {
      const specialConfig = specialFiltersMap[key]
      
      if (key === 'popularTypes' && filterValue?.data?.length) {
        filters.push({
          key,
          title: filterValue.name_ru || 'Популярные фильтры',
          type: specialConfig.type,
          storeKey: specialConfig.storeKey,
          paramName: filterValue.paramName,
          data: filterValue.data,
          sortOrder: filterValue.sortOrder
        })
      } else if (key === 'price' && filterValue) {
        filters.push({
          key,
          title: filterValue.name_ru || 'Стоимость',
          type: specialConfig.type,
          sortOrder: filterValue.sortOrder
        })
      } else if (key === 'searchHotel' && filterValue) {
        filters.push({
          key: 'hotelName',
          title: filterValue.name_ru || 'Поиск отеля',
          type: specialConfig.type,
          storeKey: specialConfig.storeKey,
          paramName: filterValue.paramName,
          sortOrder: filterValue.sortOrder
        })
      } else if (key === 'regionsAndResorts' && filterValue?.data?.length) {
        filters.push({
          key: 'regions',
          title: filterValue.name_ru || 'Регионы и курорты',
          type: specialConfig.type,
          storeKey: specialConfig.storeKey,
          data: filterValue.data,
          sortOrder: filterValue.sortOrder
        })
      } else if (key === 'isInstantConfirmation' && filterValue) {
        filters.push({
          key,
          title: filterValue.name_ru || 'Подтверждение',
          type: specialConfig.type,
          storeKey: specialConfig.storeKey,
          paramName: filterValue.paramName,
          sortOrder: filterValue.sortOrder
        })
      } else if (key === 'topHotels' && filterValue?.data?.length) {
        filters.push({
          key,
          title: filterValue.name_ru || 'Рейтинг по отзывам',
          type: specialConfig.type,
          storeKey: specialConfig.storeKey,
          paramName: filterValue.paramName,
          data: filterValue.data,
          radioOptions: filterValue.data.map((item: FilterOption) => ({
            value: item.id,
            label: item.name_ru
          })),
          sortOrder: filterValue.sortOrder
        })
      }
    } 
    // Обрабатываем FilterGroup фильтры (автоматически)
    else if (filterValue && typeof filterValue === 'object' && filterValue.data && Array.isArray(filterValue.data) && filterValue.data.length > 0) {
      const storeKey = filterGroupStoreKeyMap[key] || key
      
      filters.push({
        key: storeKey,
        title: filterValue.name_ru || key,
        type: 'checkbox',
        storeKey,
        paramName: filterValue.paramName,
        data: filterValue.data,
        sortOrder: filterValue.sortOrder || 999
      })
    }
  })

  // Сортируем по sortOrder
  return filters.sort((a, b) => a.sortOrder - b.sortOrder)
})

// Инициализируем selectedValues для каждого фильтра
// Используем флаг, чтобы не сбрасывать значения при обновлении apiFilters после загрузки туров
let isInitialized = false
watch(
  () => filtersStore.apiFilters,
  (newFilters) => {
    if (!newFilters) return

    // Инициализируем для каждого фильтра только при первой загрузке
    if (!isInitialized) {
      dynamicFilters.value.forEach(filterConfig => {
        if (!selectedValues[filterConfig.key]) {
          selectedValues[filterConfig.key] = reactive({})
        }

        // Синхронизируем с store
        const storeValue = filtersStore.activeFilters[filterConfig.storeKey as keyof typeof filtersStore.activeFilters]
        if (Array.isArray(storeValue)) {
          storeValue.forEach((id: string | number) => {
            selectedValues[filterConfig.key][id] = true
          })
        }
      })
      isInitialized = true
    } else {
      // После инициализации только обновляем значения из store, не очищая их
      dynamicFilters.value.forEach(filterConfig => {
        if (!selectedValues[filterConfig.key]) {
          selectedValues[filterConfig.key] = reactive({})
        }

        // Синхронизируем с store - обновляем только те значения, которые есть в store
        const storeValue = filtersStore.activeFilters[filterConfig.storeKey as keyof typeof filtersStore.activeFilters]
        if (Array.isArray(storeValue)) {
          // Преобразуем storeValue в строки для сравнения
          const storeValueStrings = storeValue.map(v => String(v))
          // Очищаем только те значения, которых нет в store
          Object.keys(selectedValues[filterConfig.key]).forEach(id => {
            if (!storeValueStrings.includes(String(id))) {
              delete selectedValues[filterConfig.key][id]
            }
          })
          // Добавляем значения из store
          storeValue.forEach((id: string | number) => {
            selectedValues[filterConfig.key][id] = true
          })
        }
      })
    }
  },
  { immediate: true, deep: true }
)

// Синхронизируем selectedValues с store при монтировании
onMounted(() => {
  dynamicFilters.value.forEach(filterConfig => {
    if (!selectedValues[filterConfig.key]) {
      selectedValues[filterConfig.key] = reactive({})
    }

    const storeValue = filtersStore.activeFilters[filterConfig.storeKey as keyof typeof filtersStore.activeFilters]
    if (Array.isArray(storeValue)) {
      storeValue.forEach((id: string | number) => {
        selectedValues[filterConfig.key][id] = true
      })
    }
  })
})

const getFilterLabel = (item: FilterOption, filterKey: string): string => {
  // Специальная обработка для звезд
  if (filterKey === 'stars') {
    return item.name_ru === 'Без звезд' ? item.name_ru : `${item.name_ru} ★`
  }
  return item.name_ru
}

const getRegionCount = (_regionId: string) => {
  // TODO: Get actual count from API
  return 0
}

// Debounced функция для изменения цены (500ms задержка)
const debouncedPriceUpdate = debounce((value: { min: number; max: number }) => {
  filtersStore.activeFilters.priceRange = [value.min, value.max]
}, 500)

// Debounced функция для поиска отеля (300ms задержка)
const debouncedHotelNameUpdate = debounce((value: string) => {
  filtersStore.activeFilters.hotelName = value
}, 300)

const onPriceChange = (value: { min: number; max: number }) => {
  // haptic уже в PriceRangeInput
  debouncedPriceUpdate(value)
}

const onHotelNameChange = (value: string | number) => {
  hapticFeedback('light')
  debouncedHotelNameUpdate(String(value))
}

const applyFiltersToStore = () => {
  // Обновляем store на основе selectedValues
  dynamicFilters.value.forEach(filterConfig => {
    if (!filterConfig.storeKey) return

    const selected = Object.keys(selectedValues[filterConfig.key] || {})
      .filter(k => selectedValues[filterConfig.key][k])
      .map(k => {
        // Преобразуем в правильный тип
        if (filterConfig.key === 'stars' || filterConfig.key === 'meals') {
          return Number(k)
        }
        return k
      })

    // Обновляем store
    if (!filterConfig.storeKey) return
    
    const key = filterConfig.storeKey as keyof typeof filtersStore.activeFilters
    
    // Проверяем, существует ли это поле в activeFilters
    if (key in filtersStore.activeFilters) {
      const currentValue = filtersStore.activeFilters[key]
      
      // Если это массив, обновляем его
      if (Array.isArray(currentValue)) {
        // Для stars и meals преобразуем в числа
        if (key === 'stars' || key === 'meals') {
          (filtersStore.activeFilters as any)[key] = selected as number[]
        } else {
          // Для остальных массивов сохраняем как есть (string | number)[]
          (filtersStore.activeFilters as any)[key] = selected as (string | number)[]
        }
      }
    }
  })

  hapticFeedback('light')
}

const handleReset = () => {
  // Очищаем все selectedValues
  Object.keys(selectedValues).forEach(key => {
    Object.keys(selectedValues[key]).forEach(id => {
      delete selectedValues[key][id]
    })
  })

  // Сбрасываем store
  filtersStore.resetFilters()
  hapticFeedback('medium')

  // Показываем уведомление
  success('Фильтры сброшены', 2000)
}

// Emit event for closing filters on mobile
const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  hapticFeedback('light')
  emit('close')
}
</script>

<style lang="scss" module src="./SearchFilters.module.scss"></style>
