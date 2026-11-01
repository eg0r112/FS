<template>
  <div :class="$style.touristForm">
    <div
      v-for="(traveller, index) in travellers"
      :key="'traveller-' + index"
      :class="$style.travellerBox"
    >
      <h3 :class="$style.travellerTitle">
        {{ traveller.isAdult ? `Взрослый ${index + 1}` : `Ребёнок ${index + 1 - adultsCount}` }}
      </h3>

      <!-- Тип документа -->
      <div v-if="!traveller.isAdult && isRussianPassport" :class="$style.fieldRow">
          <SelectInput
            :model-value="traveller.documents[0].type"
            @update:model-value="handleDocumentTypeChange(traveller, String($event))"
            label="Документ"
            :options="documentTypeOptions"
            :required="true"
          />
      </div>

      <!-- Загранпаспорт -->
      <template v-if="traveller.documents[0].type === 'internationalPassport'">
        <div :class="$style.fieldRow">
          <TextInput
            :model-value="traveller.documents[0].lastNameLatin || ''"
            @update:model-value="traveller.documents[0].lastNameLatin = String($event)"
            label="Фамилия (латиницей)"
            placeholder="IVANOV"
            :required="true"
            :error="getDocumentError(traveller, 0, 'lastNameLatin')"
            @blur="validateField(traveller, 0, 'lastNameLatin')"
          />
        </div>
        <div :class="$style.fieldRow">
          <TextInput
            :model-value="traveller.documents[0].firstNameLatin || ''"
            @update:model-value="traveller.documents[0].firstNameLatin = String($event)"
            label="Имя (латиницей)"
            placeholder="IVAN"
            :required="true"
            :error="getDocumentError(traveller, 0, 'firstNameLatin')"
            @blur="validateField(traveller, 0, 'firstNameLatin')"
          />
        </div>
        <div :class="$style.fieldRow">
          <DateInput
            v-model="traveller.birthDay"
            label="Дата рождения"
            :required="true"
            :max="maxBirthDate"
            :error="getTravellerError(traveller, 'birthDay')"
            @change="handleBirthDayChange(traveller, $event)"
          />
        </div>
        <div :class="$style.fieldRow">
          <SelectInput
            v-model="traveller.sex"
            label="Пол"
            :options="genderOptions"
            value-key="value"
            label-key="name"
            :required="true"
            :error="getTravellerError(traveller, 'sex')"
            @update:model-value="validateField(traveller, 0, 'sex')"
          />
        </div>
        <div :class="$style.fieldRowHalf">
          <TextInput
            :model-value="traveller.documents[0].series || ''"
            @update:model-value="traveller.documents[0].series = String($event)"
            label="Серия паспорта"
            placeholder="72"
            :required="true"
            :error="getDocumentError(traveller, 0, 'series')"
            @blur="validateField(traveller, 0, 'series')"
          />
          <TextInput
            :model-value="traveller.documents[0].number || ''"
            @update:model-value="traveller.documents[0].number = String($event)"
            label="Номер паспорта"
            placeholder="9738461"
            :required="true"
            :error="getDocumentError(traveller, 0, 'number')"
            @blur="validateField(traveller, 0, 'number')"
          />
        </div>
        <div :class="$style.fieldRow">
          <DateInput
            :model-value="traveller.documents[0].expirationDate || ''"
            @update:model-value="traveller.documents[0].expirationDate = $event"
            label="Действителен до"
            :required="true"
            :min="minExpirationDate"
            :error="getDocumentError(traveller, 0, 'expirationDate')"
            @change="validateField(traveller, 0, 'expirationDate')"
          />
        </div>
      </template>

      <!-- Паспорт РФ -->
      <template v-else-if="traveller.documents[0].type === 'passport'">
        <div :class="$style.fieldRow">
          <TextInput
            v-model="traveller.documents[0].lastName"
            label="Фамилия"
            placeholder="Петров"
            :required="true"
            :error="getDocumentError(traveller, 0, 'lastName')"
            @blur="handleCyrillicNameChange(traveller, 0, 'lastName', $event)"
          />
        </div>
        <div :class="$style.fieldRow">
          <TextInput
            v-model="traveller.documents[0].firstName"
            label="Имя"
            placeholder="Александр"
            :required="true"
            :error="getDocumentError(traveller, 0, 'firstName')"
            @blur="handleCyrillicNameChange(traveller, 0, 'firstName', $event)"
          />
        </div>
        <div :class="$style.fieldRow">
          <TextInput
            v-model="traveller.documents[0].middleName"
            label="Отчество"
            placeholder="Иванович"
            :required="true"
            :error="getDocumentError(traveller, 0, 'middleName')"
            @blur="validateField(traveller, 0, 'middleName')"
          />
        </div>
        <div :class="$style.fieldRow">
          <DateInput
            v-model="traveller.birthDay"
            label="Дата рождения"
            :required="true"
            :max="maxBirthDate"
            :error="getTravellerError(traveller, 'birthDay')"
            @change="handleBirthDayChange(traveller, $event)"
          />
        </div>
        <div :class="$style.fieldRow">
          <SelectInput
            v-model="traveller.sex"
            label="Пол"
            :options="genderOptions"
            value-key="value"
            label-key="name"
            :required="true"
            :error="getTravellerError(traveller, 'sex')"
            @update:model-value="validateField(traveller, 0, 'sex')"
          />
        </div>
        <div :class="$style.fieldRowHalf">
          <TextInput
            v-model="traveller.documents[0].series"
            label="Серия паспорта"
            placeholder="4044"
            mask="####"
            :required="true"
            :error="getDocumentError(traveller, 0, 'series')"
            @blur="validateField(traveller, 0, 'series')"
          />
          <TextInput
            v-model="traveller.documents[0].number"
            label="Номер паспорта"
            placeholder="345861"
            mask="######"
            :required="true"
            :error="getDocumentError(traveller, 0, 'number')"
            @blur="validateField(traveller, 0, 'number')"
          />
        </div>
        <!-- Для заказчика (первого взрослого) добавляем дополнительные поля -->
        <template v-if="traveller.isCustomer && !props.isRussianPassport">
          <div :class="$style.fieldRow">
            <DateInput
              v-model="traveller.documents[0].issueDate"
              label="Дата выдачи"
              :required="true"
              :max="maxIssueDate"
              :error="getDocumentError(traveller, 0, 'issueDate')"
              @change="validateField(traveller, 0, 'issueDate')"
            />
          </div>
          <div :class="$style.fieldRow">
            <TextInput
              v-model="traveller.documents[0].issuingAuthority"
              label="Орган выдачи"
              placeholder="УФМС России"
              :required="true"
              :error="getDocumentError(traveller, 0, 'issuingAuthority')"
              @blur="validateField(traveller, 0, 'issuingAuthority')"
            />
          </div>
          <div :class="$style.fieldRow">
            <TextInput
              v-model="traveller.documents[0].address"
              label="Адрес регистрации"
              placeholder="г. Москва, ул. Ленина, д. 1"
              :required="true"
              :error="getDocumentError(traveller, 0, 'address')"
              @blur="validateField(traveller, 0, 'address')"
            />
          </div>
        </template>
      </template>

      <!-- Свидетельство о рождении -->
      <template v-else-if="traveller.documents[0].type === 'birthCertificate'">
        <div :class="$style.fieldRow">
          <TextInput
            v-model="traveller.documents[0].lastName"
            label="Фамилия"
            placeholder="Петров"
            :required="true"
            :error="getDocumentError(traveller, 0, 'lastName')"
            @blur="handleCyrillicNameChange(traveller, 0, 'lastName', $event)"
          />
        </div>
        <div :class="$style.fieldRow">
          <TextInput
            v-model="traveller.documents[0].firstName"
            label="Имя"
            placeholder="Александр"
            :required="true"
            :error="getDocumentError(traveller, 0, 'firstName')"
            @blur="handleCyrillicNameChange(traveller, 0, 'firstName', $event)"
          />
        </div>
        <div :class="$style.fieldRow">
          <TextInput
            v-model="traveller.documents[0].middleName"
            label="Отчество"
            placeholder="Иванович"
            :required="true"
            :error="getDocumentError(traveller, 0, 'middleName')"
            @blur="validateField(traveller, 0, 'middleName')"
          />
        </div>
        <div :class="$style.fieldRow">
          <DateInput
            v-model="traveller.birthDay"
            label="Дата рождения"
            :required="true"
            :max="maxBirthDate"
            :error="getTravellerError(traveller, 'birthDay')"
            @change="handleBirthDayChange(traveller, $event)"
          />
        </div>
        <div :class="$style.fieldRow">
          <SelectInput
            v-model="traveller.sex"
            label="Пол"
            :options="genderOptions"
            value-key="value"
            label-key="name"
            :required="true"
            :error="getTravellerError(traveller, 'sex')"
            @update:model-value="validateField(traveller, 0, 'sex')"
          />
        </div>
        <div :class="$style.fieldRowHalf">
          <TextInput
            v-model="traveller.documents[0].seriesNumbers"
            label="Серия (числа)"
            placeholder="XI"
            :required="true"
            :error="getDocumentError(traveller, 0, 'seriesNumbers')"
            @blur="validateField(traveller, 0, 'seriesNumbers')"
          />
          <TextInput
            v-model="traveller.documents[0].seriesLetters"
            label="Серия (буквы)"
            placeholder="ДС"
            :required="true"
            :error="getDocumentError(traveller, 0, 'seriesLetters')"
            @blur="validateField(traveller, 0, 'seriesLetters')"
          />
        </div>
        <div :class="$style.fieldRow">
          <TextInput
            v-model="traveller.documents[0].number"
            label="Номер свидетельства"
            placeholder="345867"
            mask="######"
            :required="true"
            :error="getDocumentError(traveller, 0, 'number')"
            @blur="validateField(traveller, 0, 'number')"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TextInput from '@/components/shared/TextInput.vue'
