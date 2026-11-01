<template>
  <Teleport to="body">
    <div :class="$style.calendarPopup" v-if="show" @click.self="handleClose">
      <div :class="$style.popup" @click.stop>
      <!-- Header with flight types -->
      <div :class="$style.header">
        <div :class="$style.headerFlightTypes">
          <div 
            :class="[$style.headerFlightType, { [$style.selected]: selectedFlightType === 'all' }]"
            @click="selectFlightType('all')"
          >
            Все рейсы
          </div>
          <div 
            :class="[$style.headerFlightType, { [$style.selected]: selectedFlightType === 'charter' }]"
            @click="selectFlightType('charter')"
          >
            Только FUN&SUN
          </div>
          <div 
            :class="[$style.headerFlightType, { [$style.selected]: selectedFlightType === 'regular' }]"
            @click="selectFlightType('regular')"
          >
            Только регулярные
          </div>
        </div>
      </div>

      <!-- Body with months -->
      <div :class="$style.body" v-if="loading">
        <div :class="$style.loading">Загрузка дат...</div>
      </div>
      <div :class="$style.body" v-else-if="displayMonths.length === 0">
        <div :class="$style.empty">Нет доступных дат</div>
      </div>
      <div :class="$style.body" v-else>
        <div 
          v-for="month in displayMonths" 
          :key="`${month.year}-${month.month}`"
          :class="$style.month"
        >
          <!-- Month header -->
          <div :class="$style.monthHeader">
            <div :class="$style.monthHeaderName">
              {{ formatMonthName(month) }}
            </div>
          </div>

          <!-- Days of week -->
          <div :class="$style.daysOfWeek">
            <div 
              v-for="day in weekDays" 
              :key="day"
              :class="$style.daysOfWeekCell"
            >
              {{ day }}
            </div>
          </div>

          <!-- Dates grid -->
          <div :class="$style.dates">
            <div 
              v-for="(day, dayIndex) in month.days" 
              :key="dayIndex"
              :class="$style.dateCell"
            >
              <div
                v-if="day.date"
                :class="[
                  $style.dateCase,
                  {
                    [$style.available]: day.available,
                    [$style.selected]: day.date === selectedStartDate || day.date === selectedEndDate,
                    [$style.inRange]: day.inRange,
                    [$style.pastDay]: day.pastDay,
                    [$style.charter]: day.isCharter,
                    [$style.regular]: day.isRegular && !day.isCharter,
                    [$style.empty]: !day.date,
                    [$style.hidden]: !day.available && !day.pastDay && day.date
                  }
                ]"
                @click="selectDate(day.date, day.available)"
              >
                <span>{{ day.number }}</span>
              </div>
              <div 
                v-else
                :class="[$style.dateCase, $style.empty]"
              >
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div :class="$style.footer">
        <div :class="$style.footerFlight">
          <div :class="$style.footerFlightFunsun">
            Рейсы FUN&SUN
          </div>
          <div :class="$style.footerFlightRegular">
            Регулярные рейсы
          </div>
        </div>
        <button 
          :class="$style.footerButton"
          @click="handleChoose"
          :disabled="!selectedStartDate"
        >
          Готово
        </button>
      </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format, parseISO, addDays, isValid } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useTelegram } from '@/composables/useTelegram'
import type { CheckinMonth } from '@/api/fields'

// Интерфейс для отображаемого дня в календаре
interface DisplayDay {
  date: string | null
  number: number | null
  available: boolean
  pastDay: boolean
  isCharter: boolean
  isRegular: boolean
  inRange: boolean // Находится ли дата в выбранном диапазоне
}

// Интерфейс для отображаемого месяца
interface DisplayMonth {
  year: string
  month: string
  first_date: string
  days: DisplayDay[]
}

interface Props {
  modelValue: string // Текущая выбранная дата (начало диапазона)
  show: boolean
  checkinMonths: CheckinMonth[]
  loading?: boolean
}

