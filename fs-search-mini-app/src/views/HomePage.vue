<template>
  <div :class="$style['home-page']">
    <div :class="$style['home-page__background']">
      <div :class="$style['home-page__gradient']"></div>
    </div>
    
    <div :class="$style['home-page__content']">
      <div :class="$style['home-page__header']">
        <img src="/logo.svg" alt="FUN&SUN" :class="$style['home-page__logo']" />
        <h1 :class="$style['home-page__title']">Найдите свой идеальный тур</h1>
        <p :class="$style['home-page__subtitle']">
          ✈️ Тысячи отелей по всему миру 🌴
        </p>
      </div>

      <div :class="$style['home-page__form']">
        <SearchForm @search="handleSearch" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'
import SearchForm from '@/components/SearchForm.vue'
import type { SearchParams } from '@/types'

const router = useRouter()
const route = useRoute()
const { hideBackButton, showAlert, hapticFeedback } = useTelegram()

onMounted(async () => {
  hideBackButton()
  
  // Принудительная прокрутка вверх при монтировании
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  
  // Проверяем, вернулся ли пользователь после оплаты
  const paymentStatus = route.query.payment_status as string
  if (paymentStatus === 'success') {
    hapticFeedback('success')
    await showAlert('✅ Оплата успешно завершена! Мы отправим подтверждение на вашу почту.')
    
    // Очищаем query параметры
    router.replace({ name: 'Home' })
  } else if (paymentStatus === 'failed') {
    hapticFeedback('error')
    await showAlert('❌ Оплата не прошла. Попробуйте еще раз или свяжитесь с поддержкой.')
    
    // Очищаем query параметры
    router.replace({ name: 'Home' })
  }
})

const handleSearch = (params: SearchParams) => {
  router.push({
    name: 'Results',
    query: {
      from: params.departureCityId.toString(),
      to: params.arrivalCountryId.toString(),
      date: params.minStartDate,
      nights: params.minNightsCount.toString(),
      adults: params.adults.toString(),
      children: params.children?.toString() || '0'
    }
  })
}

onUnmounted(() => {
  // Cleanup если нужно
})
</script>

<style lang="scss" module src="./HomePage.module.scss"></style>

