import axios from 'axios'
import { USE_MOCK_FUNSUN, sleep } from './mockMode'

const AUTH_API_BASE_URL = 'https://auth2.fstravel.com'
const API_GATE_MARKET = 'https://apigate.fstravel.com'

export interface RegisterUserRequest {
  email: string
  phone: string
}

export interface RegisterUserResponse {
  email: string
  password?: string
  userId?: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface SignInResponse {
  token_type: string
  access_token: string
  expires_in: number
  [key: string]: any
}

/**
 * Вход пользователя для получения токена авторизации
 */
export async function signIn(data: SignInRequest): Promise<SignInResponse | null> {
  if (USE_MOCK_FUNSUN) {
    await sleep(300)
    return {
      token_type: 'Bearer',
      access_token: `mock-token-${Date.now()}`,
      expires_in: 3600
    }
  }

  let response
  try {
    const params = new URLSearchParams()
    params.append('email', data.email)
    params.append('password', data.password)
    params.append('grant_type', 'client_credentials')

    response = await axios.post(`${API_GATE_MARKET}/api/auth2/token/by-email`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-User-Agent': 'mopsapp_b2c_ru'
      },
      validateStatus: () => true
    })
  } catch (error) {
    console.error('Sign in network error:', error)
    throw new Error('Не удалось связаться с сервисом авторизации. Попробуйте позже.')
  }

  if (response.status === 200) {
    return {
      token_type: response.data.token_type,
      access_token: response.data.access_token,
      expires_in: response.data.expires_in
    }
  }

  console.error('Sign in failed:', { status: response.status, data: response.data })
  throw new Error(
    response.data?.message || response.data?.error || `Ошибка входа (код ${response.status})`
  )
}

/**
 * Быстрая регистрация пользователя (sign-up-buyer-short)
 */
export async function registerUserWithoutAuth(
  data: RegisterUserRequest
): Promise<RegisterUserResponse | null> {
  if (USE_MOCK_FUNSUN) {
    await sleep(400)
    return {
      email: data.email,
      password: 'mock-password',
      userId: `mock-user-${Date.now()}`
    }
  }

  const params = new URLSearchParams()
  params.append('email', data.email)
  params.append('phoneNumber', data.phone)
  params.append('grant_type', 'client_credentials')
  params.append('clientId', 'b2c:ru')

  let response
  try {
    response = await axios.post(
      `${AUTH_API_BASE_URL}/api/v1/account/sign-up-buyer-short`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-User-Agent': 'mopsapp_b2c_ru'
        },
        validateStatus: () => true
      }
    )
  } catch (error) {
    console.error('Registration network error:', error)
    throw new Error('Не удалось связаться с сервисом регистрации. Попробуйте позже.')
  }

  if (response.status === 201) {
    return {
      email: response.data.email,
      password: response.data.password,
      userId: response.data.userId
    }
  }

  console.error('Registration failed:', { status: response.status, data: response.data })

  if (response.status === 409 || response.status === 500) {
    throw new Error('Аккаунт с таким email или телефоном уже существует')
  }
  if (response.status === 400) {
    const message = response.data?.Message || response.data?.message || response.data?.detail
    throw new Error(message || 'Проверьте правильность email и телефона')
  }
  throw new Error(`Сервис регистрации временно недоступен (код ${response.status}). Попробуйте позже`)
}