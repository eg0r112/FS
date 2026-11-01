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
        <div v-if="isOpen" :class="$style.dropdown">
          <div :class="$style.dropdownContent">
            <div
              v-for="option in options"
              :key="getOptionValue(option)"
              :class="[$style.option, { [$style.selected]: isSelected(option) }]"
              @click="selectOption(option)"
            >
              {{ getOptionLabel(option) }}
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

interface Props {
  modelValue: string | number | null
  options: Array<any>
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  valueKey?: string
  labelKey?: string
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  valueKey: 'id',
  labelKey: 'name',
  maxVisible: 5
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const { hapticFeedback } = useTelegram()

const isOpen = ref(false)

const getOptionValue = (option: any): string | number => {
  return typeof option === 'object' ? option[props.valueKey] : option
}

const getOptionLabel = (option: any): string => {
  return typeof option === 'object' ? option[props.labelKey] : String(option)
}

const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  const selected = props.options.find(opt => getOptionValue(opt) == props.modelValue)
  return selected ? getOptionLabel(selected) : ''
})

const isSelected = (option: any): boolean => {
  return getOptionValue(option) == props.modelValue
}

const toggleDropdown = () => {
  if (props.disabled) return
  hapticFeedback('light')
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectOption = (option: any) => {
  hapticFeedback('light')
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  closeDropdown()
}

const selectRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: Event) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
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

<style lang="scss" module src="./CustomSelect.module.scss"></style>

