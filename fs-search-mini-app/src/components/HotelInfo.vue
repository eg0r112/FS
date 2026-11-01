<template>
  <div :class="$style.hotelInfo">
    <div :class="$style.header">
      <div :class="$style.stars">
        <span v-for="n in stars" :key="n" :class="$style.star">★</span>
      </div>
      <h1 :class="$style.name">
        {{ hotelName }}
        <span :class="$style.location">{{ location }}</span>
      </h1>
    </div>

    <div :class="$style.features">
      <div
        v-for="feature in topFeatures"
        :key="feature.id"
        :class="$style.feature"
      >
        <span :class="$style.featureIcon">{{ feature.icon }}</span>
        <span :class="$style.featureText">{{ feature.text }}</span>
      </div>
    </div>

    <!-- Краткое описание -->
    <div v-if="description" :class="$style.description">
      <h4 :class="$style.descriptionTitle">Описание отеля</h4>
      <p :class="$style.descriptionText">{{ description }}</p>
    </div>

    <!-- Блок "Подробнее об отеле" со всеми descriptionBlocks внутри -->
    <div v-if="descriptionBlocks && descriptionBlocks.length > 0" :class="$style.moreSection">
      <button 
        :class="[$style.moreButton, { [$style.expanded]: showDetails }]"
        @click="showDetails = !showDetails"
      >
        <span>{{ showDetails ? 'Скрыть подробности' : 'Подробнее об отеле' }}</span>
        <span :class="$style.moreIcon">{{ showDetails ? '▲' : '▼' }}</span>
      </button>
      
      <div v-if="showDetails" :class="$style.detailsContent">
        <!-- Быстрые теги из всех блоков -->
        <div :class="$style.quickTags">
          <div 
            v-for="block in descriptionBlocks" 
            :key="block.descriptionBlockTypeId"
            :class="[$style.quickTag, { [$style.activeTag]: expandedBlocks.has(block.descriptionBlockTypeId) }]"
            @click="scrollToBlock(block.descriptionBlockTypeId)"
          >
            <img 
              v-if="block.iconUrl" 
              :src="block.iconUrl" 
              :alt="block.name"
              :class="$style.quickTagIcon"
            />
            <span v-else :class="$style.quickTagEmoji">{{ getBlockEmoji(block.name) }}</span>
            <span>{{ block.name }}</span>
          </div>
        </div>

        <!-- Все блоки подробностей -->
        <div :class="$style.blocksSection">
          <div 
            v-for="block in descriptionBlocks" 
            :key="block.descriptionBlockTypeId"
            :ref="(el: any) => blockRefs[block.descriptionBlockTypeId] = el"
            :class="$style.descriptionBlock"
          >
            <button 
              :class="[$style.blockHeader, { [$style.expanded]: expandedBlocks.has(block.descriptionBlockTypeId) }]"
              @click="toggleBlock(block.descriptionBlockTypeId)"
            >
              <div :class="$style.blockTitle">
                <img 
                  v-if="block.iconUrl" 
                  :src="block.iconUrl" 
                  :alt="block.name"
                  :class="$style.blockIcon"
                />
                <span v-else :class="$style.blockIconEmoji">{{ getBlockEmoji(block.name) }}</span>
                <span>{{ block.name }}</span>
              </div>
              <span :class="$style.expandIcon">
                {{ expandedBlocks.has(block.descriptionBlockTypeId) ? '−' : '+' }}
              </span>
            </button>
            
            <div v-if="expandedBlocks.has(block.descriptionBlockTypeId)" :class="$style.blockContent">
              <!-- Фильтры/теги блока -->
              <div v-if="block.descriptionBlockFilters?.length" :class="$style.blockFilters">
                <div 
                  v-for="filter in block.descriptionBlockFilters" 
                  :key="filter.id"
                  :class="$style.blockFilter"
                >
                  <img 
                    v-if="filter.iconUrl" 
                    :src="filter.iconUrl" 
                    :alt="filter.name"
                    :class="$style.filterIcon"
                  />
                  <span>{{ filter.name }}</span>
                </div>
              </div>
              
              <!-- HTML контент блока -->
              <div 
                v-if="block.text"
                :class="$style.blockText"
                v-html="sanitizeHtml(block.text)"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { DescriptionBlock } from '@/types/tour-details'

interface HotelFeature {
  id: string
  icon: string
  text: string
}

interface Props {
  hotelName: string
  location: string
  stars?: number
  description?: string
  features?: HotelFeature[]
  descriptionBlocks?: DescriptionBlock[]
}

const props = withDefaults(defineProps<Props>(), {
  stars: 5,
  description: '',
  features: () => [],
  descriptionBlocks: () => []
})

// Показываем топ-5 features
const topFeatures = computed(() => props.features?.slice(0, 5) || [])

// Показывать ли блок "Подробнее"
const showDetails = ref(false)

// Рефы для скролла к блокам
const blockRefs = ref<Record<string, HTMLElement | null>>({})

// Отслеживаем развёрнутые блоки
const expandedBlocks = ref<Set<string>>(new Set())

const toggleBlock = (blockId: string) => {
  if (expandedBlocks.value.has(blockId)) {
    expandedBlocks.value.delete(blockId)
  } else {
    expandedBlocks.value.add(blockId)
  }
  // Триггерим реактивность
  expandedBlocks.value = new Set(expandedBlocks.value)
}

// Скролл к блоку и раскрытие его
const scrollToBlock = async (blockId: string) => {
  // Раскрываем блок
  if (!expandedBlocks.value.has(blockId)) {
    expandedBlocks.value.add(blockId)
    expandedBlocks.value = new Set(expandedBlocks.value)
  }
  
  await nextTick()
  
  // Скроллим к блоку
  const el = blockRefs.value[blockId]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Получаем эмодзи для блока по названию
const getBlockEmoji = (name: string): string => {
  const emojiMap: Record<string, string> = {
    'Бассейны': '🏊',
    'водные': '🏊',
    'SPA': '💆',
    'Спорт': '⚽',
    'Пляж': '🏖️',
    'Питание': '🍽️',
    'Дети': '👶',
    'Анимация': '🎭',
    'Развлечения': '🎉',
    'Интернет': '📶',
    'Wi-Fi': '📶',
    'Парковка': '🅿️'
  }
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return emoji
    }
  }
  return '✨'
}

// Простая санитизация HTML (убираем потенциально опасные теги)
const sanitizeHtml = (html: string): string => {
  // Убираем script и опасные атрибуты
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
}
</script>

<style lang="scss" module src="./HotelInfo.module.scss"></style>

