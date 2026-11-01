<template>
  <div :class="$style.sort" data-sort-component>
    <button 
      :class="[$style.sortButton, { [$style.sortButtonActive]: isOpen }]"
      @click="toggleSort"
      :disabled="disabled"
    >
      <span :class="$style.sortButtonText">{{ currentSortLabel }}</span>
      <span :class="[$style.sortButtonIcon, { [$style.sortButtonIconOpen]: isOpen }]">▼</span>
    </button>
    
    <Transition name="fade">
      <div v-if="isOpen" :class="$style.sortDropdown">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          :class="[$style.sortOption, { [$style.sortOptionActive]: currentSort === option.value }]"
          @click="selectSort(option.value)"
        >
          {{ option.label }}
          <span v-if="currentSort === option.value" :class="$style.sortOptionCheck">✓</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTelegram } from '@/composables/useTelegram'

interface SortOption {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'recommendations_FS',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { hapticFeedback } = useTelegram()

const isOpen = ref(false)

// Опции сортировки как в booking
const sortOptions: SortOption[] = [
  {
    value: 'recommendations_FS',
    label: 'FUN&SUN рекомендует'
  },
  {
    value: 'min',
    label: 'По возрастанию цены'
  },
  {
    value: 'max',
    label: 'По убыванию цены'
  },
  {
    value: 'rating',
    label: 'По рейтингу'
  }
]

const currentSort = computed(() => props.modelValue || 'recommendations_FS')

const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.value === currentSort.value)
  return option?.label || 'FUN&SUN рекомендует'
})

const toggleSort = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  hapticFeedback('light')
}

const selectSort = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
  hapticFeedback('medium')
}

// Закрываем при клике вне компонента
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const sortElement = document.querySelector('[data-sort-component]')
  if (sortElement && !sortElement.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" module src="./TourSort.module.scss"></style>

