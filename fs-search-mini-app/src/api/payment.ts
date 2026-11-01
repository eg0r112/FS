import axios from 'axios'
import { USE_MOCK_FUNSUN, sleep } from './mockMode'

const BOOKING_API_BASE_URL = import.meta.env.VITE_BOOKING_API_BASE_URL || 'https://booking.funsun.ru'

export interface PaymentConfig {
  orderId: number
  destinationCountryName: string
  description: string
  beginDate: string
  customerEmail: string
  customerPhoneNumber: string
  amount: number
  currencyCode: string
  currencyRate: number
  isPrepaid?: boolean
  draftId?: number
  isRegularFlight?: boolean
  provider?: string
  paymentProviderType?: string
  tariffType?: number
  isPromo?: boolean
}

export interface PaymentResponse {
  formUrl: string
  formData?: any
  provider: string
}

/**
 * Создание платежа через booking API
 * Аналог fetchUserPayment из booking проекта
 */
export async function createPaymentBooking(
  paymentConfig: PaymentConfig
): Promise<PaymentResponse> {
  if (USE_MOCK_FUNSUN) {
    await sleep(200)
    return {
      formUrl: 'mock://payment-success',
      provider: 'mock',
      formData: { orderId: paymentConfig.orderId }
    }
  }

  try {
    const url = `${BOOKING_API_BASE_URL}/api-booking/customer/payment`
    
    const response = await axios.post<PaymentResponse>(url, paymentConfig, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Agent': 'mopsapp_b2c_ru'
      }
    })

    if (response.status === 200) {
      return response.data
    } else {
      throw new Error('Failed to create payment')
    }
  } catch (error) {
    console.error('Failed to create payment:', error)
    throw error
  }
}

/**
 * Проверка статуса оплаты
 * Аналог fetchUserPaymentStatus из booking проекта
 */
export async function checkPaymentStatus(): Promise<boolean | null> {
  if (USE_MOCK_FUNSUN) {
    return true
  }

  try {
    const url = `${BOOKING_API_BASE_URL}/api-booking/customer/payment/pay/status`
    
    const response = await axios.post<{ payStatus: boolean | null }>(url, {}, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Agent': 'mopsapp_b2c_ru'
      }
    })

    return response.data.payStatus
  } catch (error) {
    console.error('Failed to check payment status:', error)
    return null
  }
}
