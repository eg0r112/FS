<template>
  <div :class="$style.formGroup">
    <label v-if="label" :class="$style.label">
      {{ label }}
      <span v-if="required" :class="$style.required">*</span>
    </label>
    <div :class="$style.selectWrapper">
      <div
        :class="[$style.select, { [$style.error]: error, [$style.disabled]: disabled, [$style.open]: isOpen }]"
        @click="toggleDropdown"
        ref="selectRef"
      >
        <span :class="$style.selectValue">
          {{ selectedLabel || placeholder }}
        </span>
        <svg :class="$style.icon" width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <Transition name="dropdown">
        <div v-if="isOpen" :class="$style.dropdown" ref="dropdownRef" @click.stop>
          <!-- Header with visa filter -->
          <div :class="$style.header">
            <div :class="$style.headerRight">
              <span :class="$style.headerText">Без визы</span>
              <div :class="$style.checkboxWrapper" @click.stop>
                <input
                  :id="`checkbox-not-visa-${uniqueId}`"
                  type="checkbox"
                  :checked="showOnlyNoVisa"
                  @change="toggleVisaFilter"
                  @click.stop
                  :class="$style.checkbox"
                />
                <label :for="`checkbox-not-visa-${uniqueId}`" :class="$style.checkboxLabel" @click.stop></label>
              </div>
            </div>
          </div>
          
          <!-- Body with countries -->
          <div :class="$style.body">
            <div :class="$style.bodyTitle">ОТКРЫТЫЕ СТРАНЫ</div>
            <div :class="$style.bodyContent">
              <div
                v-for="country in filteredCountries"
                :key="getOptionValue(country)"
                :class="[$style.countryItem, { [$style.selected]: isSelected(country) }]"
                @click="selectCountry(country)"
              >
                <div :class="$style.countryName">
                  {{ getOptionLabel(country) }}
                </div>
                <div
                  v-if="!country.isVisaRequired"
                  :class="$style.countryVisaNo"
                >
                  Виза не нужна
                </div>
                <div
                  v-else
                  :class="$style.countryVisaYes"
                >
                  Нужна виза
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <span v-if="error" :class="$style.errorText">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTelegram } from '@/composables/useTelegram'
import type { ArrivalCountry } from '@/api/fields'

interface Props {
  modelValue: string | number | null
  options: ArrivalCountry[]
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  valueKey?: string
  labelKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  valueKey: 'ebgNodeId',
  labelKey: 'localizedName'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const { hapticFeedback } = useTelegram()

const isOpen = ref(false)
const showOnlyNoVisa = ref(false)
const uniqueId = ref(Math.random().toString(36).substr(2, 9))

const getOptionValue = (option: ArrivalCountry): string | number => {
  return option[props.valueKey as keyof ArrivalCountry] as string | number
}

const getOptionLabel = (option: ArrivalCountry): string => {
  return option[props.labelKey as keyof ArrivalCountry] as string
}

const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  const selected = props.options.find(opt => getOptionValue(opt) == props.modelValue)
  return selected ? getOptionLabel(selected) : ''
})

const isSelected = (option: ArrivalCountry): boolean => {
  return getOptionValue(option) == props.modelValue
}

const filteredCountries = computed(() => {
  if (showOnlyNoVisa.value) {
    return props.options.filter(country => !country.isVisaRequired)
  }
  return props.options
})

const toggleDropdown = () => {
  if (props.disabled) return
  hapticFeedback('light')
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const toggleVisaFilter = (event: Event) => {
  hapticFeedback('light')
  showOnlyNoVisa.value = (event.target as HTMLInputElement).checked
}

const selectCountry = (country: ArrivalCountry) => {
  hapticFeedback('light')
  const value = getOptionValue(country)
  emit('update:modelValue', value)
  closeDropdown()
}

const selectRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: Event) => {
  const target = event.target as Node
  if (
    selectRef.value && 
    !selectRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" module src="./CountrySelect.module.scss"></style>

