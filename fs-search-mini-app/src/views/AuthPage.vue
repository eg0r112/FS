<template>
  <div :class="$style.auth">
    <div :class="$style.container">
      <div :class="$style.header">
        <h1 :class="$style.title">Авторизация</h1>
      </div>

      <AuthStep
        :on-success="handleAuthSuccess"
        :disabled="processing"
      />
      
      <div v-if="processing" :class="$style.loading">
        <p>Обработка бронирования...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'
import AuthStep from '@/components/AuthStep.vue'
import { signIn } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const { showBackButton, hideBackButton, hapticFeedback, showAlert } = useTelegram()

const processing = ref(false)

const handleAuthSuccess = async (data: { email: string; phone: string; password?: string }) => {
  processing.value = true
  hapticFeedback('medium')
  
  try {
    // Регистрация уже произошла в AuthStep.vue
    // Сохраняем данные пользователя
    sessionStorage.setItem('userEmail', data.email)
    sessionStorage.setItem('userPhone', data.phone)
    
    // В booking после sign-up-buyer-short делается accountSigIn для получения токена
    // Получаем токен авторизации, если есть password
    if (data.password) {
      try {
        const signInResponse = await signIn({
          email: data.email,
          password: data.password
        })
        
        if (signInResponse) {
          // Сохраняем токен для использования в запросах
          const authToken = `${signInResponse.token_type} ${signInResponse.access_token}`
          sessionStorage.setItem('authToken', authToken)
          sessionStorage.setItem('tokenType', signInResponse.token_type)
          sessionStorage.setItem('accessToken', signInResponse.access_token)
        }
      } catch (error) {
        // Если не удалось получить токен, продолжаем без него
        console.warn('Failed to get auth token, continuing without it:', error)
      }
    }
    
    hapticFeedback('success')
    
    // Переходим на страницу оплаты (аналог шага tourist в booking)
    const tourKey = route.params.tourKey as string
    const query = { ...route.query }
    
    router.push({
      name: 'Payment',
      params: { tourKey },
      query
    })
  } catch (error: any) {
    hapticFeedback('error')
    console.error('Booking error:', error)
    await showAlert(error.message || 'Ошибка при переходе на страницу оплаты. Попробуйте еще раз.')
    processing.value = false
  }
}

// Показываем кнопку "Назад" при монтировании
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  showBackButton(() => {
    router.back()
  })
})

onBeforeUnmount(() => {
  hideBackButton()
})
</script>

<style lang="scss" module src="./AuthPage.module.scss"></style>

