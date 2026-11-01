import type { ApiResponse, Tour } from '@/types'
import type { ArrivalCountry, ArrivalResponse, CheckinMonth, DepartureCity, NightOption } from './fields'
import type { GetByHotelsRequest, GetByHotelsResponse, TourOffer } from '@/types/tour-details'
import type { TourFilters } from './tours'

const CITY_NAMES = [
  [274286, 'Москва'], [274287, 'Санкт-Петербург'], [274288, 'Казань'],
  [274289, 'Екатеринбург'], [274290, 'Новосибирск'], [274291, 'Краснодар'],
  [274292, 'Самара'], [274293, 'Ростов-на-Дону'], [274294, 'Уфа'],
  [274295, 'Пермь'], [274296, 'Воронеж'], [274297, 'Нижний Новгород'],
  [274298, 'Челябинск'], [274299, 'Тюмень'], [274300, 'Калининград'],
  [274301, 'Минеральные Воды'], [274302, 'Сочи'], [274303, 'Иркутск']
] as const

const COUNTRY_CATALOG = [
  { url: 'turkey', continent: 'europe', name: 'Турция', id: 18803, regions: ['Анталья', 'Аланья', 'Белек', 'Сиде', 'Кемер', 'Бодрум'], cities: ['Чолаклы', 'Кызылот', 'Лара', 'Текирова'] },
  { url: 'egypt', continent: 'africa', name: 'Египет', id: 18804, regions: ['Хургада', 'Шарм-эль-Шейх', 'Макади'], cities: ['Хургада', 'Наама-Бей'] },
  { url: 'uae', continent: 'asia', name: 'ОАЭ', id: 18805, regions: ['Дубай', 'Абу-Даби', 'Шарджа'], cities: ['Джумейра', 'Палм-Джумейра'] },
  { url: 'thailand', continent: 'asia', name: 'Таиланд', id: 18806, regions: ['Пхукет', 'Паттайя', 'Самуи'], cities: ['Ката', 'Карон'] },
  { url: 'maldives', continent: 'asia', name: 'Мальдивы', id: 18807, regions: ['Северный Мале', 'Ари-Атолл'], cities: ['Мале', 'Хулхумале'] },
  { url: 'cyprus', continent: 'europe', name: 'Кипр', id: 223800, regions: ['Пафос', 'Лимассол', 'Айя-Напа'], cities: ['Пафос', 'Лимассол'] },
  { url: 'greece', continent: 'europe', name: 'Греция', id: 223801, regions: ['Крит', 'Родос', 'Корфу'], cities: ['Херсониссос', 'Линдос'] },
  { url: 'tunisia', continent: 'africa', name: 'Тунис', id: 223802, regions: ['Хаммамет', 'Сусс', 'Джерба'], cities: ['Ясмин-Хаммамет'] },
  { url: 'vietnam', continent: 'asia', name: 'Вьетнам', id: 223803, regions: ['Нячанг', 'Фукуок', 'Дананг'], cities: ['Нячанг'] },
  { url: 'sri-lanka', continent: 'asia', name: 'Шри-Ланка', id: 223804, regions: ['Бентота', 'Негомбо'], cities: ['Бентота'] },
  { url: 'georgia', continent: 'europe', name: 'Грузия', id: 223991, regions: ['Батуми', 'Кобулети'], cities: ['Батуми'] },
  { url: 'russia', continent: 'europe', name: 'Россия', id: 210357, regions: ['Сочи', 'Крым', 'Анапа'], cities: ['Адлер', 'Ялта'] }
]

const MEALS = [
  { id: 8, name: 'AUI', name_ru: 'Ультра все включено', name_en: 'Ultra All Inclusive' },
  { id: 10004, name: 'AI', name_ru: 'Все включено', name_en: 'All Inclusive' },
  { id: 10003, name: 'FB', name_ru: 'Полный пансион', name_en: 'Full Board' },
  { id: 10002, name: 'HB', name_ru: 'Полупансион', name_en: 'Half Board' },
  { id: 10001, name: 'BB', name_ru: 'Завтрак', name_en: 'Bed & Breakfast' },
  { id: 10005, name: 'RO', name_ru: 'Без питания', name_en: 'Room Only' }
]

