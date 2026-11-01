// Типы для ответа API get-object-by-urlname
export interface HotelDetailsImage {
  id: string
  resolutionType: string
  imageType: string
  description: string
  sortOrder: number
  src: string
}

export interface HotelDetailsParent {
  ebgNodeId: number
  id: string
  localizedName: string
  objectType: string
  parentId: string
  urlName: string
}

export interface HotelDetailsCaseForms {
  nominativeCase: string
  genitiveCase: string
  dativeCase: string
  accusativeCase: string
  instrumentalCase: string
  prepositionalCase: string
}

export interface HotelDetailsTopHotels {
  id: number
  rating: number
  mealRating: number
  ratesCount: number
  hotelRating: number
  serviceRating: number
}

export interface HotelDetailsCategory {
  id: number
  name: string
  displayName: string
}

export interface HotelDetailsRecommendation {
  id: number
  name: string
}

export interface HotelDetailsRoomType {
  samoId: number
  numberOfBeds: number
  square: number
  name: string
  alternativeName: string
  description: string
  samoImportStatus: string
  alternativeSquare: string
  status: string
  amenities: HotelDetailsAmenity[]
  view: {
    id: number
    name: string
    catalogId: string
  }
  images: HotelDetailsImage[]
}

export interface HotelDetailsAmenity {
  id: string
  name: string
  sortOrder: number
  payType: string
  iconUrl: string
}

export interface HotelDetailsDescriptionBlock {
  descriptionBlockTypeId: string
  name: string
  iconUrl: string
  sortOrder: number
  isGrouping: boolean
  parentId: string
  text: string
  filterIds: string[]
  children: HotelDetailsDescriptionBlock[]
  descriptionBlockFilters: HotelDetailsDescriptionBlockFilter[]
}

export interface HotelDetailsDescriptionBlockFilter {
  id: string
  name: string
  sortOrder: number
  payType: string
  iconUrl: string
}

export interface HotelDetails {
  id: string
  localizedName: string
  parents: HotelDetailsParent[]
  parentId: string
  ebgNodeId: number
  objectType: string
  address: string
  addressPostIndex: string
  addressStreet: string
  addressHouse: string
  phone: string
  fax: string
  website: string
  email: string
  constructionYear: number
  renovationYear: number
  distanceToTheBeach: string
  distanceToAirport: string
  totalArea: number
  latitude: number
  longitude: number
  mapZoomLevel: number
  priority: number
  priorityTVD: number
  priorityMain: number
  priorityTours: number
  priorityHotels: number
  prioritySanatorium: number
  priorityExcursionTour: number
  urlName: string
  urlNameStatic: string
  shortText: string
  generalDescription: string
  numberOfBookings: number
  images: HotelDetailsImage[]
  videos: any[]
  caseForms: HotelDetailsCaseForms
  topHotels: HotelDetailsTopHotels
  hotelCategory: HotelDetailsCategory
  hotelGroup: any[]
  concepts: any[]
  typeTags: any[]
  restTypes: any[]
  priorities: any[]
  recommendations: HotelDetailsRecommendation[]
  roomTypes: HotelDetailsRoomType[]
  descriptionBlocks: HotelDetailsDescriptionBlock[]
  services: any[]
  isActive: boolean
  isB2bActive: boolean
  isNewDescriptionsFilled: boolean
  isNewDescriptionsBlocked: boolean
  isContentVerified: boolean
  hasActiveRooms: boolean
  prepositionForm: string
  standardizedName: string
}