import DateInput from '@/components/shared/DateInput.vue'
import SelectInput from '@/components/shared/SelectInput.vue'
import { format, addDays } from 'date-fns'

export interface TravellerDocument {
  type: 'passport' | 'internationalPassport' | 'birthCertificate' | 'idCard'
  firstName?: string
  firstNameLatin?: string
  middleName?: string
  lastName?: string
  lastNameLatin?: string
  series?: string
  seriesNumbers?: string
  seriesLetters?: string
  number?: string
  issueDate?: string
  expirationDate?: string
  issuingAuthority?: string
  address?: string
}

export interface Traveller {
  id: number
  isAdult: boolean
  isCustomer?: boolean
  birthDay: string
  sex: 'male' | 'female' | ''
  documents: TravellerDocument[]
  email?: string
  phones?: string
}

interface Props {
  adultsCount: number
  childrenCount: number
  isRussianPassport?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isRussianPassport: true
})

const emit = defineEmits<{
  'update:travellers': [travellers: Traveller[]]
  'validate': [isValid: boolean]
}>()

const documentTypeOptions = [
  { name: 'Паспорт РФ', value: 'passport' },
  { name: 'Свидетельство о рождении', value: 'birthCertificate' }
]

const genderOptions = [
  { name: 'Мужской', value: 'male' },
  { name: 'Женский', value: 'female' }
]