const BRANDS = ['FUN&SUN', 'Calimera', 'Barut', 'Rixos', 'Crystal', 'Selectum', 'TUI Blue', 'Kaya', 'Delphin', 'Maxx Royal']
const SUFFIXES = ['Resort', 'Palace', 'Beach', 'Club', 'Grand', 'Spa', 'Park']
const AMENITIES = ['Wi-Fi в номерах', 'Кондиционер', 'SPA-центр', 'Бассейн', 'Аквапарк', 'Пляж', 'Детский клуб']
const MONTHS_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']

type Hotel = {
  id: number
  name: string
  stars: number
  cityName: string
  countryName: string
  countryId: number
  photoUrl: string
  galleryUrls: string[]
  urlFriendlyName: string
  rating: number
  ratesCount: number
  instant: boolean
  basePrice: number
}

function seeded(n: number) {
  const x = Math.sin(n * 9999) * 10000
  return x - Math.floor(x)
}

function slug(value: string) {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
  }
  return value.toLowerCase().split('').map((ch) => map[ch] ?? (/[a-z0-9]/.test(ch) ? ch : ch === ' ' || ch === '-' ? '-' : '')).join('').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const hotels: Hotel[] = COUNTRY_CATALOG.flatMap((country, ci) =>
  Array.from({ length: 8 }, (_, i) => {
    const id = 770001 + ci * 8 + i
    const r = seeded(id)
    const city = country.cities[i % country.cities.length]
    const region = country.regions[i % country.regions.length]
    const stars = [5, 5, 4, 4, 3][Math.floor(r * 5)]
    const name = `${BRANDS[i % BRANDS.length]} ${city} ${SUFFIXES[(i + ci) % SUFFIXES.length]}`
    return {
      id,
      name,
      stars,
      cityName: city,
      countryName: country.name,
      countryId: country.id,
      photoUrl: `https://picsum.photos/seed/hotel${id}/1200/800`,
      galleryUrls: Array.from({ length: 5 }, (_, n) => `https://picsum.photos/seed/hotel${id}g${n}/1200/800`),
      urlFriendlyName: `hotel/${country.continent}/${country.url}/${slug(region)}/${slug(city)}/${slug(name)}`,
      rating: Math.round((3.9 + r * 1) * 100) / 100,
      ratesCount: 80 + Math.floor(r * 2000),
      instant: r > 0.3,
      basePrice: 45000 + Math.floor(r * 220000) + stars * 8000
    }
  })
)

export const mockCities: DepartureCity[] = CITY_NAMES.map(([ebgNodeId, localizedName]) => ({
  id: `city-${ebgNodeId}`,
  ebgNodeId,
  localizedName,
  countryEbgNodeId: 210357,
  countryLocalizedName: 'Россия'
}))

const mockCountries: ArrivalCountry[] = COUNTRY_CATALOG.map((c) => ({
  id: `country-${c.id}`,
  ebgNodeId: c.id,
  localizedName: c.name,
  priorityTours: 50,
  priorityHotels: 50,
  priorityExcursionTour: 10,
  urlName: c.url,
  isVisaRequired: false,
  openTours: true,
  openHotels: true,
  flightType: { id: 1, name: 'charter', localizedName: 'Чартер' },
  regions: c.regions.map((name, i) => ({ ebgNodeId: c.id * 10 + i + 1, localizedName: name }))
}))

export function mockDepartureCities() {
  return mockCities
}

export function mockArrival(arrivalPlaceName?: string): ArrivalResponse {
  const countries = arrivalPlaceName
    ? mockCountries.filter((c) => c.localizedName.toLowerCase().includes(arrivalPlaceName.toLowerCase()))
    : mockCountries
  return { countries, regions: [], cities: [], hotels: [] }
}

