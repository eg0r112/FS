export const mockCities = [
  { id: 274286, name: 'Москва', country: 'Россия' },
  { id: 274287, name: 'Санкт-Петербург', country: 'Россия' },
  { id: 274288, name: 'Казань', country: 'Россия' },
  { id: 274289, name: 'Екатеринбург', country: 'Россия' }
]

export const mockCountries = [
  { id: 18803, name: 'Турция', ebgNodeId: 18803 },
  { id: 18804, name: 'Египет', ebgNodeId: 18804 },
  { id: 18805, name: 'ОАЭ', ebgNodeId: 18805 },
  { id: 18806, name: 'Таиланд', ebgNodeId: 18806 },
  { id: 18807, name: 'Мальдивы', ebgNodeId: 18807 }
]

export const mockDurations = [
  { value: 3, label: '3 ночи' },
  { value: 5, label: '5 ночей' },
  { value: 7, label: '7 ночей' },
  { value: 10, label: '10 ночей' },
  { value: 14, label: '14 ночей' }
]

export const mockStars = [
  { id: 5, name: '5 звезд' },
  { id: 4, name: '4 звезды' },
  { id: 3, name: '3 звезды' }
]

export const mockMealTypes = [
  { id: 8, name: 'Ультра все включено' },
  { id: 10004, name: 'Все включено' },
  { id: 10002, name: 'Полупансион' },
  { id: 10001, name: 'Завтрак' },
  { id: 10005, name: 'Без питания' }
]

export const mockPriceRange = {
  min: 55855,
  max: 1275874
}

// Mock full filters structure from API
export const mockFilters = {
  popularTypes: {
    name_ru: "Популярные фильтры",
    data: [
      { id: "10004", name_ru: "Все включено" },
      { id: "22bdacfc-c102-4435-b667-80a534b2f5fe", name_ru: "Бесплатный Wi-Fi" },
      { id: "04093636-6324-4c8e-878b-a27871420711", name_ru: "1-я береговая" }
    ]
  },
  price: {
    name_ru: "Стоимость",
    data: [
      { id: mockPriceRange.min, name_ru: "", paramName: "priceMin" },
      { id: mockPriceRange.max, name_ru: "", paramName: "priceMax" }
    ]
  },
  searchHotel: {
    name_ru: "Поиск отеля",
    data: []
  },
  regionsAndResorts: {
    name_ru: "Регионы и курорты",
    data: [
      { id: "001b0000-ac11-0242-ac07-08d908f02245", ebgNodeId: 296786, localizedName: "Аланья" },
      { id: "001b0000-ac11-0242-9946-08d908efc9d6", ebgNodeId: 104845, localizedName: "Анталья" },
      { id: "001b0000-ac11-0242-6d11-08d908f02139", ebgNodeId: 296056, localizedName: "Белек" }
    ]
  },
  categoryOfHotel: {
    name_ru: "Категория отеля",
    data: mockStars.map(s => ({ id: s.id, name_ru: s.name }))
  },
  isInstantConfirmation: {
    name_ru: "Только мгновенное подтверждение",
    data: []
  },
  mealTypes: {
    name_ru: "Питание",
    data: mockMealTypes.map(m => ({ id: m.id, name_ru: m.name }))
  },
  topHotels: {
    name_ru: "Рейтинг по отзывам",
    data: [
      { id: 4, name_ru: "Любой" },
      { id: 3, name_ru: "Безупречно: 5" },
      { id: 2, name_ru: "Очень хорошо: 4,5 и выше" },
      { id: 1, name_ru: "Хорошо: 4 и выше" }
    ]
  },
  placementTypes: {
    name_ru: "Тип размещения",
    data: [
      { id: "b913903c-6425-457b-9c49-50167dea06db", name_ru: "Курортный отель" },
      { id: "a759eeb1-e142-4d04-9e7b-a948bb77a93d", name_ru: "Апарт-отель" }
    ]
  },
  tourTypes: {
    name_ru: "Тип отдыха",
    data: [
      { id: "e58c8393-faed-4dd1-ae3e-fab790fb0293", name_ru: "Пляжный" },
      { id: "3bdf276f-f44e-4461-b58d-c5757bce03c8", name_ru: "Экскурсионный" }
    ]
  },
  distanceSea: {
    name_ru: "Расстояние до моря",
    data: [
      { id: "04093636-6324-4c8e-878b-a27871420711", name_ru: "1-я линия" },
      { id: "0a0f6fdd-64fe-44bb-887f-5d1b4ab76f58", name_ru: "2-я линия" },
      { id: "ec2d1f4e-24a3-4fec-8ef9-6c3d1a45994b", name_ru: "3-я линия" }
    ]
  },
  beach: {
    name_ru: "Пляж",
    data: [
      { id: "299884f2-4474-466a-8460-b37cc857f855", name_ru: "Песчаный пляж" },
      { id: "c725e833-6273-4b5d-93aa-00ac45a00c29", name_ru: "Песчано-галечный пляж" },
      { id: "c94248ee-ff53-4b10-98cb-84eac29d0198", name_ru: "Галечный пляж" },
      { id: "9500fe5a-ab97-407b-b236-e96ef6294cc4", name_ru: "Собственный пляж" }
    ]
  }
}

