import { format as formatDateFns, parseISO, isValid, addDays as addDaysFns } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Форматирование цены в рубли
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

/**
 * Форматирование числа
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ru-RU')
}

/**
 * Форматирование даты
 */
export const formatDate = (date: string | Date, formatType: 'short' | 'long' = 'short'): string => {
  let d: Date
  
  if (typeof date === 'string') {
    try {
      d = parseISO(date)
      if (!isValid(d)) {
        d = new Date(date)
      }
    } catch {
      d = new Date(date)
    }
  } else {
    d = date
  }
  
  if (!isValid(d)) {
    return ''
  }
  
  if (formatType === 'short') {
    return formatDateFns(d, 'dd.MM.yyyy', { locale: ru })
  }
  
  return formatDateFns(d, 'd MMMM yyyy', { locale: ru })
}

/**
 * Склонение слов (например, "1 ночь", "2 ночи", "5 ночей")
 */
export const pluralize = (count: number, one: string, few: string, many: string): string => {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} ${one}`
  }
  
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} ${few}`
  }
  
  return `${count} ${many}`
}

/**
 * Вычисление скидки в процентах
 */
export const calculateDiscount = (oldPrice: number, newPrice: number): number => {
  if (oldPrice <= newPrice) return 0
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100)
}

/**
 * Генерация query string из объекта
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

/**
 * Дебаунс функции
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Проверка валидности даты
 */
export const isValidDate = (date: string): boolean => {
  try {
    const d = parseISO(date)
    return isValid(d)
  } catch {
    return false
  }
}

/**
 * Получение даты N дней вперед
 */
export const addDays = (date: Date | string, days: number): Date => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return addDaysFns(d, days)
}

/**
 * Форматирование даты для input type="date"
 */
export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDateFns(d, 'yyyy-MM-dd')
}

/**
 * Сокращение текста с добавлением "..."
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
