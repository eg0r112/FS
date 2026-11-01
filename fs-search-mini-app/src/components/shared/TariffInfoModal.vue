<template>
  <Teleport to="body">
    <div :class="$style.overlay" v-if="show" @click.self="handleClose">
      <div :class="$style.modal" @click.stop>
        <!-- Header -->
        <div :class="$style.header">
          <h2 :class="$style.title">{{ modalTitle }}</h2>
          <button :class="$style.closeBtn" @click="handleClose">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Акция (если есть) -->
        <div v-if="showPromoInfo" :class="$style.promoInfo">
          <p :class="$style.promoText">
            Специальные условия предоплаты для раннего бронирования зимы.<br>
            Тариф Стандарт – от 20% первый взнос.<br>
            Тариф Промо – от 30% первый взнос
          </p>
          <p :class="$style.promoText">
            Подробная информация об акции 
            <a :class="$style.promoLink" href="https://fstravel.com/actions/rannee-bronirovanie-zima" target="_blank">по ссылке</a>
          </p>
        </div>

        <!-- Content -->
        <div :class="$style.content">
          <div :class="$style.body">
            <!-- Промо тариф (если доступен) -->
            <div v-if="hasPromo" :class="$style.tariff">
              <h2 :class="$style.tariffTitle">Промо</h2>
              
              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Предоплата</h4>
                <p :class="$style.tariffBlockText">
                  Не менее 50% от стоимости тура в день бронирования
                </p>
              </div>

              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Полная оплата тура</h4>
                <p :class="$style.tariffBlockText">
                  Не позднее, чем за 21 день до даты начала путешествия
                </p>
              </div>

              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Участие в акциях</h4>
                <p :class="$style.tariffBlockText">
                  Дополнительные скидки по промокоду не применяются, если иное не предусмотрено по условиям промоакции*
                </p>
              </div>

              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Сбор при аннуляции тура*</h4>
                <ul :class="[$style.tariffBlockText, $style.paddingList]">
                  <li :class="$style.paddingItem">
                    от 31 дня и более – 15 у.е* / 30 у.е. или 999 рублей* / 2000 рублей (Россия)
                  </li>
                  <li :class="$style.paddingItem">
                    от 30 до 21 дня – 30% стоимости заявки
                  </li>
                  <li :class="$style.paddingItem">
                    от 20 до 11 дней – 75% стоимости заявки
                  </li>
                  <li :class="$style.paddingItem">
                    10 и менее дней – 100% стоимости заявки
                  </li>
                </ul>
                <p :class="$style.tariffBlockText">
                  * Исключение: для направления Мальдивы ФПР применяются согласно условиям тарифа «Стандарт»
                </p>
              </div>

              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Изменение паспортных данных</h4>
                <p :class="$style.tariffBlockText">Сбор 20 у.е.</p>
              </div>
            </div>

            <!-- Стандарт тариф -->
            <div :class="[$style.tariff, $style.tariffTurquoise]">
              <h2 v-if="hasPromo" :class="$style.tariffTitle">Стандарт</h2>
              
              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Предоплата</h4>
                <p :class="$style.tariffBlockText">
                  Не менее 10% от стоимости тура в день бронирования, если иное не предусмотрено по условиям промоакции*
                </p>
              </div>

              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Полная оплата тура</h4>
                <p :class="$style.tariffBlockText">
                  Не позднее, чем за 15 дней до даты начала путешествия**
                </p>
              </div>

              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Участие в акциях</h4>
                <p :class="$style.tariffBlockText">
                  Участвует во всех акциях с применением скидки по промокоду
                </p>
              </div>

              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Сбор при аннуляции тура*</h4>
                <ul :class="[$style.tariffBlockText, $style.paddingList]">
                  <li :class="$style.paddingItem">
                    от 21 дня и более – 30 у.е. или 2000 рублей (Россия)
                  </li>
                  <li :class="$style.paddingItem">
                    от 20 до 15 дней – 25% стоимости заявки
                  </li>
                  <li :class="$style.paddingItem">
                    от 14 до 8 дней – 30% стоимости заявки
                  </li>
                  <li :class="$style.paddingItem">
                    от 7 до 4 дней – 50% стоимости заявки
                  </li>
                  <li :class="$style.paddingItem">
                    3 и менее дней – 100% стоимости заявки
                  </li>
                </ul>
                <p :class="$style.tariffBlockText">
                  * Подробные условия доступны 
                  <a href="https://fstravel.com/usloviya-otmeny" target="_blank" :class="$style.link">здесь</a>
                </p>
              </div>

              <div :class="$style.tariffBlock">
                <h4 :class="$style.tariffBlockTitle">Изменение паспортных данных</h4>
                <p :class="$style.tariffBlockText">
                  Без дополнительных сборов. Возможна замена участников поездки (сохранение минимум 1 человека в брони обязательно)
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div :class="$style.footer">
            <div :class="$style.footerItem">
              <span :class="$style.footerMarker">*</span>
              <div :class="$style.footerText">
                Не менее 10% от стоимости тура в день бронирования, если иное не предусмотрено по условиям промоакции
              </div>
            </div>
            <div :class="$style.footerItem">
              <span :class="$style.footerMarker">**</span>
              <div :class="$style.footerText">
                Исключая ряд направлений, а также периоды акций, см. описание Акции
              </div>
            </div>
            <div :class="$style.footerItem">
              <span :class="$style.footerMarker">***</span>
              <div :class="$style.footerText">
                <p>Размер фактически понесённых Принципалом расходов ориентировочный и рассчитывается по каждому туристскому продукту индивидуально, в зависимости от сроков аннуляции туристского продукта, страны пребывания туристов после отмены тура.</p>
                <p>См. <a href="https://fstravel.com/usloviya-otmeny" target="_blank" :class="$style.link">https://fstravel.com/usloviya-otmeny</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTelegram } from '@/composables/useTelegram'

interface Props {
  show: boolean
  hasPromo?: boolean
  showPromoInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasPromo: false,
  showPromoInfo: false
})

const emit = defineEmits<{
  close: []
}>()

const { hapticFeedback } = useTelegram()

const modalTitle = computed(() => {
  return props.hasPromo ? 'Информация о тарифах' : 'Информация о тарифе «Стандарт»'
})

const handleClose = () => {
  hapticFeedback('light')
  emit('close')
}
</script>

<style lang="scss" module src="./TariffInfoModal.module.scss"></style>