export function mockCheckins(): CheckinMonth[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const months: CheckinMonth[] = []
  for (let offset = 0; offset < 6; offset++) {
    const first = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const mondayBased = (first.getDay() + 6) % 7
    const days: CheckinMonth['days'] = []
    for (let i = 0; i < mondayBased; i++) {
      days.push({ checkin: '', classes: [], dayOfTheWeek: 0, isCharter: false, isRegular: false, isReservation: false, iso: '', number: 0, pastDay: false, year: '', month: '', is_nullable: true })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(first.getFullYear(), first.getMonth(), day)
      const past = date < today
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dow = date.getDay()
      days.push({
        checkin: iso,
        classes: [],
        dayOfTheWeek: (dow + 6) % 7 + 1,
        isCharter: !past && dow !== 1 && dow !== 3,
        isRegular: !past && dow !== 0,
        isReservation: !past && day % 4 === 0,
        iso,
        number: day,
        pastDay: past,
        year: String(date.getFullYear()),
        month: MONTHS_RU[date.getMonth()],
        is_nullable: false
      })
    }
    months.push({
      year: String(first.getFullYear()),
      month: MONTHS_RU[first.getMonth()],
      first_date: `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-01`,
      days
    })
  }
  return months
}

export function mockNights(): NightOption[] {
  return Array.from({ length: 21 }, (_, i) => {
    const night = i + 1
    return { night, selected: night === 7, disabled: night < 3 || night > 19 }
  })
}

function buildTour(hotel: Hotel, startDate: string, nights: number, adults: number): Tour {
  const meal = MEALS[hotel.id % MEALS.length]
  const price = hotel.basePrice + nights * 3500 + adults * 4200
  const oldValue = Math.round(price * 1.28)
  const iso = `${startDate}T00:00:00Z`
  return {
    md5_id: `mock-${hotel.id}-${startDate}-${nights}`,
    startDate: iso,
    isInstantConfirmation: hotel.instant,
    hotel: {
      id: hotel.id,
      geoId: `geo-${hotel.id}`,
      name: hotel.name,
      stars: hotel.stars,
      cityName: hotel.cityName,
      countryName: hotel.countryName,
      photoUrl: hotel.photoUrl,
      galleryUrls: hotel.galleryUrls,
      urlFriendlyName: hotel.urlFriendlyName,
      topHotels: {
        rating: String(hotel.rating),
        ratesCount: hotel.ratesCount,
        mealRating: String(hotel.rating + 0.1),
        serviceRating: String(hotel.rating - 0.05),
        hotelRating: hotel.rating
      },
      priorityFilters: AMENITIES.slice(0, 3).map((name, i) => ({
        id: `am-${hotel.id}-${i}`,
        name,
        is_priority: true,
        priority: i + 1
      }))
    },
    priceOffer: {
      tourTypeId: 36,
      hotelAvailability: hotel.instant ? 'YYYY' : 'YNYN',
      meal: [{ id: meal.id, name: meal.name, name_ru: meal.name_ru, name_en: meal.name_en, translate: meal.name }],
      flightTypes: [{ id: 1, name: 'charter', startDate: iso }],
      price: [{
        value: price, oldValue, salePrice: 22, currencyAlias: 'RUB', currencyId: '1', startDate: iso,
        flightTypeId: 1, flightTypeName: 'charter', mealId: meal.id, mealName: meal.name, mealNameEn: meal.name_en, nightsCount: String(nights)
      }],
      fullPrice: [{
        value: price + 18000, oldValue: oldValue + 18000, salePrice: 22, currencyAlias: 'RUB', currencyId: '1', startDate: iso,
        flightTypeId: 1, flightTypeName: 'charter', mealId: meal.id, mealName: meal.name, mealNameEn: meal.name_en, nightsCount: String(nights)
      }],
      supplement: [{ adult: 9000, child: 4500, currency: 1, startDate: iso, flightTypeId: 1, flightTypeName: 'charter', mealId: meal.id, mealName: meal.name, nightsCount: String(nights) }],
      people: { adults: String(adults) },
      departureTimeOptions: ['02:45', '07:00', '12:00', '16:55', '21:30']
    }
  }
}

