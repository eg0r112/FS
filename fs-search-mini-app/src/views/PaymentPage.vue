<template>
  <div :class="$style.payment">
    <div :class="$style.container">
      <div :class="$style.header">
        <h1 :class="$style.title">Оплата тура</h1>
      </div>

    <div :class="$style.card">
      <div :class="$style.section">
        <h2 :class="$style.sectionTitle">Детали заказа</h2>
        
        <div :class="$style.details">
          <div :class="$style.detailRow">
            <span :class="$style.label">Отель:</span>
            <span :class="$style.value">{{ hotelName }}</span>
          </div>
          
          <div v-if="roomName" :class="$style.detailRow">
            <span :class="$style.label">Номер:</span>
            <span :class="$style.value">{{ roomName }}</span>
          </div>
          
          <div v-if="mealName" :class="$style.detailRow">
            <span :class="$style.label">Питание:</span>
            <span :class="$style.value">{{ mealName }}</span>
          </div>
          
          <div v-if="nights" :class="$style.detailRow">
            <span :class="$style.label">Ночей:</span>
            <span :class="$style.value">{{ nights }}</span>
          </div>
          
          <div :class="$style.detailRow">
            <span :class="$style.label">Дата заезда:</span>
            <span :class="$style.value">{{ checkInDate }}</span>
          </div>
          
          <div :class="$style.detailRow">
            <span :class="$style.label">Дата выезда:</span>
            <span :class="$style.value">{{ checkOutDate }}</span>
          </div>
          
          <div :class="$style.detailRow">
            <span :class="$style.label">Гости:</span>
            <span :class="$style.value">{{ guestsInfo }}</span>
          </div>
          
          <div :class="$style.detailRow">
            <span :class="$style.label">Стоимость:</span>
            <span :class="$style.valuePrice">{{ formatNumber(price) }} ₽</span>
          </div>
        </div>
      </div>

      <div :class="$style.section">
        <h2 :class="$style.sectionTitle">Контактная информация</h2>
        
        <div :class="$style.form">
          <TextInput
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="example@mail.com"
            :required="true"
            :readonly="!!form.email"
          />
          
          <TextInput
            v-model="form.phone"
            type="tel"
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
            :required="true"
            :readonly="!!form.phone"
          />
        </div>
      </div>

      <div :class="$style.section">
        <h2 :class="$style.sectionTitle">Данные туристов</h2>
        
        <TouristForm
          ref="touristFormRef"
          :adults-count="adults"
          :children-count="children"
          :is-russian-passport="true"
          @update:travellers="handleTravellersUpdate"
          @validate="handleTouristsValidation"
        />
      </div>

      <div :class="$style.total">
        <span :class="$style.totalLabel">Итого к оплате:</span>
        <span :class="$style.totalPrice">{{ formatNumber(price) }} ₽</span>
      </div>

      <Button
        variant="primary"
        size="large"
        full-width
        :loading="processing"
        :disabled="!isFormValid"
        @click="handlePayment"
      >
        {{ processing ? 'Обработка...' : 'Оплатить' }}
      </Button>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import TextInput from '@/components/shared/TextInput.vue'
import Button from '@/components/shared/Button.vue'
import TouristForm from '@/components/TouristForm.vue'
import { formatNumber } from '@/utils/helpers'
import { useTelegram } from '@/composables/useTelegram'
import { createPaymentBooking, type PaymentConfig } from '@/api/payment'
import { createPreorder, createOrUpdateDraft, reserve, getBookingStatus, type Traveller } from '@/api/booking'

const route = useRoute()
const router = useRouter()
const { showBackButton, hideBackButton, showAlert, showConfirm, hapticFeedback, openLink } = useTelegram()

const hotelName = computed(() => route.query.hotelName as string || 'Отель')
const roomName = computed(() => route.query.roomName as string || '')
const mealName = computed(() => route.query.mealName as string || '')
const price = computed(() => Number(route.query.price) || 0)
const nights = computed(() => route.query.nights as string || '')
const tourId = computed(() => route.query.tourId as string || '')

// Получаем данные из searchStore или route
const checkInDate = computed(() => {
  const dateStr = route.query.checkIn as string
  if (dateStr) {
    try {
      const d = parseISO(dateStr)
      return format(d, 'd MMMM yyyy', { locale: ru })
    } catch {
      return dateStr
    }
  }
  return 'Не указана'
})

const checkOutDate = computed(() => {
  const dateStr = route.query.checkOut as string
  if (dateStr) {
    try {
      const d = parseISO(dateStr)
      return format(d, 'd MMMM yyyy', { locale: ru })
    } catch {
      return dateStr
    }
  }
  return 'Не указана'
})

const guestsInfo = computed(() => {
  const adults = route.query.adults as string || '2'
  const children = route.query.children as string || '0'
  
  const parts = []
  if (adults) parts.push(`${adults} взр.`)
  if (children && children !== '0') parts.push(`${children} дет.`)
  
  return parts.join(', ') || '2 взр.'
})

const form = ref({
  email: '',
  phone: ''
})

