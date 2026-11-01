<template>
  <div :class="$style.authStep">
    <div :class="$style.authBorder">
      <h4 :class="$style.title">Продолжить без регистрации</h4>
      <div :class="$style.signUpText">
        Вы можете забронировать тур без регистрации, мы автоматически создадим ваш личный кабинет и сохраним все данные о вашей поездке
      </div>

      <div :class="$style.contactBox">
        <div :class="$style.contactWrapper">
          <TextInput
            :class="[$style.mailField, { [$style.fieldError]: errors.email || errors.general }]"
            v-model="traveller.email"
            label="Email"
            placeholder="example@mail.com"
            type="email"
            :error="errors.email"
            :required="true"
            @blur="checkEmail"
            @input="checkEmail"
          />

          <div :class="[$style.phoneField, { [$style.phoneError]: errors.phone || errors.general }]">
            <TextInput
              v-model="traveller.phone"
              label="Телефон"
              placeholder="+7 (999) 123-45-67"
              type="tel"
              :error="errors.phone || (errors.general && !errors.email ? errors.general : '')"
              :required="true"
              @blur="checkPhone"
              @input="checkPhone"
            />
          </div>
        </div>

        <div
          :class="[$style.continueBtn, { [$style.disabledBtn]: !isAllDone || props.disabled }]"
          @click="handleRegister"
        >
          <span v-if="!disableSignUp && !props.disabled">Продолжить</span>
          <span v-else>Обработка...</span>
        </div>

        <div :class="$style.errorGeneral" v-if="errors.general && !errors.email && !errors.phone">
          {{ errors.general }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TextInput from '@/components/shared/TextInput.vue'
import { registerUserWithoutAuth } from '@/api/auth'

interface Props {
  onSuccess?: (data: { email: string; phone: string; password?: string }) => void
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  onSuccess: undefined,
  disabled: false
})

const traveller = ref({
  email: '',
  phone: ''
})

const errors = ref({
  email: '',
  phone: '',
  general: ''
})

const disableSignUp = ref(false)
const hasServerError = ref(false)
const originalData = ref({
  email: '',
  phone: ''
})

const isAllDone = computed(() => {
  if (hasServerError.value) {
    return false
  }
  return (
    !errors.value.email &&
    !errors.value.phone &&
    !errors.value.general &&
    traveller.value.phone.trim().length > 0 &&
    traveller.value.email.trim().length > 0
  )
})

const validateEmail = (email: string): string => {
  if (!email) {
    return 'Email не может быть пустым'
  }
  const regular = /^\S+@\S+$/
  if (!email.match(regular)) {
    return 'Email заполнен неверно'
  }
  return ''
}

const validatePhone = (phone: string): string => {
  if (!phone || phone.length === 0) {
    return 'Номер телефона не может быть пустым'
  }
  const cleanPhone = phone.replace(/\D/g, '')
  if (!/^\d{10,11}$/.test(cleanPhone)) {
    return 'Телефон заполнен неверно'
  }
  return ''
}

const resetServerError = () => {
  hasServerError.value = false
  errors.value.general = ''
  errors.value.email = ''
  errors.value.phone = ''
}

const checkEmail = () => {
  errors.value.email = validateEmail(traveller.value.email)
  if (hasServerError.value && traveller.value.email !== originalData.value.email) {
    resetServerError()
  }
}

const checkPhone = () => {
  errors.value.phone = validatePhone(traveller.value.phone)
  if (hasServerError.value && traveller.value.phone !== originalData.value.phone) {
    resetServerError()
  }
}

const handleRegister = async () => {
  if (!isAllDone.value || disableSignUp.value || props.disabled) {
    return
  }

  // Блокируем повторные клики
  disableSignUp.value = true

  // Валидация перед отправкой
  const emailError = validateEmail(traveller.value.email)
  const phoneError = validatePhone(traveller.value.phone)

  if (emailError || phoneError) {
    errors.value.email = emailError
    errors.value.phone = phoneError
    disableSignUp.value = false
    return
  }

  try {
    // Телефон в формате +7XXXXXXXXXX (только цифры, последние 10)
    const digits = traveller.value.phone.replace(/\D/g, '')
    const formattedPhone = '+7' + digits.slice(-10)

    const result = await registerUserWithoutAuth({
      email: traveller.value.email.trim(),
      phone: formattedPhone
    })

    if (result) {
      errors.value.email = ''
      errors.value.phone = ''
      errors.value.general = ''
      hasServerError.value = false

      if (props.onSuccess) {
        props.onSuccess({
          email: traveller.value.email.trim(),
          phone: formattedPhone,
          password: result.password
        })
      }
    } else {
      disableSignUp.value = false
      errors.value.general = 'Не удалось зарегистрироваться. Попробуйте ещё раз'
    }
  } catch (error: any) {
    // Разблокируем кнопку при ошибке
    disableSignUp.value = false

    errors.value.email = ''
    errors.value.phone = ''
    errors.value.general = ''

    // Запоминаем введённые данные, чтобы снять ошибку при их изменении
    originalData.value.email = traveller.value.email
    originalData.value.phone = traveller.value.phone
    hasServerError.value = true

    errors.value.general = error.message || 'Ошибка при регистрации'
  }
}
</script>

<style lang="scss" module src="./AuthStep.module.scss"></style>