export function mockSearchTours(params: SearchParamsLike, filters?: TourFilters): ApiResponse {
  const nights = params.minNightsCount || 7
  const adults = params.adults || 2
  const startDate = params.minStartDate || new Date().toISOString().slice(0, 10)
  let list = hotels.filter((h) => h.countryId === params.arrivalCountryId)
  if (list.length === 0) list = hotels.slice(0, 16)

  if (filters?.stars?.length) {
    const stars = filters.stars.map(Number)
    list = list.filter((h) => stars.includes(h.stars))
  }
  if (filters?.hotelName) {
    const q = filters.hotelName.toLowerCase()
    list = list.filter((h) => h.name.toLowerCase().includes(q))
  }

  let tours = list.map((h) => buildTour(h, startDate, nights, adults))
  if (filters?.priceMin) tours = tours.filter((t) => t.priceOffer.price[0].value >= filters.priceMin!)
  if (filters?.priceMax) tours = tours.filter((t) => t.priceOffer.price[0].value <= filters.priceMax!)
  if (filters?.isInstantConfirmation) tours = tours.filter((t) => t.isInstantConfirmation)

  const prices = tours.map((t) => t.priceOffer.price[0].value)
  const min = prices.length ? Math.min(...prices) : 40000
  const max = prices.length ? Math.max(...prices) : 400000
  const country = mockCountries.find((c) => c.ebgNodeId === params.arrivalCountryId) || mockCountries[0]

  return {
    tours,
    filters: {
      md5_id: 'mock-filters',
      country: {
        id: country.id,
        ebgNodeId: country.ebgNodeId,
        localizedName: country.localizedName,
        urlName: country.urlName,
        caseForms: {
          nominativeCase: country.localizedName,
          genitiveCase: country.localizedName,
          dativeCase: country.localizedName,
          accusativeCase: country.localizedName,
          instrumentalCase: country.localizedName,
          prepositionalCase: country.localizedName
        }
      },
      popularTypes: { name_ru: 'Популярные фильтры', name: 'popularTypes', paramName: 'popularTypes', translate: 'popularTypes', sortOrder: 1, data: [{ id: '10004', name_ru: 'Все включено', translate: 'AI', paramName: 'mealTypes', sortOrder: 1 }] },
      enrichment: '',
      price: {
        name_ru: 'Стоимость', name: 'price', paramName: 'price', translate: 'price', sortOrder: 2,
        data: [
          { id: min, name_ru: '', translate: '', paramName: 'priceMin', sortOrder: 1 },
          { id: max, name_ru: '', translate: '', paramName: 'priceMax', sortOrder: 2 }
        ]
      },
      searchHotel: { name_ru: 'Поиск отеля', name: 'hotelName', paramName: 'hotelName', translate: 'hotelName', sortOrder: 3, data: [] },
      regionsAndResorts: {
        name_ru: 'Регионы и курорты', name: 'regionsAndResorts', translate: 'regions', sortOrder: 4,
        data: country.regions.map((r) => ({ id: String(r.ebgNodeId), ebgNodeId: r.ebgNodeId, localizedName: r.localizedName, urlName: slug(r.localizedName), children: [] }))
      },
      categoryOfHotel: { name_ru: 'Категория отеля', name: 'stars', paramName: 'stars', translate: 'stars', sortOrder: 5, data: [{ id: 5, name_ru: '5 звезд', sortOrder: 1 }, { id: 4, name_ru: '4 звезды', sortOrder: 2 }, { id: 3, name_ru: '3 звезды', sortOrder: 3 }] },
      isInstantConfirmation: { name_ru: 'Только мгновенное подтверждение', name: 'isInstantConfirmation', paramName: 'isInstantConfirmation', translate: 'isInstantConfirmation', sortOrder: 6, data: [] },
      mealTypes: { name_ru: 'Питание', name: 'mealTypes', paramName: 'mealTypes', translate: 'mealTypes', sortOrder: 7, data: MEALS.map((m, i) => ({ id: m.id, name_ru: m.name_ru, name: m.name, name_en: m.name_en, translate: m.name, sortOrder: i + 1 })) },
      topHotels: { name_ru: 'Рейтинг по отзывам', name: 'topHotels', paramName: 'topHotels', translate: 'topHotels', sortOrder: 8, data: [{ id: 4, name_ru: 'Любой', sortOrder: 1 }] },
      placementTypes: { name_ru: 'Тип размещения', name: 'placementTypes', paramName: 'placementTypes', translate: 'placementTypes', sortOrder: 9, data: [] },
      tourTypes: { name_ru: 'Тип отдыха', name: 'tourTypes', paramName: 'tourTypes', translate: 'tourTypes', sortOrder: 10, data: [] },
      distanceSea: { name_ru: 'Расстояние до моря', name: 'distanceSea', paramName: 'distanceSea', translate: 'distanceSea', sortOrder: 11, data: [] },
      beach: { name_ru: 'Пляж', name: 'beach', paramName: 'beach', translate: 'beach', sortOrder: 12, data: [] },
      funSunHotels: { name_ru: 'Отели FUN&SUN', name: 'funSunHotels', paramName: 'funSunHotels', translate: 'funSunHotels', sortOrder: 13, data: [] },
      locations: { name_ru: 'Расположение', name: 'locations', paramName: 'locations', translate: 'locations', sortOrder: 14, data: [] },
      hotelTypes: { name_ru: 'Тип отеля', name: 'hotelTypes', paramName: 'hotelTypes', translate: 'hotelTypes', sortOrder: 15, data: [] },
      forKids: { name_ru: 'Для детей', name: 'forKids', paramName: 'forKids', translate: 'forKids', sortOrder: 16, data: [] },
      flightTypes: { name_ru: 'Тип рейса', name: 'flightTypes', paramName: 'flightTypes', translate: 'flightTypes', sortOrder: 17, data: [{ id: 'charter', name_ru: 'Чартер', sortOrder: 1 }] },
      waterActivities: { name_ru: 'Водные развлечения', name: 'waterActivities', paramName: 'waterActivities', translate: 'waterActivities', sortOrder: 18, data: [] },
      additionally: { name_ru: 'Дополнительно', name: 'additionally', paramName: 'additionally', translate: 'additionally', sortOrder: 19, data: [] },
      placementFeatures: { name_ru: 'Особенности размещения', name: 'placementFeatures', paramName: 'placementFeatures', translate: 'placementFeatures', sortOrder: 20, data: [] }
    },
    other: { count_tours: tours.length, total_counts: tours.length, page: 1, totalPage: 1, percent: 100 }
  }
}