const processing = ref(false)
const touristFormRef = ref<InstanceType<typeof TouristForm> | null>(null)
const travellers = ref<Traveller[]>([])
const touristsValid = ref(false)
const adults = computed(() => Number(route.query.adults) || 2)
const children = computed(() => Number(route.query.children) || 0)

// Загружаем данные пользователя из sessionStorage (из регистрации)
onMounted(() => {
  const savedEmail = sessionStorage.getItem('userEmail')
  const savedPhone = sessionStorage.getItem('userPhone')
  
  if (savedEmail) {
    form.value.email = savedEmail
  }
  if (savedPhone) {
    form.value.phone = savedPhone
  }
  
  // Если нет email или phone, перенаправляем на страницу авторизации
  if (!savedEmail || !savedPhone) {
    const tourKey = route.params.tourKey as string
    router.replace({
      name: 'Auth',
      params: { tourKey },
      query: route.query
    })
    return
  }
  
  showBackButton(() => {
    router.back()
  })
})

// getPaymentRedirectUrl больше не нужен, так как booking API сам формирует redirectUrl

const handleTravellersUpdate = (updatedTravellers: Traveller[]) => {
  travellers.value = updatedTravellers
}

const handleTouristsValidation = (isValid: boolean) => {
  touristsValid.value = isValid
}

const isFormValid = computed(() => {
  return (
    form.value.email.trim().length > 0 &&
    form.value.phone.trim().length > 0 &&
    touristsValid.value
  )
})

