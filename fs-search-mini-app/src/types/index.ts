// Типы для поискового запроса
export interface SearchParams {
  departureCityId: number;
  arrivalCountryId: number;
  minStartDate: string;
  maxStartDate: string;
  minNightsCount: number;
  maxNightsCount: number;
  adults: number;
  children?: number;
  flightTypes: 'all' | 'charter' | 'regular';
  sort: string;
}

// Типы для отеля
export interface Hotel {
  id: number;
  geoId: string;
  name: string;
  stars: number;
  cityName: string;
  countryName: string;
  photoUrl: string;
  galleryUrls: string[];
  urlFriendlyName: string;
  topHotels?: {
    rating: string;
    ratesCount: number;
    mealRating: string;
    serviceRating: string;
    hotelRating: number;
  };
  priorityFilters: HotelFilter[];
}

export interface HotelFilter {
  id: string;
  name: string;
  iconUrl?: string;
  is_priority: boolean;
  priority: number;
}

// Типы для тура
export interface Tour {
  md5_id: string;
  startDate: string;
  isInstantConfirmation: boolean;
  hotel: Hotel;
  priceOffer: PriceOffer;
}

export interface PriceOffer {
  tourTypeId: number;
  hotelAvailability: string;
  meal: Meal[];
  flightTypes: FlightType[];
  price: Price[];
  fullPrice: Price[];
  supplement: Supplement[];
  people: {
    adults: string;
    children?: string;
  };
  departureTimeOptions: string[];
}

export interface Meal {
  id: number;
  name: string;
  name_ru: string;
  name_en: string;
  translate: string;
}

export interface FlightType {
  id: number;
  name: string;
  startDate: string;
}

export interface Price {
  value: number;
  oldValue?: number;
  salePrice?: number;
  currencyAlias: string;
  currencyId: string;
  startDate: string;
  flightTypeId: number;
  flightTypeName: string;
  mealId: number;
  mealName: string;
  mealNameEn: string;
  nightsCount: string;
}

export interface Supplement {
  adult: number;
  child: number;
  currency: number;
  startDate: string;
  flightTypeId: number;
  flightTypeName: string;
  mealId: number;
  mealName: string;
  nightsCount: string;
}

// Типы для фильтров
export interface FilterOption {
  id: string | number;
  name_ru: string;
  name?: string;
  name_en?: string;
  translate?: string;
  paramName?: string;
  sortOrder: number;
  ebgNodeId?: number;
  localizedName?: string;
  urlName?: string;
  children?: FilterOption[];
}

export interface FilterGroup {
  blockId?: string;
  name_ru: string;
  name?: string;
  paramName: string;
  translate: string;
  sortOrder: number;
  data: FilterOption[];
}

export interface PopularFilter {
  id: string | number;
  name_ru: string;
  translate: string;
  paramName: string;
  sortOrder: number;
}

export interface PriceFilter {
  name_ru: string;
  name: string;
  paramName: string;
  translate: string;
  sortOrder: number;
  data: Array<{
    id: number;
    name_ru: string;
    translate: string;
    paramName: string;
    sortOrder: number;
  }>;
}

export interface Region {
  id: string;
  ebgNodeId: number;
  localizedName: string;
  urlName: string;
  children: Region[];
}

export interface Filters {
  md5_id: string;
  country: {
    id: string;
    ebgNodeId: number;
    localizedName: string;
    urlName: string;
    caseForms: {
      nominativeCase: string;
      genitiveCase: string;
      dativeCase: string;
      accusativeCase: string;
      instrumentalCase: string;
      prepositionalCase: string;
    };
  };
  popularTypes: {
    name_ru: string;
    name: string;
    paramName: string;
    translate: string;
    sortOrder: number;
    data: PopularFilter[];
  };
  enrichment: string;
  price: PriceFilter;
  searchHotel: {
    name_ru: string;
    name: string;
    paramName: string;
    translate: string;
    sortOrder: number;
    data: any[];
  };
  regionsAndResorts: {
    name_ru: string;
    name: string;
    translate: string;
    sortOrder: number;
    data: Region[];
  };
  categoryOfHotel: FilterGroup;
  isInstantConfirmation: {
    name_ru: string;
    name: string;
    paramName: string;
    translate: string;
    sortOrder: number;
    data: any[];
  };
  mealTypes: FilterGroup;
  topHotels: FilterGroup;
  placementTypes: FilterGroup;
  tourTypes: FilterGroup;
  distanceSea: FilterGroup;
  beach: FilterGroup;
  funSunHotels: FilterGroup;
  locations: FilterGroup;
  hotelTypes: FilterGroup;
  forKids: FilterGroup;
  flightTypes: FilterGroup;
  waterActivities: FilterGroup;
  additionally: FilterGroup;
  placementFeatures: FilterGroup;
}

export interface ApiResponse {
  tours: Tour[];
  filters: Filters;
  other: {
    count_tours: number;
    total_counts: number;
    page: number;
    totalPage: number;
    percent: number;
  };
}

// Типы для UI
export interface City {
  id: number;
  name: string;
  country?: string;
}

export interface Country {
  id: number;
  name: string;
  ebgNodeId: number;
}

export interface Duration {
  value: number;
  label: string;
}

export interface TravelersCount {
  adults: number;
  children: number;
}

