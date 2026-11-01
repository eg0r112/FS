<template>
  <div :class="$style.toggle">
    <span :class="$style.label">{{ label }}</span>
    <label :class="$style.switch">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
        :class="$style.input"
      />
      <span :class="$style.slider"></span>
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

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { hapticFeedback } = useTelegram()

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  hapticFeedback('light')
  emit('update:modelValue', target.checked)
}
</script>

<style lang="scss" module src="./ToggleSwitch.module.scss"></style>