// Состояние для выбора диапазона
const selectedStartDate = ref<string | null>(null)
const selectedEndDate = ref<string | null>(null)
const MAX_RANGE_DAYS = 4

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:show', value: boolean): void
  (e: 'change', startDate: string, endDate?: string): void
}>()

const { hapticFeedback } = useTelegram()

const selectedFlightType = ref<'all' | 'charter' | 'regular'>('all')

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Форматирование названия месяца - используем данные из API
const formatMonthName = (month: DisplayMonth | CheckinMonth) => {
  // Используем month и year из API напрямую
  if (month.month && month.year) {
    // Преобразуем название месяца в правильный формат
    const monthName = month.month.charAt(0).toUpperCase() + month.month.slice(1)
    return `${monthName} ${month.year}`
  }
  // Fallback на парсинг first_date
  try {
    const date = parseISO(month.first_date)
    return format(date, 'LLLL yyyy', { locale: ru })
  } catch {
    return `${month.month} ${month.year}`
  }
}

// Инициализация выбранных дат из modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedStartDate.value = newValue
    // Если есть endDate в props, инициализируем его тоже
    // Но пока endDate не передается через props, оставляем null
    if (!selectedEndDate.value) {
      selectedEndDate.value = null
    }
  }
}, { immediate: true })

// Функция для нормализации даты к формату YYYY-MM-DD
const normalizeDate = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null
  
  // Если дата уже в формате YYYY-MM-DD, возвращаем как есть
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  // Пытаемся распарсить ISO дату и преобразовать в YYYY-MM-DD
  try {
    const parsed = parseISO(dateStr)
    if (isValid(parsed)) {
      return format(parsed, 'yyyy-MM-dd')
    }
  } catch (e) {
    console.warn('Failed to parse date:', dateStr, e)
  }
  
  // Если не удалось распарсить, возвращаем как есть (fallback)
  return dateStr
}

// Сброс выбранных дат при закрытии попапа
watch(() => props.show, (isShow) => {
  if (!isShow) {
    // Не сбрасываем, чтобы сохранить выбор при повторном открытии
    // selectedStartDate.value = null
    // selectedEndDate.value = null
  } else if (props.modelValue) {
    // При открытии инициализируем из modelValue, нормализуем дату
    selectedStartDate.value = normalizeDate(props.modelValue) || null
    selectedEndDate.value = null
  }
})

// Обработка данных месяцев для отображения - используем данные из API напрямую
const displayMonths = computed((): DisplayMonth[] => {
  if (!props.checkinMonths || props.checkinMonths.length === 0) {
    return []
  }

  return props.checkinMonths.map(month => {
    // Используем все дни из API напрямую, включая пустые
    const processedDays = month.days.map(apiDay => {
      // Пустые дни (number: 0, is_nullable: true)
      if (apiDay.number === 0 || apiDay.is_nullable) {
        return {
          date: null,
          number: null,
          available: false,
          pastDay: false,
          isCharter: false,
          isRegular: false,
          inRange: false
        }
      }

      // Реальные дни с данными
      let dateFromApi = ''
      
      // Если checkin заполнен, используем его
      if (apiDay.checkin && apiDay.checkin.trim() !== '') {
        try {
          const checkinDate = parseISO(apiDay.checkin)
          dateFromApi = format(checkinDate, 'yyyy-MM-dd')
        } catch {
          // Если не удалось распарсить, используем iso
          if (apiDay.iso && apiDay.iso.trim() !== '') {
            const normalized = normalizeDate(apiDay.iso)
            dateFromApi = normalized || apiDay.iso
          } else {
            // Формируем дату из first_date и number
            const dayDate = parseISO(month.first_date)
            const targetDate = addDays(dayDate, apiDay.number - 1)
            dateFromApi = format(targetDate, 'yyyy-MM-dd')
          }
        }
      } else if (apiDay.iso && apiDay.iso.trim() !== '') {
        // Используем iso если checkin пустой, нормализуем к YYYY-MM-DD
        const normalized = normalizeDate(apiDay.iso)
        dateFromApi = normalized || apiDay.iso
      } else {
        // Формируем дату из first_date и number
        const dayDate = parseISO(month.first_date)
        const targetDate = addDays(dayDate, apiDay.number - 1)
        dateFromApi = format(targetDate, 'yyyy-MM-dd')
      }
      
      // Определяем доступность в зависимости от выбранного типа рейса
      let available = false
      if (selectedFlightType.value === 'all') {
        available = apiDay.isCharter || apiDay.isRegular
      } else if (selectedFlightType.value === 'charter') {
        available = apiDay.isCharter
      } else if (selectedFlightType.value === 'regular') {
        available = apiDay.isRegular
      }
      
      // Проверяем, находится ли дата в выбранном диапазоне
      const inRange = isDateInRange(dateFromApi)
      
      return {
        date: dateFromApi,
        number: apiDay.number,
        available: available && !apiDay.pastDay,
        pastDay: apiDay.pastDay,
        isCharter: apiDay.isCharter,
        isRegular: apiDay.isRegular,
        inRange
      }
    })

    return {
      year: month.year,
      month: month.month,
      first_date: month.first_date,
      days: processedDays
    } as DisplayMonth
  })
})

