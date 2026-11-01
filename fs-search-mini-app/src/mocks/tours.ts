import type { Tour } from '@/types'

export const mockTours: Tour[] = [
  {
    md5_id: '8b5927fb46091ba7c39d2177413fbbf0',
    startDate: '2025-11-09T00:00:00Z',
    isInstantConfirmation: true,
    hotel: {
      id: 778523,
      geoId: '00170000-ac11-0242-9e05-08d9945fbaeb',
      stars: 5,
      cityName: 'Чолаклы',
      countryName: 'Турция',
      name: 'FUN&SUN SMART Hane Sun',
      photoUrl: 'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00170000-ac11-0242-9e05-08d9945fbaeb/MainPhoto-Source-u3arr4ah.jpg',
      galleryUrls: [
        'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00170000-ac11-0242-9e05-08d9945fbaeb/Gallery-Source-qecz4lse.jpg',
        'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00170000-ac11-0242-9e05-08d9945fbaeb/Gallery-Source-jvit2f0a.jpg',
        'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00170000-ac11-0242-9e05-08d9945fbaeb/Gallery-Source-bfpgfgpe.jpg',
        'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00170000-ac11-0242-9e05-08d9945fbaeb/Gallery-Source-zzd0lewx.jpg'
      ],
      urlFriendlyName: 'hotel/europe/turkey/side/cholakli/funsun-smart-hane-sun',
      topHotels: {
        rating: '4.348429',
        ratesCount: 473,
        mealRating: '4.492163',
        serviceRating: '4.28125',
        hotelRating: 4.271875
      },
      priorityFilters: [
        {
          id: 'd032cbab-8007-4191-89b4-a0ef24a81872',
          name: 'Wi-Fi в номерах',
          is_priority: true,
          priority: 1
        },
        {
          id: 'cc0bee1d-43d8-4e15-ab1c-4945c5fb3299',
          name: 'Кондиционер',
          is_priority: true,
          priority: 5
        },
        {
          id: 'a8ffdafb-6eac-4111-9f6b-a52779b3b475',
          name: 'SPA-центр',
          is_priority: true,
          priority: 6
        }
      ]
    },
    priceOffer: {
      tourTypeId: 36,
      hotelAvailability: 'YYYY',
      meal: [
        {
          id: 8,
          name: 'AUI',
          name_ru: 'Ультра все включено',
          translate: 'tourSearch/countryData.mealAUI',
          name_en: 'Ultra All Inclusive'
        }
      ],
      flightTypes: [
        {
          id: 1,
          name: 'charter',
          startDate: '2025-11-09T00:00:00Z'
        }
      ],
      supplement: [
        {
          adult: 11011,
          child: 11011,
          currency: 1,
          startDate: '2025-11-09T00:00:00Z',
          flightTypeId: 1,
          flightTypeName: 'charter',
          mealId: 8,
          mealName: 'AUI',
          nightsCount: '7'
        }
      ],
      fullPrice: [
        {
          value: 114314.2,
          oldValue: 183383.2,
          salePrice: 37.66,
          currencyAlias: 'RUB',
          currencyId: '1',
          startDate: '2025-11-09T00:00:00Z',
          flightTypeId: 1,
          flightTypeName: 'charter',
          mealId: 8,
          mealName: 'AUI',
          mealNameEn: 'Ultra All Inclusive',
          nightsCount: '7'
        }
      ],
      price: [
        {
          value: 92293,
          oldValue: 161362,
          salePrice: 42.8,
          currencyAlias: 'RUB',
          currencyId: '1',
          startDate: '2025-11-09T00:00:00Z',
          flightTypeId: 1,
          flightTypeName: 'charter',
          mealId: 8,
          mealName: 'AUI',
          mealNameEn: 'Ultra All Inclusive',
          nightsCount: '7'
        }
      ],
      departureTimeOptions: ['02:45', '04:10', '07:00', '08:10', '12:00', '14:00', '16:55'],
      people: {
        adults: '2'
      }
    }
  },
  {
    md5_id: '6f7567b9b3f03c3130941bd70c9e81eb',
    startDate: '2025-11-09T00:00:00Z',
    isInstantConfirmation: true,
    hotel: {
      id: 831492,
      geoId: '00230000-ac11-0242-8a7f-08da18f2dd5e',
      stars: 5,
      cityName: 'Кызылот',
      countryName: 'Турция',
      name: 'Calimera Serra Palace',
      photoUrl: 'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00230000-ac11-0242-8a7f-08da18f2dd5e/MainPhoto-Source-xeqsppb5.jpg',
      galleryUrls: [
        'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00230000-ac11-0242-8a7f-08da18f2dd5e/Gallery-Source-urroecvf.jpg',
        'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00230000-ac11-0242-8a7f-08da18f2dd5e/Gallery-Source-a34bbvje.jpg',
        'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00230000-ac11-0242-8a7f-08da18f2dd5e/Gallery-Source-5s04mjr0.jpg'
      ],
      urlFriendlyName: 'hotel/europe/turkey/side/kizilot/calimera-serra-palace',
      topHotels: {
        rating: '4.4129624',
        ratesCount: 754,
        mealRating: '4.5272374',
        serviceRating: '4.2893205',
        hotelRating: 4.42233
      },
      priorityFilters: [
        {
          id: 'd032cbab-8007-4191-89b4-a0ef24a81872',
          name: 'Wi-Fi в номерах',
          is_priority: true,
          priority: 1
        },
        {
          id: '6c2f7b15-ab19-454f-b52b-48b186f0a08c',
          name: 'Аквапарк',
          is_priority: true,
          priority: 4
        },
        {
          id: 'a8ffdafb-6eac-4111-9f6b-a52779b3b475',
          name: 'SPA-центр',
          is_priority: true,
          priority: 6
        }
      ]
    },
    priceOffer: {
      tourTypeId: 36,
      hotelAvailability: 'YYYY',
      meal: [
        {
          id: 8,
          name: 'AUI',
          name_ru: 'Ультра все включено',
          translate: 'tourSearch/countryData.mealAUI',
          name_en: 'Ultra All Inclusive'
        }
      ],
      flightTypes: [
        {
          id: 1,
          name: 'charter',
          startDate: '2025-11-09T00:00:00Z'
        }
      ],
      supplement: [
        {
          adult: 11011,
          child: 11011,
          currency: 1,
          startDate: '2025-11-09T00:00:00Z',
          flightTypeId: 1,
          flightTypeName: 'charter',
          mealId: 8,
          mealName: 'AUI',
          nightsCount: '7'
        }
      ],
      fullPrice: [
        {
          value: 116416.3,
          oldValue: 185485.3,
          salePrice: 37.24,
          currencyAlias: 'RUB',
          currencyId: '1',
          startDate: '2025-11-09T00:00:00Z',
          flightTypeId: 1,
          flightTypeName: 'charter',
          mealId: 8,
          mealName: 'AUI',
          mealNameEn: 'Ultra All Inclusive',
          nightsCount: '7'
        }
      ],
      price: [
        {
          value: 94395,
          oldValue: 163464,
          salePrice: 42.25,
          currencyAlias: 'RUB',
          currencyId: '1',
          startDate: '2025-11-09T00:00:00Z',
          flightTypeId: 1,
          flightTypeName: 'charter',
          mealId: 8,
          mealName: 'AUI',
          mealNameEn: 'Ultra All Inclusive',
          nightsCount: '7'
        }
      ],
      departureTimeOptions: ['02:45', '04:10', '07:00', '08:10', '12:00', '14:00', '16:55'],
      people: {
        adults: '2'
      }
    }
  }
]

