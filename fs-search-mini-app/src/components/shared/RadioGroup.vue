<template>
  <div :class="$style.radioGroup">
    <label
      v-for="option in options"
      :key="option.value"
      :class="$style.radio"
    >
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        :disabled="disabled"
        @change="onChange(option.value)"
        :class="$style.input"
      />
      <span :class="$style.checkmark"></span>
      <span :class="$style.label">{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'

interface RadioOption {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number
  options: RadioOption[]
  name: string
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const { hapticFeedback } = useTelegram()

const onChange = (value: string | number) => {
  hapticFeedback('light')
  emit('update:modelValue', value)
}
</script>

<style lang="scss" module src="./RadioGroup.module.scss"></style>

