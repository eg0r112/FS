import { createPinia } from 'pinia'

export const pinia = createPinia()

// Export all stores
export { useToursStore } from './tours'
export { useFiltersStore } from './filters'
export { useSearchStore } from './search'
export { useTourSearchStore } from './tourSearch'
export { useTourDetailsStore } from './tourDetails'