const travellers = ref<Traveller[]>([])
const errors = ref<Record<number, { documents: Record<number, Record<string, string>>; [key: string]: any }>>({})

const maxBirthDate = computed(() => format(new Date(), 'yyyy-MM-dd'))
const minExpirationDate = computed(() => format(addDays(new Date(), 1), 'yyyy-MM-dd'))
const maxIssueDate = computed(() => format(new Date(), 'yyyy-MM-dd'))

// Инициализация туристов
const initializeTravellers = () => {
  const newTravellers: Traveller[] = []
  let id = 1

  // Взрослые
  for (let i = 0; i < props.adultsCount; i++) {
    newTravellers.push({
      id: id++,
      isAdult: true,
      isCustomer: i === 0, // Первый взрослый - заказчик
      birthDay: '',
      sex: '',
      documents: [{
        type: props.isRussianPassport ? 'passport' : 'internationalPassport',
        firstName: '',
        firstNameLatin: '',
        middleName: '',
        lastName: '',
        lastNameLatin: '',
        series: '',
        number: '',
        issueDate: '',
        expirationDate: '',
        issuingAuthority: '',
        address: ''
      }]
    })
  }

  // Дети
  for (let i = 0; i < props.childrenCount; i++) {
    newTravellers.push({
      id: id++,
      isAdult: false,
      birthDay: '',
      sex: '',
      documents: [{
        type: props.isRussianPassport ? 'birthCertificate' : 'internationalPassport',
        firstName: '',
        firstNameLatin: '',
        middleName: '',
        lastName: '',
        lastNameLatin: '',
        series: '',
        seriesNumbers: '',
        seriesLetters: '',
        number: '',
        issueDate: '',
        expirationDate: '',
        issuingAuthority: '',
        address: ''
      }]
    })
  }

  travellers.value = newTravellers
  initializeErrors()
}

const initializeErrors = () => {
  travellers.value.forEach(traveller => {
    errors.value[traveller.id] = {
      documents: {
        0: {}
      },
      birthDay: '',
      sex: ''
    }
  })
}

