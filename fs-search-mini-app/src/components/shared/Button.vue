<template>
  <button
    :class="[
      $style.button,
      $style[`button--${variant}`],
      $style[`button--${size}`],
      { [$style['button--fullWidth']]: fullWidth },
      { [$style['button--loading']]: loading },
      { [$style['button--icon-only']]: iconOnly }
    ]"
    :type="type"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" :class="$style.button__spinner"></span>
    <span v-if="icon && !loading" :class="$style.button__icon">{{ icon }}</span>
    <span v-if="!iconOnly" :class="$style.button__text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: string
  iconOnly?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
  iconOnly: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style lang="scss" module src="./Button.module.scss"></style>