// Проверка, находится ли дата в выбранном диапазоне
const isDateInRange = (date: string | null): boolean => {
  if (!date || !selectedStartDate.value) return false
  if (!selectedEndDate.value) {
    return date === selectedStartDate.value
  }
  
  const dateObj = parseISO(date)
  const startObj = parseISO(selectedStartDate.value)
  const endObj = parseISO(selectedEndDate.value)
  
  return dateObj >= startObj && dateObj <= endObj
}

// Фильтрация по типу рейса - computed автоматически пересчитывается при изменении selectedFlightType

const selectFlightType = (type: 'all' | 'charter' | 'regular') => {
  hapticFeedback('light')
  selectedFlightType.value = type
}

const selectDate = (date: string | null, available: boolean) => {
  if (!date || !available) {
    hapticFeedback('error')
    return
  }
  
  hapticFeedback('light')
  
  // Нормализуем дату к формату YYYY-MM-DD
  const normalizedDate = normalizeDate(date)
  if (!normalizedDate) return
  
  // Если нет выбранной начальной даты
  if (!selectedStartDate.value) {
    // Начинаем новый выбор - устанавливаем начальную дату
    selectedStartDate.value = normalizedDate
    selectedEndDate.value = null
  } else if (selectedStartDate.value && !selectedEndDate.value) {
    // Уже есть начальная дата, выбираем конечную дату диапазона
    const startDate = parseISO(selectedStartDate.value)
    const endDate = parseISO(normalizedDate)
    const diffDays = Math.abs(Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    
    if (diffDays > MAX_RANGE_DAYS) {
      // Если диапазон больше 4 дней, начинаем новый выбор с этой даты
      selectedStartDate.value = normalizedDate
      selectedEndDate.value = null
    } else if (normalizedDate === selectedStartDate.value) {
      // Если кликнули на ту же дату, сбрасываем выбор
      selectedStartDate.value = null
      selectedEndDate.value = null
    } else {
      // Устанавливаем диапазон
      if (endDate < startDate) {
        // Если конечная дата раньше начальной, меняем местами
        selectedEndDate.value = selectedStartDate.value
        selectedStartDate.value = normalizedDate
      } else {
        selectedEndDate.value = normalizedDate
      }
    }
  } else {
    // Если обе даты выбраны, начинаем новый выбор
    selectedStartDate.value = normalizedDate
    selectedEndDate.value = null
  }
}


const handleClose = () => {
  hapticFeedback('light')
  emit('update:show', false)
}

const handleChoose = () => {
  if (selectedStartDate.value) {
    hapticFeedback('medium')
    // Сохраняем начальную дату (или диапазон, если выбран)
    emit('update:modelValue', selectedStartDate.value)
    emit('change', selectedStartDate.value, selectedEndDate.value || undefined)
    emit('update:show', false)
  }
}
</script>

<style lang="scss" module src="./CalendarPopup.module.scss"></style>

