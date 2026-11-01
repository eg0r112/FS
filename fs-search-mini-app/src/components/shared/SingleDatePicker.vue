<template>
  <Teleport to="body">
    <div :class="$style.overlay" v-if="show" @click.self="handleClose">
      <div :class="$style.popup" @click.stop>
        <!-- Header -->
        <div :class="$style.header">
          <h3 :class="$style.title">Выберите дату</h3>
          <button :class="$style.closeBtn" @click="handleClose">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
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
              {{ formatMonthName(month) }}
            </div>

            <!-- Days of week -->
            <div :class="$style.daysOfWeek">
              <div 
                v-for="day in weekDays" 
                :key="day"
                :class="$style.dayOfWeek"
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
                    $style.dateDay,
                    {
                      [$style.available]: day.available,
                      [$style.selected]: day.date === selectedDate,
                      [$style.pastDay]: day.pastDay,
                      [$style.empty]: !day.date
                    }
                  ]"
                  @click="selectDate(day.date, day.available)"
                >
                  <span>{{ day.number }}</span>
                </div>
                <div 
                  v-else
                  :class="[$style.dateDay, $style.empty]"
                >
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div :class="$style.footer">
          <button 
            :class="$style.confirmBtn"
            @click="handleConfirm"
            :disabled="!selectedDate"
          >
            Выбрать
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
import { getAvailableCheckins, type CheckinMonth } from '@/api/fields'

interface DisplayDay {
  date: string | null
  number: number | null
  available: boolean
  pastDay: boolean
}

interface DisplayMonth {
  year: string
  month: string
  first_date: string
  days: DisplayDay[]
}

interface Props {
  modelValue: string
  show: boolean
  hotelId?: string
  departureCityId: number
  arrivalCountryId: number
  adults?: number
}

const props = withDefaults(defineProps<Props>(), {
  adults: 2
})

// Внутреннее состояние для загрузки дат
const checkinMonths = ref<CheckinMonth[]>([])
const loading = ref(false)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:show', value: boolean): void
  (e: 'change', date: string): void
}>()

const { hapticFeedback } = useTelegram()

const selectedDate = ref<string | null>(null)
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Нормализация даты к формату YYYY-MM-DD (определяем ПЕРЕД watch)
const normalizeDate = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  try {
    const parsed = parseISO(dateStr)
    if (isValid(parsed)) {
      return format(parsed, 'yyyy-MM-dd')
    }
  } catch (e) {
    console.warn('Failed to parse date:', dateStr, e)
  }
  
  return dateStr
}

// Форматирование названия месяца
const formatMonthName = (month: DisplayMonth) => {
  if (month.month && month.year) {
    const monthName = month.month.charAt(0).toUpperCase() + month.month.slice(1)
    return `${monthName} ${month.year}`
  }
  try {
    const date = parseISO(month.first_date)
    return format(date, 'LLLL yyyy', { locale: ru })
  } catch {
    return `${month.month} ${month.year}`
  }
}

// Инициализация выбранной даты
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedDate.value = normalizeDate(newValue)
  }
}, { immediate: true })

// Сброс при открытии и загрузка дат
watch(() => props.show, async (isShow) => {
  if (isShow) {
    if (props.modelValue) {
      selectedDate.value = normalizeDate(props.modelValue)
    }
    // Загружаем даты при открытии, если ещё не загружены
    if (checkinMonths.value.length === 0) {
      await loadCheckinMonths()
    }
  }
})

// Загрузка доступных дат из API
const loadCheckinMonths = async () => {
  if (!props.departureCityId || !props.arrivalCountryId) {
    console.warn('❌ Не указаны departureCityId или arrivalCountryId для загрузки дат')
    return
  }
  
  loading.value = true
  try {
    const months = await getAvailableCheckins(
      props.arrivalCountryId,
      props.departureCityId,
      props.adults,
      undefined, // isResirvation
      props.hotelId // hotelIds
    )
    checkinMonths.value = months
    console.log('📅 SingleDatePicker: Загружены даты для календаря:', months.length, 'месяцев')
  } catch (error) {
    console.error('❌ Ошибка загрузки дат:', error)
  } finally {
    loading.value = false
  }
}

// Обработка данных месяцев для отображения
const displayMonths = computed((): DisplayMonth[] => {
  if (!checkinMonths.value || checkinMonths.value.length === 0) {
    return []
  }

  return checkinMonths.value.map(month => {
    const processedDays = month.days.map(apiDay => {
      // Пустые дни
      if (apiDay.number === 0 || apiDay.is_nullable) {
        return {
          date: null,
          number: null,
          available: false,
          pastDay: false
        }
      }

      let dateFromApi = ''
      
      if (apiDay.checkin && apiDay.checkin.trim() !== '') {
        try {
          const checkinDate = parseISO(apiDay.checkin)
          dateFromApi = format(checkinDate, 'yyyy-MM-dd')
        } catch {
          if (apiDay.iso && apiDay.iso.trim() !== '') {
            const normalized = normalizeDate(apiDay.iso)
            dateFromApi = normalized || apiDay.iso
          } else {
            const dayDate = parseISO(month.first_date)
            const targetDate = addDays(dayDate, apiDay.number - 1)
            dateFromApi = format(targetDate, 'yyyy-MM-dd')
          }
        }
      } else if (apiDay.iso && apiDay.iso.trim() !== '') {
        const normalized = normalizeDate(apiDay.iso)
        dateFromApi = normalized || apiDay.iso
      } else {
        const dayDate = parseISO(month.first_date)
        const targetDate = addDays(dayDate, apiDay.number - 1)
        dateFromApi = format(targetDate, 'yyyy-MM-dd')
      }
      
      // Доступность - любой тип рейса
      const available = (apiDay.isCharter || apiDay.isRegular) && !apiDay.pastDay
      
      return {
        date: dateFromApi,
        number: apiDay.number,
        available,
        pastDay: apiDay.pastDay
      }
    })

    return {
      year: month.year,
      month: month.month,
      first_date: month.first_date,
      days: processedDays
    }
  })
})

const selectDate = (date: string | null, available: boolean) => {
  if (!date || !available) {
    hapticFeedback('error')
    return
  }
  
  hapticFeedback('light')
  
  const normalizedDate = normalizeDate(date)
  if (!normalizedDate) return
  
  selectedDate.value = normalizedDate
}

const handleClose = () => {
  hapticFeedback('light')
  emit('update:show', false)
}

const handleConfirm = () => {
  if (selectedDate.value) {
    hapticFeedback('medium')
    emit('update:modelValue', selectedDate.value)
    emit('change', selectedDate.value)
    emit('update:show', false)
  }
}
</script>

<style lang="scss" module src="./SingleDatePicker.module.scss"></style>

