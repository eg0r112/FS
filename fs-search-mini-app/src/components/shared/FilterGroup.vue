<template>
  <div :class="$style.filterGroup">
    <div :class="$style.header" @click="toggle">
      <h4 :class="$style.title">{{ title }}</h4>
      <span :class="[$style.arrow, { [$style.arrowOpen]: isOpen }]">▼</span>
    </div>
    
    <div v-if="isOpen" :class="$style.body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true
})

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<style lang="scss" module src="./FilterGroup.module.scss"></style>

