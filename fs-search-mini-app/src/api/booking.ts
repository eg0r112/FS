import axios from 'axios'
import { USE_MOCK_FUNSUN, sleep } from './mockMode'

const API_GATE_MARKET = import.meta.env.VITE_API_GATE_MARKET || 'https://apigate.fstravel.com'
const API_SAMOTOUR_PROXY = import.meta.env.VITE_API_SAMOTOUR_PROXY || 'https://api.funsun.ru'

export interface CheckTourAvailabilityRequest {
  departureCityId: number
  arrivalCountryId: number
  tourId: number
  nightsCount: number
  checkinDate: string
}

export interface CheckTourAvailabilityResponse {
  isAvailable: boolean
  [key: string]: any
}

/**
 * Проверка доступности тура
 */
export async function checkTourAvailability(
  data: CheckTourAvailabilityRequest
): Promise<CheckTourAvailabilityResponse> {
  try {
    const url = `${API_SAMOTOUR_PROXY}/DbFunctions/reserve-availability`
    
    const response = await axios.get(url, {
      params: data,
      headers: {
        'X-User-Agent': 'mopsapp_b2c_ru'
      }
    })

    return response.data
  } catch (error) {
    console.error('Failed to check tour availability:', error)
    throw error
  }
}

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
  birthDay: string
  sex: 'male' | 'female' | ''
  documents: TravellerDocument[]
  email?: string
  phones?: string
}

export interface CreateDraftRequest {
  // Полная структура как в booking проекте
  UTM?: null
  aeroexpress?: any[]
  certificateInformation?: null
  certificates?: any[]
  claimType?: null
  clientIp?: null
  customerInfo?: {
    email: string
    phones: string
    documents?: TravellerDocument[]
    birthDay?: string
    sex?: string
  } | null
  draftType?: string
  excursions?: any[]
  flightDetails?: {}
  flights?: any[]
  hotels?: any[]
  insurance?: any[]
  isOneClickBooking?: boolean
  loyality?: {
    touristPosition?: number
    cardNumber?: null
    accrualPercentage?: number
    deductedPoints?: number
    salesPoints?: number
  } | null
  orderNumber?: null
  ownerId?: null
  partPassId?: null
  partnerComment?: null
  partnerId?: null
  reservationType?: string
  services?: any[]
  tours?: Array<{
    id?: string
    tourId: number
    roomId: number
    mealId: number
    nightsCount: number
    daysCount?: number
    checkinDate: string
    checkoutDate: string
    startDate?: string
    endDate?: string
    paxes: {
      adultsCount: number
      childrenCount: number
      infantsCount?: number
      childrenAge?: number[]
    }
    travellers: Traveller[]
    ClaimDocumentJson?: any // Большой объект с данными о туре (может быть null если нет geo object)
    price?: number
    currency?: {
      currencyId?: number
      currencyAlias?: string
    }
    hotelId?: number
    countryId?: number
    cityId?: number
    name?: string
    hotelName?: string
    countryName?: string
    cityName?: string
    roomName?: string
    mealName?: string
    programType?: {
      id?: number
      name?: string
    }
    programTypeName?: string
    imgUrl?: string | null
    insurances?: any[]
    services?: any[]
    visaOptions?: any[]
    isRegularFlight?: boolean | null
    isVisaRequired?: boolean
    promoCode?: string | null
    selectedFlightOptionId?: string | null
    flightSeats?: any[]
    selectedHotels?: any
    tourTypeId?: number
    packetType?: string
  }>
  transfers?: any[]
  userAgent?: null
  userInfo?: null // В booking userInfo не отправляется, только используется для заполнения customerInfo
}

export interface DraftResponse {
  id: string
  [key: string]: any
}

/**
 * Создание или обновление корзины (Draft)
 * В booking используется /api/v2/Draft/createOrUpdate
 * Формирует полную структуру данных как в booking проекте
 */
