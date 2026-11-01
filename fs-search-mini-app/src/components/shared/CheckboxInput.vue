<template>
  <div :class="$style.checkboxGroup">
    <label :class="$style.label">
      <input
        :class="$style.checkbox"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
      />
      <span :class="$style.checkmark">
        <svg v-if="modelValue" width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span :class="$style.text">{{ label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'

interface Props {
  modelValue: boolean
  label: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { hapticFeedback } = useTelegram()

const onChange = (event: Event) => {
  hapticFeedback('light')
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<style lang="scss" module src="./CheckboxInput.module.scss"></style>

