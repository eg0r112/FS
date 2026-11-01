import { computed, watch } from 'vue'
import { 
  init,
  backButton,
  mainButton,
  miniApp,
  themeParams,
  viewport,
  initData,
  popup,
  hapticFeedback,
  openLink as sdkOpenLink,
  openTelegramLink as sdkOpenTelegramLink
} from '@telegram-apps/sdk'

// Singleton - инициализируем SDK только один раз
let isInitialized = false
let themeWatchInitialized = false

function initTelegramSDK() {
  if (isInitialized) {
    console.log('✅ Telegram SDK already initialized')
    return
  }

  console.log('🚀 Initializing Telegram SDK...')
  
  try {
    init()
    
    // Mount компоненты если доступны
    if (miniApp.mount.isAvailable()) {
      miniApp.mount()
      console.log('✅ MiniApp mounted')
    }
    
    if (themeParams.mount.isAvailable()) {
      themeParams.mount()
      console.log('✅ ThemeParams mounted:', {
        isDark: themeParams.isDark?.(),
        bgColor: themeParams.backgroundColor?.(),
        textColor: themeParams.textColor?.()
      })
    }
    
    if (viewport.mount.isAvailable()) {
      viewport.mount()
      console.log('✅ Viewport mounted')
    }
    
    // Опциональные компоненты
    try {
      if (backButton.mount.isAvailable()) {
        backButton.mount()
        console.log('✅ BackButton mounted')
      }
      if (mainButton.mount.isAvailable()) {
        mainButton.mount()
        console.log('✅ MainButton mounted')
      }
      initData.restore()
    } catch (e) {
      console.warn('⚠️ Some optional components failed to mount:', e)
    }
    
    // Готовим приложение
    if (miniApp.isMounted()) {
      miniApp.ready()
      if (viewport.expand.isAvailable()) {
        viewport.expand()
      }
      console.log('✅ MiniApp ready and viewport expanded')
    }
    
    isInitialized = true
    console.log('✅ Telegram SDK initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize Telegram SDK:', error)
    // ВРЕМЕННО: Разрешаем работу в браузере для тестирования
    // Если не в Telegram, все равно помечаем как инициализированное
    console.warn('⚠️ Running outside Telegram - enabling browser mode for testing')
    isInitialized = true
  }
}

