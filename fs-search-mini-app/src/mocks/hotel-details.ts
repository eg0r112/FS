import type { HotelDetails } from '@/types/hotel-details'

export const mockHotelDetails: HotelDetails = {
  id: '00170000-ac11-0242-9e05-08d9945fbaeb',
  localizedName: 'FUN&SUN SMART Hane Sun',
  parents: [
    {
      ebgNodeId: 20613,
      id: '00170000-ac11-0242-9e05-08d9945fbaeb-parent',
      localizedName: 'Турция',
      objectType: 'Country',
      parentId: '',
      urlName: 'turkey'
    },
    {
      ebgNodeId: 304578,
      id: '00170000-ac11-0242-9e05-08d9945fbaeb-parent-city',
      localizedName: 'Чолаклы',
      objectType: 'City',
      parentId: '00170000-ac11-0242-9e05-08d9945fbaeb-parent',
      urlName: 'cholakli'
    }
  ],
  parentId: '00170000-ac11-0242-9e05-08d9945fbaeb-parent-city',
  ebgNodeId: 778523,
  objectType: 'Hotel',
  address: 'Турция, Чолаклы, ул. Пляжная, д. 1',
  addressPostIndex: '',
  addressStreet: 'ул. Пляжная',
  addressHouse: 'д. 1',
  phone: '+90 242 123 45 67',
  fax: '',
  website: 'https://funsun.ru',
  email: 'info@funsun.ru',
  constructionYear: 2010,
  renovationYear: 2020,
  distanceToTheBeach: '50 м',
  distanceToAirport: '45 км',
  totalArea: 5000,
  latitude: 36.8,
  longitude: 31.4,
  mapZoomLevel: 15,
  priority: 1,
  priorityTVD: 1,
  priorityMain: 1,
  priorityTours: 1,
  priorityHotels: 1,
  prioritySanatorium: 0,
  priorityExcursionTour: 0,
  urlName: 'hotel/europe/turkey/side/cholakli/funsun-smart-hane-sun',
  urlNameStatic: 'hotel/europe/turkey/side/cholakli/funsun-smart-hane-sun',
  shortText: 'Современный отель с отличным сервисом, расположенный в 50 метрах от пляжа. Идеально подходит для семейного отдыха.',
  generalDescription: '<p>FUN&SUN SMART Hane Sun — это современный отель категории 5*, расположенный в курортном районе Чолаклы, всего в 50 метрах от пляжа. Отель предлагает комфортабельные номера, разнообразное питание и широкий спектр развлечений для всей семьи.</p><p>На территории отеля работают несколько ресторанов и баров, SPA-центр, фитнес-зал, детский клуб и анимационная программа. Для гостей доступны бассейны, водные горки и спортивные площадки.</p>',
  numberOfBookings: 1247,
  images: [
    {
      id: '1',
      resolutionType: 'Source',
      imageType: 'Gallery',
      description: 'Главный вид отеля',
      sortOrder: 1,
      src: 'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00170000-ac11-0242-9e05-08d9945fbaeb/Gallery-Source-qecz4lse.jpg'
    },
    {
      id: '2',
      resolutionType: 'Source',
      imageType: 'Gallery',
      description: 'Бассейн',
      sortOrder: 2,
      src: 'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00170000-ac11-0242-9e05-08d9945fbaeb/Gallery-Source-jvit2f0a.jpg'
    },
    {
      id: '3',
      resolutionType: 'Source',
      imageType: 'Gallery',
      description: 'Номер',
      sortOrder: 3,
      src: 'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00170000-ac11-0242-9e05-08d9945fbaeb/Gallery-Source-bfpgfgpe.jpg'
    },
    {
      id: '4',
      resolutionType: 'Source',
      imageType: 'Gallery',
      description: 'Ресторан',
      sortOrder: 4,
      src: 'https://apigate-tui.fstravel.com/api/geocontent/static/Hotel/00170000-ac11-0242-9e05-08d9945fbaeb/Gallery-Source-zzd0lewx.jpg'
    }
  ],
  videos: [],
  caseForms: {
    nominativeCase: 'FUN&SUN SMART Hane Sun',
    genitiveCase: 'FUN&SUN SMART Hane Sun',
    dativeCase: 'FUN&SUN SMART Hane Sun',
    accusativeCase: 'FUN&SUN SMART Hane Sun',
    instrumentalCase: 'FUN&SUN SMART Hane Sun',
    prepositionalCase: 'FUN&SUN SMART Hane Sun'
  },
  topHotels: {
    id: 778523,
    rating: 4.35,
    mealRating: 4.49,
    ratesCount: 473,
    hotelRating: 4.27,
    serviceRating: 4.28
  },
  hotelCategory: {
    id: 10005,
    name: '5*',
    displayName: '5 звезд'
  },
  hotelGroup: [],
  concepts: [],
  typeTags: [],
  restTypes: [],
  priorities: [],
  recommendations: [
    { id: 1, name: 'Wi-Fi в номерах' },
    { id: 2, name: 'Кондиционер' },
    { id: 3, name: 'SPA-центр' },
    { id: 4, name: 'Бассейн' },
    { id: 5, name: 'Ресторан' },
    { id: 6, name: 'Детский клуб' }
  ],
  roomTypes: [],
  descriptionBlocks: [
    {
      descriptionBlockTypeId: '1',
      name: 'Удобства',
      iconUrl: '',
      sortOrder: 1,
      isGrouping: false,
      parentId: '',
      text: '<p>Отель предлагает широкий спектр удобств для комфортного отдыха: бесплатный Wi-Fi, кондиционер в номерах, мини-бар, сейф, телевизор с плоским экраном.</p>',
      filterIds: [],
      children: [],
      descriptionBlockFilters: []
    },
    {
      descriptionBlockTypeId: '2',
      name: 'Питание',
      iconUrl: '',
      sortOrder: 2,
      isGrouping: false,
      parentId: '',
      text: '<p>На территории отеля работают несколько ресторанов с разнообразной кухней, бары у бассейна и на пляже. Доступны различные варианты питания: завтрак, полупансион, полный пансион, все включено.</p>',
      filterIds: [],
      children: [],
      descriptionBlockFilters: []
    },
    {
      descriptionBlockTypeId: '3',
      name: 'Развлечения',
      iconUrl: '',
      sortOrder: 3,
      isGrouping: false,
      parentId: '',
      text: '<p>Для гостей доступны бассейны, водные горки, детский клуб, анимационная программа, вечерние шоу, дискотека, спортивные площадки, фитнес-зал, SPA-центр.</p>',
      filterIds: [],
      children: [],
      descriptionBlockFilters: []
    }
  ],
  services: [],
  isActive: true,
  isB2bActive: true,
  isNewDescriptionsFilled: true,
  isNewDescriptionsBlocked: false,
  isContentVerified: true,
  hasActiveRooms: true,
  prepositionForm: 'в',
  standardizedName: 'FUN&SUN SMART Hane Sun'
}