type SearchParamsLike = {
  arrivalCountryId: number
  minStartDate: string
  minNightsCount: number
  adults: number
}

export function mockHotelOffers(req: GetByHotelsRequest): GetByHotelsResponse {
  const hotel = hotels.find((h) => req.hotelIds?.includes(h.id)) || hotels[0]
  const nights = parseInt(req.nightsFrom || '7', 10) || 7
  const adults = parseInt(req.adults || '2', 10) || 2
  const start = req.minStartDate || new Date().toISOString().slice(0, 10)
  const rooms = [
    { id: 101, name: 'Standard Room', isFakeId: false },
    { id: 102, name: 'Superior Sea View', isFakeId: false },
    { id: 103, name: 'Family Room', isFakeId: false },
    { id: 104, name: 'Deluxe Suite', isFakeId: false },
    { id: 105, name: 'Villa with Pool', isFakeId: false }
  ]
  const meals = MEALS.map((m) => ({
    mealTypeGroupId: m.id,
    mealTypeId: m.id,
    mealTypeGroupName: m.name_ru,
    mealTypeName: m.name,
    isFakeId: false
  }))
  const offers: TourOffer[] = []
  let index = 0
  for (const room of rooms) {
    for (const meal of MEALS.slice(0, 4)) {
      const value = hotel.basePrice + room.id * 180 + (meal.id % 100) * 90 + index * 500
      const end = new Date(start)
      end.setDate(end.getDate() + nights)
      const endStr = end.toISOString().slice(0, 10)
      offers.push({
        hotelId: hotel.id,
        hotelName: hotel.name,
        stars: hotel.stars,
        categoryId: hotel.stars,
        tourKey: `offer-${hotel.id}-${index}`,
        tourName: `${hotel.name} / ${room.name} / ${meal.name}`,
        tourId: 900000 + hotel.id + index,
        partnerIncoming: 'FS',
        partnerIncomingKey: 1,
        townId: hotel.id,
        townName: hotel.cityName,
        tourStartDate: start,
        tourEndDate: endStr,
        checkinDate: start,
        checkoutDate: endStr,
        daysCount: nights + 1,
        nightsCount: nights,
        hotelNightsCount: nights,
        roomId: room.id,
        mealId: meal.id,
        accomodation: { id: adults, name: `${adults} взрослых`, latinName: `${adults}ADL` },
        price: { value, oldValue: Math.round(value * 1.3), currencyAlias: 'RUB', currencyId: 1 },
        supplement: { adult: 8000, child: 4000, currency: 1 },
        fullPrice: { value: value + 18000, oldValue: Math.round(value * 1.3) + 18000, currencyAlias: 'RUB', currencyId: 1 },
        isInstantConfirmation: hotel.instant,
        isRegularFlight: index % 3 === 0,
        tourType: { id: 36, name: 'Пляжный' },
        paxes: { adultsCount: adults, childrenCount: 0, infantsCount: 0 },
        index,
        programType: { key: 1, name: 'Пакетный тур', nameAlt: 'Package', icon: '', url: '' },
        color: null,
        freights: null,
        availablePromos: [],
        spo: '',
        hasPacketTransfer: true,
        withoutPromo: false,
        external: 0,
        listTime: new Date().toISOString()
      })
      index++
    }
  }
  return {
    rooms,
    meals,
    offers,
    fullHotel: {
      id: `geo-${hotel.id}`,
      localizedName: hotel.name,
      ebgNodeId: hotel.id,
      objectType: 'Hotel',
      address: `${hotel.cityName}, ${hotel.countryName}`,
      phone: '+90 242 000 00 00',
      fax: '',
      website: 'https://fstravel.com',
      email: 'hotel@example.com',
      constructionYear: 2008,
      renovationYear: 2022,
      distanceToTheBeach: '50 м',
      distanceToAirport: '45 км',
      latitude: 36.85,
      longitude: 31.1,
      urlName: hotel.urlFriendlyName,
      shortText: `${hotel.name} — ${hotel.stars}* в ${hotel.cityName}`,
      generalDescription: `${hotel.name} — отель ${hotel.stars}* в ${hotel.cityName}, ${hotel.countryName}.`,
      images: hotel.galleryUrls.map((src, i) => ({
        id: `img-${hotel.id}-${i}`,
        resolutionType: 'large',
        imageType: i === 0 ? 'Main' : 'Gallery',
        description: hotel.name,
        sortOrder: i,
        src
      })),
      hotelCategory: { id: hotel.stars, name: `${hotel.stars}*`, displayName: `${hotel.stars} звезды` },
      topHotels: {
        id: hotel.id,
        rating: hotel.rating,
        mealRating: hotel.rating + 0.1,
        ratesCount: hotel.ratesCount,
        hotelRating: hotel.rating,
        serviceRating: hotel.rating - 0.05
      },
      typeTags: [{ id: 1, name: 'Beach', localizedName: 'Пляжный' }],
      restTypes: [{ id: 1, name: 'Пляжный', isDeleted: false }],
      recommendations: [{ id: 1, name: 'Для пар' }, { id: 2, name: 'Для семей' }],
      roomTypes: [],
      descriptionBlocks: []
    }
  }
}

export function mockObjectByUrlName(urlName: string) {
  const hotel = hotels.find((h) => h.urlFriendlyName === urlName || h.urlFriendlyName.endsWith(urlName)) || hotels[0]
  return mockHotelOffers({
    hotelIds: [hotel.id],
    clientId: 'b2c:ru',
    lang: 'ru',
    departureCityId: '274286',
    arrivalCountryId: String(hotel.countryId),
    minStartDate: new Date().toISOString().slice(0, 10),
    maxStartDate: new Date().toISOString().slice(0, 10),
    nightsFrom: '7',
    nightsTo: '7',
    adults: '2',
    children: [],
    currency: '1',
    catclaim: '',
    programTypes: []
  }).fullHotel
}
