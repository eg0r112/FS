<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'
import { useToast } from '@/composables/useToast'
import Toast from '@/components/shared/Toast.vue'

// Инициализируем Telegram SDK и тема применится автоматически
// ВРЕМЕННО: isReady не используется для тестирования в браузере
useTelegram()
const { toasts, remove } = useToast()
</script>

<template>
  <div id="app">
    <Transition name="fade" mode="out-in">
      <!-- ВРЕМЕННО: Убрана проверка isReady для тестирования в браузере -->
      <RouterView />
      <!-- <RouterView v-if="isReady" />
      <div v-else class="app-loading">
        <div class="app-loading__spinner"></div>
      </div> -->
    </Transition>
    
    <!-- Toast notifications -->
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
      :show="true"
      @hide="remove(toast.id)"
    />
  </div>
</template>

<style lang="scss">
@use '@/assets/styles/global.scss';

.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;

  &__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid $light-border;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    body.theme-dark & {
      border-color: $dark-border;
      border-top-color: $color-primary;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
