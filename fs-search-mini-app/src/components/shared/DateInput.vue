<template>
  <div :class="$style.dateInput">
    <label v-if="label" :class="$style.label">
      {{ label }}
      <span v-if="required" :class="$style.required">*</span>
    </label>
    <input
      :value="modelValue ?? ''"
      type="date"
      :class="$style.input"
      :required="required"
      :min="min"
      :max="max"
      :disabled="disabled"
      @input="handleInput"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'

interface Props {
  modelValue: string | undefined
  label?: string
  required?: boolean
  min?: string
  max?: string
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const { hapticFeedback } = useTelegram()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  hapticFeedback('light')
  emit('change', target.value)
}
</script>

<style lang="scss" module src="./DateInput.module.scss"></style>

