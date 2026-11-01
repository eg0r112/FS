<template>
  <div :class="$style.tourists">
    <label v-if="label" :class="$style.label">{{ label }}</label>
    
    <div :class="$style.counters">
      <!-- Взрослые -->
      <div :class="$style.counterGroup">
        <label :class="$style.counterLabel">Взрослых</label>
        <div :class="$style.counter">
          <button
            type="button"
            :class="$style.counterBtn"
            :disabled="adults <= minAdults || disabled"
            @click="decrementAdults"
          >
            −
          </button>
          <span :class="$style.counterValue">{{ adults }}</span>
          <button
            type="button"
            :class="$style.counterBtn"
            :disabled="adults >= maxAdults || disabled"
            @click="incrementAdults"
          >
            +
          </button>
        </div>
      </div>

      <!-- Дети -->
      <div :class="$style.counterGroup">
        <label :class="$style.counterLabel">Детей</label>
        <div :class="$style.counter">
          <button
            type="button"
            :class="$style.counterBtn"
            :disabled="childrenAges.length <= 0 || disabled"
            @click="removeChild"
          >
            −
          </button>
          <span :class="$style.counterValue">{{ childrenAges.length }}</span>
          <button
            type="button"
            :class="$style.counterBtn"
            :disabled="childrenAges.length >= maxChildren || disabled"
            @click="addChild"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <!-- Возрасты детей -->
    <div v-if="childrenAges.length > 0" :class="$style.childrenAges">
      <div 
        v-for="(age, index) in childrenAges" 
        :key="index"
        :class="$style.childAge"
      >
        <CustomSelect
          :model-value="age"
          :label="`Ребёнок ${index + 1}`"
          :options="ageOptions"
          :disabled="disabled"
          value-key="value"
          label-key="label"
          placeholder="Возраст"
          @update:model-value="(value) => updateChildAge(index, value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTelegram } from '@/composables/useTelegram'
import CustomSelect from '@/components/shared/CustomSelect.vue'

interface Props {
  adults: number
  childrenAges: string[]
  label?: string
  minAdults?: number
  maxAdults?: number
  maxChildren?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Кто едет',
  minAdults: 1,
  maxAdults: 6,
  maxChildren: 4,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:adults', value: number): void
  (e: 'update:childrenAges', value: string[]): void
}>()

const { hapticFeedback } = useTelegram()

// Возрасты от 1 до 17
// Возраст 2 показываем в списке, но при выборе передаём как 1 (младенцы)
const ageOptions = computed(() => {
  const ages: { value: string; label: string }[] = []
  for (let i = 1; i <= 17; i++) {
    ages.push({
      value: i.toString(),
      label: `${i} ${pluralizeYears(i)}`
    })
  }
  return ages
})

const pluralizeYears = (age: number): string => {
  const mod10 = age % 10
  const mod100 = age % 100
  
  if (mod10 === 1 && mod100 !== 11) return 'год'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'года'
  return 'лет'
}

const incrementAdults = () => {
  if (props.adults < props.maxAdults) {
    hapticFeedback('light')
    emit('update:adults', props.adults + 1)
  }
}

const decrementAdults = () => {
  if (props.adults > props.minAdults) {
    hapticFeedback('light')
    emit('update:adults', props.adults - 1)
  }
}

const addChild = () => {
  if (props.childrenAges.length < props.maxChildren) {
    hapticFeedback('light')
    // Добавляем ребёнка с возрастом 7 по умолчанию
    emit('update:childrenAges', [...props.childrenAges, '7'])
  }
}

const removeChild = () => {
  if (props.childrenAges.length > 0) {
    hapticFeedback('light')
    // Удаляем последнего ребёнка
    emit('update:childrenAges', props.childrenAges.slice(0, -1))
  }
}

const updateChildAge = (index: number, age: string | number) => {
  hapticFeedback('light')
  const newAges = [...props.childrenAges]
  // Если выбрано 2 года, передаём как 1 (младенцы до 2 лет)
  const ageValue = age.toString() === '2' ? '1' : age.toString()
  newAges[index] = ageValue
  emit('update:childrenAges', newAges)
}
</script>

<style lang="scss" module src="./TouristsCounter.module.scss"></style>
