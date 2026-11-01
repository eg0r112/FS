<template>
  <div :class="$style.formGroup">
    <label v-if="label" :class="$style.label">
      {{ label }}
      <span v-if="required" :class="$style.required">*</span>
    </label>
    <div :class="$style.selectWrapper">
      <select
        :class="[$style.select, { [$style.error]: error }]"
        :value="modelValue"
        :disabled="disabled"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled selected>
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      <svg :class="$style.icon" width="12" height="8" viewBox="0 0 12 8" fill="none">
        <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <span v-if="error" :class="$style.errorText">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
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
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  valueKey: 'id',
  labelKey: 'name'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const { hapticFeedback } = useTelegram()

const getOptionValue = (option: any): string | number => {
  return typeof option === 'object' ? option[props.valueKey] : option
}

const getOptionLabel = (option: any): string => {
  return typeof option === 'object' ? option[props.labelKey] : String(option)
}

const onChange = (event: Event) => {
  hapticFeedback('light')
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<style lang="scss" module src="./SelectInput.module.scss"></style>

