<template>
  <div :class="$style.priceRange">
    <label v-if="label" :class="$style.label">{{ label }}</label>
    
    <!-- Values display - показываем локальные значения при drag -->
    <div :class="$style.values">
      <span :class="$style.value">{{ formatPrice(localValue.min) }} ₽</span>
      <span :class="$style.separator">—</span>
      <span :class="$style.value">{{ formatPrice(localValue.max) }} ₽</span>
    </div>
    
    <!-- Range slider -->
    <div :class="$style.sliderContainer">
      <input
        type="range"
        :class="$style.rangeMin"
        :min="min"
        :max="max"
        :value="localValue.min"
        @input="onMinInput"
        @change="onMinChange"
      />
      <input
        type="range"
        :class="$style.rangeMax"
        :min="min"
        :max="max"
        :value="localValue.max"
        @input="onMaxInput"
        @change="onMaxChange"
      />
      <div :class="$style.sliderTrack"></div>
      <div 
        :class="$style.sliderRange" 
        :style="rangeStyle"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTelegram } from '@/composables/useTelegram'
import { formatNumber } from '@/utils/helpers'

interface Props {
  modelValue: {
    min: number
    max: number
  }
  label?: string
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 10000000
})

const emit = defineEmits<{
  'update:modelValue': [value: { min: number; max: number }]
}>()

const { hapticFeedback } = useTelegram()

// Локальное состояние для визуального отображения при drag
const localValue = ref({ 
  min: props.modelValue.min, 
  max: props.modelValue.max 
})

// Синхронизируем localValue с props при изменении извне
watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = { min: newValue.min, max: newValue.max }
  },
  { deep: true }
)

// Стиль полоски - использует localValue для мгновенного обновления при drag
const rangeStyle = computed(() => {
  const minPercent = ((localValue.value.min - props.min) / (props.max - props.min)) * 100
  const maxPercent = ((localValue.value.max - props.min) / (props.max - props.min)) * 100
  
  return {
    left: `${minPercent}%`,
    width: `${maxPercent - minPercent}%`
  }
})

// Input handlers - обновляют только локальное состояние (полоска двигается)
const onMinInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)
  
  if (value < localValue.value.max) {
    localValue.value.min = value
  }
}

const onMaxInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)
  
  if (value > localValue.value.min) {
    localValue.value.max = value
  }
}

// Change handlers - emit'ят значения при отпускании ползунка
const onMinChange = () => {
  hapticFeedback('medium')
  emit('update:modelValue', { ...localValue.value })
}

const onMaxChange = () => {
  hapticFeedback('medium')
  emit('update:modelValue', { ...localValue.value })
}

const formatPrice = (price: number) => {
  return formatNumber(price)
}
</script>

<style lang="scss" module src="./PriceRangeInput.module.scss"></style>