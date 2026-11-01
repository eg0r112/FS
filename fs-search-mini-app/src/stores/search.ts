import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SearchParams {
  from: string
  to: string
  date: string
  endDate?: string // Конечная дата диапазона (максимум 4 дня от date)
  nights: number
  adults: number
  childrenAges: string[] // Массив возрастов детей ["3", "7", "12"]
  fromId?: number
  toId?: number
}

export const useSearchStore = defineStore('search', () => {
  // State
  const searchParams = ref<SearchParams>({
    from: '',
    to: '',
    date: '',
    endDate: undefined,
    nights: 7,
    adults: 2,
    childrenAges: []
  })
  
  const lastSearchTime = ref<Date | null>(null)

  // Actions
  function setSearchParams(params: Partial<SearchParams>) {
    searchParams.value = {
      ...searchParams.value,
      ...params
    }
    lastSearchTime.value = new Date()
  }

  function saveToSessionStorage() {
    try {
      sessionStorage.setItem('searchParams', JSON.stringify(searchParams.value))
    } catch (e) {
      console.error('Failed to save search params:', e)
    }
  }

  function loadFromSessionStorage() {
    try {
      const saved = sessionStorage.getItem('searchParams')
      if (saved) {
        searchParams.value = JSON.parse(saved)
        return true
      }
    } catch (e) {
      console.error('Failed to load search params:', e)
    }
    return false
  }

  function clearSearchParams() {
    searchParams.value = {
      from: '',
      to: '',
      date: '',
      endDate: undefined,
      nights: 7,
      adults: 2,
      childrenAges: []
    }
    lastSearchTime.value = null
    sessionStorage.removeItem('searchParams')
  }

  function $reset() {
    clearSearchParams()
  }

  return {
    // State
    searchParams,
    lastSearchTime,
    
    // Actions
    setSearchParams,
    saveToSessionStorage,
    loadFromSessionStorage,
    clearSearchParams,
    $reset
  }
})