export function useTelegram() {
  // Инициализируем SDK (только один раз благодаря singleton)
  initTelegramSDK()

  // Определяем тему напрямую из Telegram
  // Используем небольшую задержку чтобы дать время данным загрузиться
  const colorScheme = computed(() => {
    // Проверяем что компонент смонтирован
    if (!themeParams.isMounted()) {
      return 'dark' // Fallback: темная тема
    }
    
    // Приоритет 1: используем isDark() - самый надежный метод
    const isDarkValue = themeParams.isDark?.()
    if (isDarkValue !== undefined) {
      return isDarkValue ? 'dark' : 'light'
    }
    
    // Приоритет 2: определяем по цвету фона
    const bgColor = themeParams.backgroundColor?.()
    if (bgColor) {
      const hex = bgColor.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      const brightness = (r + g + b) / 3
      return brightness < 128 ? 'dark' : 'light'
    }
    
    // Fallback: данные еще не загрузились, используем темную тему по умолчанию
    return 'dark'
  })

  const isDark = computed(() => colorScheme.value === 'dark')

  // Применяем тему
  const applyTheme = () => {
    const theme = colorScheme.value
    document.body.className = `theme-${theme}`
    
    if (miniApp.isMounted()) {
      const headerColor = isDark.value ? '#1a1a1a' : '#ffffff'
      const bgColor = isDark.value ? '#1a1a1a' : '#ffffff'
      
      miniApp.setHeaderColor(headerColor)
      miniApp.setBackgroundColor(bgColor)
    }
  }

  // Автоматически применяем тему при изменении (singleton watch)
  if (!themeWatchInitialized) {
    watch(colorScheme, () => {
      applyTheme()
    }, { immediate: true })
    themeWatchInitialized = true
  } else {
    // Если watch уже создан, просто применяем тему вручную
    applyTheme()
  }

  // MainButton
  const showMainButton = (text: string, onClick: () => void) => {
    if (mainButton.setParams.isAvailable()) {
      mainButton.setParams({
        text,
        isVisible: true,
        isEnabled: true
      })
      
      if (mainButton.onClick.isAvailable()) {
        mainButton.onClick(onClick)
      }
    }
  }

  const hideMainButton = () => {
    if (mainButton.setParams.isAvailable()) {
      mainButton.setParams({ isVisible: false })
    }
  }

  // BackButton
  const showBackButton = (onClick: () => void) => {
    if (backButton.show.isAvailable()) {
      backButton.show()
      
      if (backButton.onClick.isAvailable()) {
        backButton.onClick(onClick)
      }
    }
  }

  const hideBackButton = () => {
    if (backButton.hide.isAvailable()) {
      backButton.hide()
    }
  }

  // Alert
  const showAlert = async (message: string) => {
    if (popup.show.isAvailable()) {
      try {
        await popup.show({
          title: 'Информация',
          message,
          buttons: [{ id: 'ok', type: 'default', text: 'OK' }]
        })
      } catch (error) {
        console.error('Popup error:', error)
        alert(message)
      }
    } else {
      alert(message)
    }
  }

  // Confirm
  const showConfirm = async (message: string): Promise<boolean> => {
    if (popup.show.isAvailable()) {
      try {
        const result = await popup.show({
          title: 'Подтверждение',
          message,
          buttons: [
            { id: 'yes', type: 'default', text: 'Да' },
            { id: 'no', type: 'cancel' }
          ]
        })
        return result === 'yes'
      } catch (error) {
        console.error('Popup error:', error)
        return confirm(message)
      }
    } else {
      return confirm(message)
    }
  }

  // Haptic Feedback
  const hapticFeedbackFn = (type: 'light' | 'medium' | 'heavy' | 'error' | 'success' = 'light') => {
    if (!hapticFeedback.impactOccurred.isAvailable() && 
        !hapticFeedback.notificationOccurred.isAvailable()) {
      return
    }

    try {
      switch (type) {
        case 'error':
        case 'success':
          if (hapticFeedback.notificationOccurred.isAvailable()) {
            hapticFeedback.notificationOccurred(type)
          }
          break
        case 'light':
        case 'medium':
        case 'heavy':
          if (hapticFeedback.impactOccurred.isAvailable()) {
            hapticFeedback.impactOccurred(type)
          }
          break
      }
    } catch (error) {
      console.warn('Haptic feedback error:', error)
    }
  }

  // Получаем данные пользователя
  const user = computed(() => {
    return initData.user() || null
  })

  // Получаем start параметр
  const startParam = computed(() => {
    return initData.startParam() || null
  })

  // Закрыть приложение
  const close = () => {
    if (miniApp.close.isAvailable()) {
      miniApp.close()
    }
  }

  // Открыть ссылку
  const openLink = (url: string, options?: { tryInstantView?: boolean }) => {
    if (sdkOpenLink.isAvailable()) {
      sdkOpenLink(url, options)
    } else {
      window.open(url, '_blank')
    }
  }

  // Открыть Telegram ссылку
  const openTelegramLink = (url: string) => {
    if (sdkOpenTelegramLink.isAvailable()) {
      sdkOpenTelegramLink(url)
    } else {
      window.open(url, '_blank')
    }
  }

  return {
    isReady: isInitialized,
    miniApp: miniApp.isMounted() ? miniApp : null,
    themeParams: themeParams.isMounted() ? themeParams : null,
    colorScheme,
    isDark,
    user,
    startParam,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showAlert,
    showConfirm,
    hapticFeedback: hapticFeedbackFn,
    applyTheme,
    close,
    openLink,
    openTelegramLink
  }
}
