<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="isVisible"
        :class="[$style.toast, $style[`toast--${type}`]]"
        @click="hide"
      >
        <span :class="$style.toast__icon">{{ icon }}</span>
        <span :class="$style.toast__message">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  show: false
})

const emit = defineEmits<{
  hide: []
}>()

const isVisible = ref(props.show)
let timeoutId: NodeJS.Timeout | null = null

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '⚠'
    default:
      return 'ℹ'
  }
})

const hide = () => {
  isVisible.value = false
  emit('hide')
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    isVisible.value = true
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      hide()
    }, props.duration)
  } else {
    isVisible.value = false
  }
})
</script>

<script lang="ts">
import { computed } from 'vue'
</script>

<style lang="scss" module src="./Toast.module.scss"></style>