export async function createOrUpdateDraft(
  data: CreateDraftRequest,
  authToken?: string
): Promise<DraftResponse> {
  if (USE_MOCK_FUNSUN) {
    await sleep(250)
    const id = `mock-draft-${Date.now()}`
    return { id, draftId: id }
  }

  try {
    // Используем v2 как в booking проекте
    const url = `${API_GATE_MARKET}/api/v2/Draft/createOrUpdate`
    
    // Формируем полную структуру данных как в booking проекте
    // В booking используется getters.getBasket, который возвращает полную структуру
    const basketData: any = {
      UTM: null,
      aeroexpress: [],
      certificateInformation: null,
      certificates: [],
      claimType: null,
      clientIp: null,
      customerInfo: data.customerInfo || null,
      draftType: data.draftType || 'FunSun',
      excursions: [],
      flightDetails: {},
      flights: [],
      hotels: [],
      insurance: [],
      isOneClickBooking: false,
      loyality: {
        touristPosition: 0,
        cardNumber: null,
        accrualPercentage: 0,
        deductedPoints: 0,
        salesPoints: 0
      },
      orderNumber: null,
      ownerId: null,
      partPassId: null,
      partnerComment: null,
      partnerId: null,
      reservationType: 'Regular',
      services: [],
      tours: data.tours || [],
      transfers: [],
      userAgent: null,
      userInfo: null // В booking userInfo не отправляется, только используется для заполнения customerInfo
    }
    
    const headers: Record<string, string> = {
      'X-User-Agent': 'mopsapp_b2c_ru',
      'Content-Type': 'application/json'
    }
    
    // Если есть токен авторизации, добавляем его в заголовки (как в booking)
    if (authToken) {
      headers['Authorization'] = authToken
    }
    
    const response = await axios.post(url, basketData, {
      headers,
      validateStatus: (status) => {
        // Принимаем все статусы для обработки ошибок
        return status >= 200 && status < 600
      }
    })

    // Статус 0 обычно означает CORS ошибку или что запрос не был отправлен
    if (response.status === 0) {
      console.error('Request failed with status 0 (likely CORS or network error):', {
        url,
        data,
        headers
      })
      throw new Error('Ошибка сети при создании корзины. Проверьте подключение к интернету.')
    }

    if (response.status >= 400) {
      console.error('Failed to create/update draft:', {
        status: response.status,
        data: response.data,
        requestData: data
      })
      const errorMessage = response.data?.message || response.data?.error || `Ошибка создания корзины: ${response.status}`
      throw new Error(errorMessage)
    }

    return response.data
  } catch (error: any) {
    console.error('Failed to create/update draft:', error)
    // Если это ошибка сети (статус 0), пробрасываем специальное сообщение
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      throw new Error('Ошибка сети при создании корзины. Проверьте подключение к интернету.')
    }
    if (error.message) {
      throw error
    }
    throw new Error('Ошибка при создании корзины')
  }
}

export interface CheckReservationRequest {
  claim: {
    claimDocument: {
      buyer?: any
      peoples: any[]
    }
  }
  clientId?: string
  userAgent?: string
}

export interface CheckReservationResponse {
  status: number
  data?: any
  [key: string]: any
}

/**
 * Проверка резервирования (для предоплаты)
 */
export async function checkReservation(
  data: CheckReservationRequest
): Promise<CheckReservationResponse> {
  try {
    const url = `${API_GATE_MARKET}/api/PacketTour/CheckReservation`
    
    const payload = {
      ...data,
      clientId: data.clientId || 'b2c:ru',
      userAgent: data.userAgent || 'mopsapp_b2c_ru'
    }
    
    const response = await axios.post(url, payload, {
      headers: {
        'X-User-Agent': 'mopsapp_b2c_ru'
      },
      validateStatus: (status) => {
        return status === 500 || status === 200
      }
    })

    return {
      status: response.status,
      data: response.data
    }
  } catch (error) {
    console.error('Failed to check reservation:', error)
    throw error
  }
}

export interface ReserveRequest {
  draftId: string
  crmOpportunityId?: string
}

export interface ReserveResponse {
  status: string
  [key: string]: any
}

/**
 * Бронирование тура
 */
export async function reserve(
  data: ReserveRequest,
  authToken?: string
): Promise<ReserveResponse> {
  if (USE_MOCK_FUNSUN) {
    await sleep(200)
    return { status: 'reserved', draftId: data.draftId }
  }

  try {
    const url = `${API_GATE_MARKET}/api/Draft/reserve`
    
    const headers: Record<string, string> = {
      'X-User-Agent': 'mopsapp_b2c_ru'
    }
    
    // Если есть токен авторизации, добавляем его в заголовки
    if (authToken) {
      headers['Authorization'] = authToken
    }
    
    const response = await axios.post(url, data, {
      headers
    })

    return response.data
  } catch (error) {
    console.error('Failed to reserve:', error)
    throw error
  }
}