const handlePayment = async () => {
  if (!isFormValid.value) return
  
  if (!tourId.value) {
    hapticFeedback('error')
    await showAlert('Ошибка: не указан ID тура')
    return
  }
  
  processing.value = true
  hapticFeedback('medium')
  
  try {
    // Получаем данные тура из query
    const roomId = Number(route.query.roomId) || 0
    const mealId = Number(route.query.mealId) || 0
    const nights = Number(route.query.nights) || 7
    const checkIn = route.query.checkIn as string
    // Проверяем оба варианта параметра (checkOut и checkoutDate)
    const checkOut = (route.query.checkoutDate || route.query.checkOut) as string
    
    if (!checkOut) {
      throw new Error('Не указана дата выезда')
    }
    
    // Получаем данные пользователя
    const savedEmail = sessionStorage.getItem('userEmail') || form.value.email
    const savedPhone = sessionStorage.getItem('userPhone') || form.value.phone
    
    // Валидация всех полей туристов
    if (touristFormRef.value) {
      (touristFormRef.value as any).validateAll()
      if (!touristsValid.value) {
        throw new Error('Пожалуйста, заполните все обязательные поля туристов')
      }
    }

    // Подготовка данных туристов для отправки
    const travellersData: Traveller[] = travellers.value.map(traveller => {
      const travellerData: Traveller = {
        id: traveller.id,
        birthDay: traveller.birthDay || '0001-01-01',
        sex: traveller.sex,
        documents: traveller.documents.map(doc => {
          const docData: any = { ...doc }
          // Для свидетельства о рождении объединяем seriesNumbers и seriesLetters в series
          if (doc.type === 'birthCertificate') {
            docData.series = (doc.seriesNumbers || '') + (doc.seriesLetters || '')
            delete docData.seriesNumbers
            delete docData.seriesLetters
          }
          // Устанавливаем значения по умолчанию для дат
          if (!docData.issueDate) {
            docData.issueDate = '0001-01-01'
          }
          if (!docData.expirationDate) {
            docData.expirationDate = '0001-01-01'
          }
          return docData
        }),
        email: savedEmail,
        phones: savedPhone
      }
      return travellerData
    })

    // 0. Создание preorder для MindBox (опционально, как в booking)
    // В booking это делается в saveBasket перед createOrUpdate, если есть телефон
    if (savedPhone) {
      try {
        await createPreorder({
          tourId: Number(tourId.value),
          tourName: hotelName.value,
          countryName: route.query.programType as string || route.query.accomodation as string || 'Тур',
          departureCityName: '', // Можно добавить если есть в query
          startDate: checkIn,
          endDate: checkOut,
          nightsCount: nights,
          price: price.value,
          adultsCount: adults.value,
          childrenCount: children.value,
          customerPhone: savedPhone,
          customerEmail: savedEmail,
          programTypeName: route.query.programType as string || undefined,
          hotelId: Number(route.query.roomId) || undefined,
          customerInfo: {
            birthDay: travellersData[0]?.birthDay,
            sex: travellersData[0]?.sex
          }
        })
      } catch (error) {
        // Preorder не критичен, продолжаем даже при ошибке
        console.warn('Preorder failed, continuing:', error)
      }
    }
    
    // 1. Сохранение корзины с данными туристов (saveBasket) - как в booking
    // В booking это делается перед бронированием в fetchBasketBook через await dispatch('saveBasket')
    // Корзина создается только после ввода данных туристов, перед бронированием
    // Получаем токен авторизации из sessionStorage (если есть)
    const authToken = sessionStorage.getItem('authToken')
    
    // Формируем структуру тура как в booking проекте
    // В booking tours[0] содержит полный объект тура с ClaimDocumentJson, travellers, paxes и т.д.
    const tourData = {
      tourId: Number(tourId.value),
      roomId,
      mealId,
      nightsCount: nights,
      daysCount: nights, // В booking daysCount обычно равен nightsCount
      checkinDate: checkIn,
      checkoutDate: checkOut,
      startDate: checkIn,
      endDate: checkOut,
      paxes: {
        adultsCount: adults.value,
        childrenCount: children.value,
        infantsCount: 0,
        childrenAge: [] // Можно добавить возрасты детей если есть
      },
      travellers: travellersData,
      ClaimDocumentJson: null, // В booking это заполняется из geo object, у нас пока null
      price: price.value,
      currency: {
        currencyId: 1,
        currencyAlias: 'RUB'
      },
      hotelId: Number(route.query.roomId) || undefined,
      name: hotelName.value,
      hotelName: hotelName.value,
      roomName: route.query.roomName as string || undefined,
      mealName: route.query.mealName as string || undefined,
      programTypeName: route.query.programType as string || undefined,
      imgUrl: null,
      insurances: [],
      services: [],
      visaOptions: [],
      isRegularFlight: null,
      isVisaRequired: false,
      promoCode: null,
      selectedFlightOptionId: null,
      flightSeats: [],
      selectedHotels: null
    }
    
    const draftData = await createOrUpdateDraft({
      tours: [tourData],
      customerInfo: {
        email: savedEmail,
        phones: savedPhone.replace(/\+/g, ''),
        documents: travellersData[0]?.documents || [],
        birthDay: travellersData[0]?.birthDay,
        sex: travellersData[0]?.sex
      },
      draftType: 'FunSun'
    }, authToken || undefined)
    
    const draftId = draftData.id || draftData.draftId || sessionStorage.getItem('draftId')
    
    if (!draftId) {
      throw new Error('Не удалось создать корзину')
    }
    
    // Сохраняем draftId
    sessionStorage.setItem('draftId', draftId)
    
    // 2. Бронирование (fetchBasketBook) - как в booking
    await reserve({
      draftId
    }, authToken || undefined)
    
    // 3. Проверка статуса (fetchBasketStatus) - как в booking
    const status = await getBookingStatus({ draftId }, authToken || undefined)
    
    // Сохраняем статус
    sessionStorage.setItem('bookingStatus', JSON.stringify(status))
    
    if (!status.isSuccess) {
      throw new Error('Бронирование не удалось')
    }
    
    // В booking используется backOfficeId если есть, иначе draftId
    // paymentConfig.orderId = this.orderId ? parseInt(this.orderId) : this.getBasketStatus.draftId
    const orderId = status.backOfficeId ? Number(status.backOfficeId) : Number(draftId)
    
    if (orderId) {
      sessionStorage.setItem('backOfficeId', orderId.toString())
    }
    
    // 4. Создание платежа через booking API (fetchUserPayment) - как в booking
    // Формируем paymentConfig как в booking проекте
    const countryName = route.query.programType as string || route.query.accomodation as string || 'Тур'
    
    const paymentConfig: PaymentConfig = {
      orderId: orderId,
      destinationCountryName: countryName,
      description: countryName,
      beginDate: checkIn,
      customerEmail: savedEmail,
      customerPhoneNumber: savedPhone.replace(/\+/g, ''), // Убираем + как в booking
      amount: price.value,
      currencyCode: 'RUB',
      currencyRate: 1,
      isPrepaid: false,
      tariffType: 6,
      provider: 'tinkoff' // По умолчанию tinkoff
    }
    
    const paymentResponse = await createPaymentBooking(paymentConfig)
    
    if (!paymentResponse.formUrl) {
      throw new Error('Не получен URL для оплаты')
    }
    
    processing.value = false

    if (paymentResponse.provider === 'mock') {
      hapticFeedback('success')
      await showAlert('Демо-режим: бронь создана, внешняя оплата Fun&Sun отключена.')
      return
    }
    
    // Показываем предупреждение перед переходом на оплату
    const confirmed = await showConfirm(
      'Вы будете перенаправлены на защищенную страницу оплаты. После оплаты вы вернетесь в приложение. Продолжить?'
    )
    
    if (confirmed) {
      hapticFeedback('success')
      
      // Открываем страницу оплаты - как в booking через fetchPaymentLink
      // Для tinkoff, ecommpay, sberbank, sovkombank, VsegdaDa - просто редирект на formUrl
      if (['tinkoff', 'ecommpay', 'sberbank', 'sovkombank', 'VsegdaDa'].includes(paymentResponse.provider)) {
        openLink(paymentResponse.formUrl, { tryInstantView: false })
      } else {
        // Для других провайдеров может быть форма
        openLink(paymentResponse.formUrl, { tryInstantView: false })
      }
    }
  } catch (error) {
    hapticFeedback('error')
    console.error('Payment error:', error)
    await showAlert(error instanceof Error ? error.message : 'Ошибка при бронировании. Попробуйте еще раз.')
    processing.value = false
  }
}

// onMounted уже определен выше

onBeforeUnmount(() => {
  hideBackButton()
})
</script>

<style lang="scss" module src="./PaymentPage.module.scss"></style>

