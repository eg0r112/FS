// Типы для GetByHotels API
export interface RoomOption {
  id: number;
  name: string;
  isFakeId: boolean;
}

export interface MealOption {
  mealTypeGroupId: number;
  mealTypeId: number;
  mealTypeGroupName: string;
  mealTypeName: string;
  isFakeId: boolean;
}

// Типы для fullHotel
export interface HotelImage {
  id: string;
  resolutionType: string;
  imageType: string;
  description: string;
  sortOrder: number;
  src: string;
}

export interface RoomAmenity {
  id: string;
  name: string;
  sortOrder: number;
  payType: 'Free' | 'Paid' | 'Empty';
  iconUrl: string;
}

export interface RoomType {
  samoId: number;
  numberOfBeds: number;
  square: number;
  name: string;
  alternativeName: string;
  description: string;
  status: string;
  amenities: RoomAmenity[];
  view?: {
    id: number;
    name: string;
    catalogId: string;
  };
  images: HotelImage[];
}

export interface HotelCategory {
  id: number;
  name: string;
  displayName: string;
}

export interface TopHotelsRating {
  id: number;
  rating: number;
  mealRating: number;
  ratesCount: number;
  hotelRating: number;
  serviceRating: number;
}

export interface DescriptionBlockFilter {
  id: string;
  name: string;
  sortOrder: number;
  payType: string;
  iconUrl: string;
}

export interface DescriptionBlock {
  descriptionBlockTypeId: string;
  name: string;
  iconUrl: string;
  sortOrder: number;
  isGrouping: boolean;
  parentId: string;
  text: string;
  filterIds: string[];
  children: DescriptionBlock[];
  descriptionBlockFilters: DescriptionBlockFilter[];
}

export interface TypeTag {
  id: number;
  name: string;
  localizedName: string;
}

export interface RestType {
  id: number;
  name: string;
  isDeleted: boolean;
}

export interface Recommendation {
  id: number;
  name: string;
}

export interface FullHotel {
  id: string;
  localizedName: string;
  ebgNodeId: number;
  objectType: string;
  address: string;
  phone: string;
  fax: string;
  website: string;
  email: string;
  constructionYear: number;
  renovationYear: number;
  distanceToTheBeach: string;
  distanceToAirport: string;
  latitude: number;
  longitude: number;
  urlName: string;
  shortText: string;
  generalDescription: string;
  images: HotelImage[];
  hotelCategory: HotelCategory;
  topHotels?: TopHotelsRating;
  typeTags: TypeTag[];
  restTypes: RestType[];
  recommendations: Recommendation[];
  roomTypes: RoomType[];
  descriptionBlocks: DescriptionBlock[];
  caseForms?: {
    nominativeCase: string;
    genitiveCase: string;
    dativeCase: string;
    accusativeCase: string;
    instrumentalCase: string;
    prepositionalCase: string;
  };
}

export interface TourOffer {
  hotelId: number;
  hotelName: string;
  stars: number;
  categoryId: number;
  tourKey: string;
  tourName: string;
  tourId: number;
  partnerIncoming: string;
  partnerIncomingKey: number;
  townId: number;
  townName: string;
  tourStartDate: string;
  tourEndDate: string;
  checkinDate: string;
  checkoutDate: string;
  daysCount: number;
  nightsCount: number;
  hotelNightsCount: number;
  roomId: number;
  mealId: number;
  accomodation: {
    id: number;
    name: string;
    latinName: string;
  };
  price: {
    value: number;
    oldValue: number;
    currencyAlias: string;
    currencyId: number;
  };
  supplement: {
    adult: number;
    child: number;
    currency: number;
  };
  fullPrice: {
    value: number;
    oldValue: number;
    currencyAlias: string;
    currencyId: number;
  };
  isInstantConfirmation: boolean;
  isRegularFlight: boolean;
  tourType: {
    id: number;
    name: string;
  };
  paxes: {
    adultsCount: number;
    childrenCount: number;
    infantsCount: number;
  };
  index: number;
  programType: {
    key: number;
    name: string;
    nameAlt: string;
    icon: string;
    url: string;
  };
  color: string | null;
  freights: any | null;
  availablePromos: any[];
  spo: string;
  hasPacketTransfer: boolean;
  withoutPromo: boolean;
  external: number;
  listTime: string;
}

export interface GetByHotelsResponse {
  rooms: RoomOption[];
  meals: MealOption[];
  offers: TourOffer[];
  fullHotel?: FullHotel;
}

export interface GetByHotelsRequest {
  hotelIds: number[];
  clientId: string;
  lang: string;
  departureCityId: string;
  arrivalCountryId: string;
  minStartDate: string;
  maxStartDate: string;
  nightsFrom: string;
  nightsTo: string;
  adults: string;
  children: string[]; // Массив возрастов детей (строки)
  currency: string;
  catclaim: string;
  programTypes: number[];
  flightTypes?: 'all' | 'charter' | 'regular' | 'hotelNoFly'; // Тип рейса
}