export interface PreorderRequest {
  tourId: number
  tourName?: string
  countryName?: string
  departureCityName?: string
  startDate: string
  endDate: string
  nightsCount: number
  price: number
  adultsCount: number
  childrenCount: number
  customerPhone: string
  customerEmail?: string
  programTypeName?: string
  hotelId?: number
  customerInfo?: {
    birthDay?: string
    sex?: string
    name?: string
  }
}

export interface PreorderResponse {
  [key: string]: any
}

/**
 * Создание предзаказа для MindBox (preorder)
 * Вызывается перед createOrUpdate, после регистрации/авторизации
 * Аналог fetchMindBoxPreorder из booking проекта
 */
export async function createPreorder(
  data: PreorderRequest
): Promise<PreorderResponse | null> {
  if (USE_MOCK_FUNSUN) {
    await sleep(150)
    return { ok: true, tourId: data.tourId }
  }

  try {
    const url = `${API_GATE_MARKET}/api/v1/order/preorder`
    
    // Формируем данные в формате MindBox (упрощенная версия)
    const preorderData = {
      pointOfContact: 'b2c:ru',
      customer: {
        mobilePhone: data.customerPhone.replace(/\+/g, ''),
        ...(data.customerEmail && { email: data.customerEmail }),
        ...(data.customerInfo?.birthDay && data.customerInfo.birthDay !== '0001-01-01' && { birthDate: data.customerInfo.birthDay }),
        ...(data.customerInfo?.sex && { sex: data.customerInfo.sex }),
        customFields: {
          subscribeSourceFS: 'mopsapp_b2c_ru'
        }
      },
      order: {
        customFields: {
          adult: data.adultsCount,
          child: data.childrenCount,
          infant: 0,
          nights: data.nightsCount,
          pax: data.adultsCount + data.childrenCount,
          dataBeg: data.startDate,
          dataEnd: data.endDate,
          tourName: data.tourName || 'Тур',
          tourStateName: data.countryName || '',
          townFrom: data.departureCityName || '',
          typeTariff: data.programTypeName || null,
          bookingWindow: Math.ceil((new Date(data.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          promocodeFS: false,
          chosePoints: false
        },
        totalPrice: data.price,
        lines: [
          {
            basePricePerItem: data.price,
            lineNumber: 1,
            quantity: 1,
            product: {
              ids: {
                website: data.hotelId?.toString() || data.tourId.toString()
              }
            },
            customFields: {
              peopleEmail: data.customerEmail || null,
              peopleName: data.customerInfo?.name || null,
              peopleBorn: data.customerInfo?.birthDay && data.customerInfo.birthDay !== '0001-01-01' ? data.customerInfo.birthDay : null,
              peopleMale: data.customerInfo?.sex || null
            },
            status: {
              ids: {
                externalId: 'Не оплачено'
              }
            }
          }
        ],
        transaction: {
          ids: {
            externalId: `${data.tourId}_${Math.ceil(new Date().getTime() / 1000)}`
          }
        }
      }
    }
    
    const response = await axios.post(url, preorderData, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-User-Agent': 'mopsapp_b2c_ru'
      }
    })

    return response.data
  } catch (error) {
    console.error('Failed to create preorder:', error)
    // Preorder не критичен, возвращаем null при ошибке
    return null
  }
}

export interface StatusRequest {
  draftId?: string
}

export interface StatusResponse {
  isSuccess: boolean
  status: string
  backOfficeId?: string
  draftId?: string
  [key: string]: any
}

/**
 * Проверка статуса бронирования
 * Аналог fetchBasketStatus из booking проекта
 */
export async function getBookingStatus(
  data: StatusRequest,
  authToken?: string
): Promise<StatusResponse> {
  if (USE_MOCK_FUNSUN) {
    await sleep(150)
    return {
      isSuccess: true,
      status: 'booked',
      draftId: data.draftId,
      backOfficeId: String(900000 + Math.floor(Math.random() * 9999))
    }
  }

  try {
    const url = `${API_GATE_MARKET}/api/Draft/status`
    
    const headers: Record<string, string> = {
      'X-User-Agent': 'mopsapp_b2c_ru'
    }
    
    // Если есть токен авторизации, добавляем его в заголовки
    if (authToken) {
      headers['Authorization'] = authToken
    }
    
    const response = await axios.get(url, {
      params: {
        draftId: data.draftId // В booking используется draftId (не DraftId)
      },
      headers
    })

    return response.data
  } catch (error) {
    console.error('Failed to get booking status:', error)
    throw error
  }
}

// ==================== PacketTour запросы ====================

export interface GetPacketRequest {
  claim: string // claim ID (tour.id.replace('TUI::', ''))
  clientId?: string
}

export interface GetPacketResponse {
  claim?: {
    claimDocument: any
  }
  errors?: any[]
  status?: number
  [key: string]: any
}

/**
 * Получение пакета тура
 * Аналог fetchTourGetPacket из booking проекта
 * Используется для получения ClaimDocumentJson перед созданием корзины
 */
export async function getPacket(
  data: GetPacketRequest
): Promise<GetPacketResponse> {
  try {
    const url = `${API_GATE_MARKET}/api/PacketTour/GetPacket`
    
    const payload = {
      ...data,
      clientId: data.clientId || 'b2c:ru'
    }
    
    const response = await axios.post(url, payload, {
      headers: {
        'X-User-Agent': 'mopsapp_b2c_ru'
      },
      validateStatus: (status) => {
        // Принимаем 200 и 500 как в booking
        return status === 500 || status === 200
      }
    })

    return response.data
  } catch (error) {
    console.error('Failed to get packet:', error)
    throw error
  }
}

export interface GetReservationPriceRequest {
  claim: {
    claimDocument: any
    notes?: any
  }
  clientId?: string
  userAgent?: string
}

export interface GetReservationPriceResponse {
  claim?: {
    claimDocument: {
      moneys?: Array<{
        price: number
        currencyKey: number
        currency: string
      }>
    }
  }
  errors?: any[]
  [key: string]: any
}

/**
 * Уточнение цены тура
 * Аналог fetchTourGetReservationPrice из booking проекта
 * Вызывается перед saveBasket для получения актуальной цены
 */
export async function getReservationPrice(
  data: GetReservationPriceRequest
): Promise<GetReservationPriceResponse> {
  try {
    // В booking используется process.env.MIX_API_TOUR_RESERVATION_SERVICE
    // Но для нас это может быть тот же API_GATE_MARKET или отдельный сервис
    const API_TOUR_RESERVATION_SERVICE = import.meta.env.VITE_API_TOUR_RESERVATION_SERVICE || API_GATE_MARKET
    const url = `${API_TOUR_RESERVATION_SERVICE}/GetReservationPrice`
    
    // Временный хардкод для решения 500 из-за пустого claim.note (как в booking)
    const payload = { ...data }
    if (payload.claim && Array.isArray(payload.claim.notes) && payload.claim.notes.length === 0) {
      payload.claim.notes = {}
    }
    
    payload.clientId = payload.clientId || 'b2c:ru'
    payload.userAgent = payload.userAgent || 'mopsapp_b2c_ru'
    
    const response = await axios.post(url, payload, {
      headers: {
        'X-User-Agent': 'mopsapp_b2c_ru'
      },
      validateStatus: (status) => {
        // Принимаем 200 и 500 как в booking
        return status === 500 || status === 200
      }
    })

    return response.data
  } catch (error) {
    console.error('Failed to get reservation price:', error)
    throw error
  }
}

export interface ActualizePacketRequest {
  claim: {
    claimDocument: any
    notes?: any
  }
  clientId?: string
  userAgent?: string
}

export interface ActualizePacketResponse {
  claim?: {
    claimDocument: any
  }
  errors?: any[]
  [key: string]: any
}

/**
 * Актуализация пакета тура
 * Аналог fetchTourActualizePacket из booking проекта
 */
export async function actualizePacket(
  data: ActualizePacketRequest
): Promise<ActualizePacketResponse> {
  try {
    const API_TOUR_RESERVATION_SERVICE = import.meta.env.VITE_API_TOUR_RESERVATION_SERVICE || API_GATE_MARKET
    const url = `${API_TOUR_RESERVATION_SERVICE}/ActualizePacket`
    
    // Временный хардкод для решения 500 из-за пустого claim.note
    const payload = { ...data }
    if (payload.claim && Array.isArray(payload.claim.notes) && payload.claim.notes.length === 0) {
      payload.claim.notes = {}
    }
    
    payload.clientId = payload.clientId || 'b2c:ru'
    payload.userAgent = payload.userAgent || 'mopsapp_b2c_ru'
    
    const response = await axios.post(url, payload, {
      headers: {
        'X-User-Agent': 'mopsapp_b2c_ru'
      },
      validateStatus: (status) => {
        return status === 500 || status === 200
      }
    })

    return response.data
  } catch (error) {
    console.error('Failed to actualize packet:', error)
    throw error
  }
}

export interface GetReservationServicesRequest {
  claim: {
    claimDocument: any
    notes?: any
  }
  clientId?: string
}

export interface GetReservationServicesResponse {
  claim?: {
    claimDocument: any
    variants?: {
      services?: any[]
    }
  }
  errors?: any[]
  [key: string]: any
}

/**
 * Получение дополнительных услуг
 * Аналог fetchTourGetReservationServices из booking проекта
 */
export async function getReservationServices(
  data: GetReservationServicesRequest
): Promise<GetReservationServicesResponse> {
  try {
    const API_TOUR_RESERVATION_SERVICE = import.meta.env.VITE_API_TOUR_RESERVATION_SERVICE || API_GATE_MARKET
    const url = `${API_TOUR_RESERVATION_SERVICE}/getReservationServices`
    
    // Временный хардкод для решения 500 из-за пустого claim.note
    const payload = { ...data }
    if (payload.claim && Array.isArray(payload.claim.notes) && payload.claim.notes.length === 0) {
      payload.claim.notes = {}
    }
    
    payload.clientId = payload.clientId || 'b2c:ru'
    
    const response = await axios.post(url, payload, {
      headers: {
        'X-User-Agent': 'mopsapp_b2c_ru'
      },
      validateStatus: (status) => {
        return status === 500 || status === 200
      }
    })

    return response.data
  } catch (error) {
    console.error('Failed to get reservation services:', error)
    throw error
  }
}

export interface GetReservationInsurancesRequest {
  claim: {
    claimDocument: any
    notes?: any
  }
  clientId?: string
}

export interface GetReservationInsurancesResponse {
  claim?: {
    claimDocument: any
    variants?: {
      insurances?: any[]
    }
  }
  errors?: any[]
  [key: string]: any
}

/**
 * Получение страховок
 * Аналог fetchTourGetReservationInsurances из booking проекта
 */
export async function getReservationInsurances(
  data: GetReservationInsurancesRequest
): Promise<GetReservationInsurancesResponse> {
  try {
    const API_TOUR_RESERVATION_SERVICE = import.meta.env.VITE_API_TOUR_RESERVATION_SERVICE || API_GATE_MARKET
    const url = `${API_TOUR_RESERVATION_SERVICE}/getReservationInsures`
    
    // Временный хардкод для решения 500 из-за пустого claim.note
    const payload = { ...data }
    if (payload.claim && Array.isArray(payload.claim.notes) && payload.claim.notes.length === 0) {
      payload.claim.notes = {}
    }
    
    payload.clientId = payload.clientId || 'b2c:ru'
    
    const response = await axios.post(url, payload, {
      headers: {
        'X-User-Agent': 'mopsapp_b2c_ru'
      },
      validateStatus: (status) => {
        return status === 500 || status === 200
      }
    })

    return response.data
  } catch (error) {
    console.error('Failed to get reservation insurances:', error)
    throw error
  }
}

export interface ChangeServiceRequest {
  claim: {
    claimDocument: any
    notes?: any
  }
  clientId?: string
  userAgent?: string
}

export interface ChangeServiceResponse {
  claim?: {
    claimDocument: any
  }
  errors?: any[]
  [key: string]: any
}

/**
 * Изменение услуги в пакете тура
 * Аналог fetchTourChangeService из booking проекта
 * Используется для изменения услуг (питание, номер и т.д.) в уже созданном пакете
 */
export async function changeService(
  data: ChangeServiceRequest
): Promise<ChangeServiceResponse> {
  try {
    const API_TOUR_RESERVATION_SERVICE = import.meta.env.VITE_API_TOUR_RESERVATION_SERVICE || API_GATE_MARKET
    const url = `${API_TOUR_RESERVATION_SERVICE}/ChangeService`
    
    // Временный хардкод для решения 500 из-за пустого claim.note
    const payload = { ...data }
    if (payload.claim && Array.isArray(payload.claim.notes) && payload.claim.notes.length === 0) {
      payload.claim.notes = {}
    }
    
    payload.clientId = payload.clientId || 'b2c:ru'
    payload.userAgent = payload.userAgent || 'mopsapp_b2c_ru'
    
    const response = await axios.post(url, payload, {
      headers: {
        'X-User-Agent': 'mopsapp_b2c_ru'
      },
      validateStatus: (status) => {
        // Принимаем 200 и 500 как в booking
        return status === 500 || status === 200
      }
    })

    return response.data
  } catch (error) {
    console.error('Failed to change service:', error)
    throw error
  }
}

// ==================== Geo Object запросы ====================

export interface GeoObjectRequest {
  id: string // UUID или ebgNodeId
  objectType?: 'Hotel' | 'Country' | 'Town' | 'Resort' | 'City'
}

export interface GeoObjectResponse {
  id: string
  ebgNodeId?: number
  localizedName?: string
  objectType?: string
  [key: string]: any
}

/**
 * Получение geo объекта по UUID
 * Аналог fetchGeoObjectByUuidIdAndType из booking проекта
 */
export async function getGeoObject(
  data: GeoObjectRequest
): Promise<GeoObjectResponse | null> {
  try {
    if (!data.objectType) {
      console.error('objectType не передан')
      return null
    }
    
    const url = `${API_GATE_MARKET}/api/geocontent/${data.objectType.toLowerCase()}`
    
    const response = await axios.get(url, {
      params: {
        id: data.id
      },
      headers: {
        'accept': 'text/plain',
        'Accept-Language': 'ru-RU',
        'X-TUI-Storefront-Id': 'b2c:ru',
        'X-User-Agent': 'mopsapp_b2c_ru'
      }
    })

    return response.data
  } catch (error) {
    console.error('Failed to get geo object:', error)
    return null
  }
}

export interface GeoObjectByEbgRequest {
  ebgNodeId: number
  objectType?: 'Hotel' | 'Country' | 'Town' | 'Resort' | 'City'
}

/**
 * Получение geo объекта по ebgNodeId
 * Аналог fetchGeoObjectByEbgNodeIdBasketAndType из booking проекта
 */
export async function getGeoObjectByEbg(
  data: GeoObjectByEbgRequest
): Promise<GeoObjectResponse | null> {
  try {
    if (!data.objectType) {
      // Если objectType не передан, используем ebgNodeId-match
      const url = `${API_GATE_MARKET}/api/geocontent/geo-tree/ebgNodeId-match`
      
      const response = await axios.get(url, {
        params: {
          ebgNodeId: data.ebgNodeId
        },
        headers: {
          'Accept-Language': 'ru-RU',
          'X-TUI-Storefront-Id': 'b2c:ru',
          'X-User-Agent': 'mopsapp_b2c_ru'
        }
      })

      return response.data
    } else {
      // Если objectType передан, используем ebgNodeId-match-new
      // В booking 'region' преобразуется в 'resort'
      let objectType = data.objectType.toLowerCase()
      if (objectType === 'region') {
        objectType = 'resort'
      }
      const url = `${API_GATE_MARKET}/api/geocontent/geo-tree/ebgNodeId-match-new`
      
      const response = await axios.get(url, {
        params: {
          ebgNodeId: data.ebgNodeId,
          geoObjectType: objectType
        },
        headers: {
          'Accept-Language': 'ru-RU',
          'X-TUI-Storefront-Id': 'b2c:ru',
          'X-User-Agent': 'mopsapp_b2c_ru'
        }
      })

      return response.data
    }
  } catch (error) {
    console.error('Failed to get geo object by ebg:', error)
    return null
  }
}

