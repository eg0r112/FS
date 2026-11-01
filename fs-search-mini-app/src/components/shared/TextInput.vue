<template>
  <div :class="$style.formGroup">
    <label v-if="label" :class="$style.label">
      {{ label }}
      <span v-if="required" :class="$style.required">*</span>
    </label>
    <input
      :class="[$style.input, { [$style.error]: error }]"
      :type="type"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="onInput"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    />
    <span v-if="error" :class="$style.errorText">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'

interface Props {
  modelValue: string | number | undefined
  label?: string
  placeholder?: string
  type?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
  'focus': []
}>()

const { hapticFeedback } = useTelegram()

const onInput = (event: Event) => {
  hapticFeedback('light')
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<style lang="scss" module src="./TextInput.module.scss"></style>