// Валидация
const validateField = (traveller: Traveller, documentIndex: number, field: string) => {
  const document = traveller.documents[documentIndex]
  let error = ''

  if (field === 'birthDay') {
    if (!traveller.birthDay) {
      error = 'Укажите дату рождения'
    }
  } else if (field === 'sex') {
    if (!traveller.sex) {
      error = 'Укажите пол'
    }
  } else if (['lastName', 'firstName', 'middleName'].includes(field)) {
    if (!document[field as keyof TravellerDocument]) {
      error = `Поле обязательно для заполнения`
    }
  } else if (['lastNameLatin', 'firstNameLatin'].includes(field)) {
    if (!document[field as keyof TravellerDocument]) {
      error = `Поле обязательно для заполнения`
    } else {
      const value = document[field as keyof TravellerDocument] as string
      if (!/^[a-zA-Z]+$/.test(value)) {
        error = 'Используйте только латинские буквы'
      }
    }
  } else if (field === 'series' || field === 'number') {
    if (!document[field as keyof TravellerDocument]) {
      error = `Поле обязательно для заполнения`
    }
  } else if (field === 'expirationDate') {
    if (!document.expirationDate) {
      error = 'Укажите дату окончания действия'
    }
  } else if (field === 'issueDate') {
    if (!document.issueDate) {
      error = 'Укажите дату выдачи'
    }
  } else if (field === 'issuingAuthority') {
    if (!document.issuingAuthority) {
      error = 'Укажите орган выдачи'
    }
  } else if (field === 'address') {
    if (!document.address) {
      error = 'Укажите адрес регистрации'
    }
  } else if (field === 'seriesNumbers' || field === 'seriesLetters') {
    if (!document[field as keyof TravellerDocument]) {
      error = `Поле обязательно для заполнения`
    }
  }

  if (!errors.value[traveller.id]) {
    errors.value[traveller.id] = { documents: { [documentIndex]: {} } }
  }
  if (!errors.value[traveller.id].documents[documentIndex]) {
    errors.value[traveller.id].documents[documentIndex] = {}
  }

  if (field === 'birthDay' || field === 'sex') {
    errors.value[traveller.id][field] = error
  } else {
    errors.value[traveller.id].documents[documentIndex][field] = error
  }

  emit('update:travellers', travellers.value)
  checkValidation()
}

const getTravellerError = (traveller: Traveller, field: string): string => {
  return errors.value[traveller.id]?.[field] || ''
}

const getDocumentError = (traveller: Traveller, documentIndex: number, field: string): string => {
  return errors.value[traveller.id]?.documents[documentIndex]?.[field] || ''
}

const handleDocumentTypeChange = (traveller: Traveller, newType: string) => {
  traveller.documents[0].type = newType as TravellerDocument['type']
  // Очищаем ошибки при смене типа документа
  if (errors.value[traveller.id]) {
    errors.value[traveller.id].documents[0] = {}
  }
  emit('update:travellers', travellers.value)
}

const handleBirthDayChange = (traveller: Traveller, date: string) => {
  traveller.birthDay = date
  validateField(traveller, 0, 'birthDay')
}

// Транслитерация кириллицы в латиницу
const transliterate = (text: string): string => {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'YO',
    'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'YU', 'Я': 'YA'
  }
  return text.split('').map(char => map[char] || char).join('').toUpperCase()
}

const handleCyrillicNameChange = (traveller: Traveller, documentIndex: number, field: string, event?: Event) => {
  if (event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    
    // Автоматическая транслитерация в латиницу
    if (!traveller.documents[documentIndex].lastNameLatin && field === 'lastName') {
      traveller.documents[documentIndex].lastNameLatin = transliterate(value)
    }
    if (!traveller.documents[documentIndex].firstNameLatin && field === 'firstName') {
      traveller.documents[documentIndex].firstNameLatin = transliterate(value)
    }
  }
  
  validateField(traveller, documentIndex, field)
}

const checkValidation = () => {
  let isValid = true
  travellers.value.forEach(traveller => {
    if (!traveller.birthDay || !traveller.sex) {
      isValid = false
    }
    traveller.documents.forEach((doc) => {
      if (doc.type === 'internationalPassport') {
        if (!doc.lastNameLatin || !doc.firstNameLatin || !doc.series || !doc.number || !doc.expirationDate) {
          isValid = false
        }
      } else if (doc.type === 'passport') {
        if (!doc.lastName || !doc.firstName || !doc.middleName || !doc.series || !doc.number) {
          isValid = false
        }
        if (traveller.isCustomer && !props.isRussianPassport) {
          if (!doc.issueDate || !doc.issuingAuthority || !doc.address) {
            isValid = false
          }
        }
      } else if (doc.type === 'birthCertificate') {
        if (!doc.lastName || !doc.firstName || !doc.middleName || !doc.seriesNumbers || !doc.seriesLetters || !doc.number) {
          isValid = false
        }
      }
    })
  })
  emit('validate', isValid)
}

// Инициализация при монтировании
initializeTravellers()

// Отслеживание изменений в props
watch(() => [props.adultsCount, props.childrenCount], () => {
  initializeTravellers()
}, { immediate: false })

// Экспорт данных туристов
defineExpose({
  getTravellers: () => travellers.value,
  validateAll: () => {
    travellers.value.forEach(traveller => {
      validateField(traveller, 0, 'birthDay')
      validateField(traveller, 0, 'sex')
      traveller.documents.forEach((doc, docIndex) => {
        Object.keys(doc).forEach(key => {
          if (doc[key as keyof TravellerDocument] && key !== 'type') {
            validateField(traveller, docIndex, key)
          }
        })
      })
    })
    checkValidation()
  }
})
</script>

<style lang="scss" module src="./TouristForm.module.scss"></style>

