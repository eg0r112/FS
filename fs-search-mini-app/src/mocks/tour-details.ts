import type { GetByHotelsResponse } from '@/types/tour-details'

export const mockTourOffers: GetByHotelsResponse = {
  rooms: [
    {
      id: 42994,
      name: 'Economy',
      isFakeId: false
    },
    {
      id: 43350,
      name: 'Standard',
      isFakeId: false
    },
    {
      id: 43085,
      name: 'Family With Bunkbed',
      isFakeId: false
    },
    {
      id: 129644,
      name: 'Family Two Bedrooms',
      isFakeId: false
    }
  ],
  meals: [
    {
      mealTypeGroupId: 8,
      mealTypeId: 1278,
      mealTypeGroupName: 'UAI',
      mealTypeName: 'Ultra All Inclusive',
      isFakeId: false
    }
  ],
  offers: [
    {
      hotelId: 778523,
      hotelName: 'FUN&SUN SMART Hane Sun',
      stars: 5,
      categoryId: 10005,
      tourKey: '0x430A000335B5020000000100004973000001CC00000001CBD9F63AB39000000282C53807000BE11B0000A7F20000000E000004FE00000000000000000000007200000000B397000007000000000046A5F00000000302020000636363B3900000B397000002000000001400000000000000000000000000000000000000000000000000000000',
      tourName: 'Turkey (hotel only) RU Antalya',
      tourId: 460,
      partnerIncoming: 'FUN&SUN Turkey',
      partnerIncomingKey: 153140,
      townId: 304578,
      townName: 'Чолаклы',
      tourStartDate: '2025-11-09T00:00:00+00:00',
      tourEndDate: '2025-11-16T00:00:00+00:00',
      checkinDate: '2025-11-09T00:00:00+00:00',
      checkoutDate: '2025-11-16T00:00:00+00:00',
      daysCount: 7,
      nightsCount: 7,
      hotelNightsCount: 7,
      roomId: 42994,
      mealId: 1278,
      accomodation: {
        id: 14,
        name: '2AD',
        latinName: '2AD'
      },
      price: {
        value: 46347,
        oldValue: 0,
        currencyAlias: 'RUB',
        currencyId: 1
      },
      supplement: {
        adult: 0,
        child: 0,
        currency: 1
      },
      fullPrice: {
        value: 46346.30,
        oldValue: 0,
        currencyAlias: 'RUB',
        currencyId: 1
      },
      isInstantConfirmation: true,
      isRegularFlight: false,
      tourType: {
        id: 7,
        name: 'Наземное обслуживание'
      },
      paxes: {
        adultsCount: 2,
        childrenCount: 0,
        infantsCount: 0
      },
      index: 0,
      programType: {
        key: 114,
        name: 'Тариф «Промо»',
        nameAlt: '',
        icon: '37009395045',
        url: 'https://newb2b.fstravel.com/actions/tarif-promo-broniruite-tury-na-privlekatelnyx-usloviyax'
      },
      color: null,
      freights: null,
      availablePromos: [],
      spo: 'OH Promo 42383-AYT',
      hasPacketTransfer: false,
      withoutPromo: false,
      external: 0,
      listTime: ''
    },
    {
      hotelId: 778523,
      hotelName: 'FUN&SUN SMART Hane Sun',
      stars: 5,
      categoryId: 10005,
      tourKey: '0x430A000335B5020000000100004973000001CC00000001CBD9F648B39000000282C53807000BE11B0000A9560000000E000004FE00000000000000000000007200000000B39700000700000000004A4F700000000302020000636363B3900000B397000002000000001400000000000000000000000000000000000000000000000000000000',
      tourName: 'Turkey (hotel only) RU Antalya',
      tourId: 460,
      partnerIncoming: 'FUN&SUN Turkey',
      partnerIncomingKey: 153140,
      townId: 304578,
      townName: 'Чолаклы',
      tourStartDate: '2025-11-09T00:00:00+00:00',
      tourEndDate: '2025-11-16T00:00:00+00:00',
      checkinDate: '2025-11-09T00:00:00+00:00',
      checkoutDate: '2025-11-16T00:00:00+00:00',
      daysCount: 7,
      nightsCount: 7,
      hotelNightsCount: 7,
      roomId: 43350,
      mealId: 1278,
      accomodation: {
        id: 14,
        name: '2AD',
        latinName: '2AD'
      },
      price: {
        value: 48749,
        oldValue: 0,
        currencyAlias: 'RUB',
        currencyId: 1
      },
      supplement: {
        adult: 0,
        child: 0,
        currency: 1
      },
      fullPrice: {
        value: 48748.70,
        oldValue: 0,
        currencyAlias: 'RUB',
        currencyId: 1
      },
      isInstantConfirmation: true,
      isRegularFlight: false,
      tourType: {
        id: 7,
        name: 'Наземное обслуживание'
      },
      paxes: {
        adultsCount: 2,
        childrenCount: 0,
        infantsCount: 0
      },
      index: 2,
      programType: {
        key: 114,
        name: 'Тариф «Промо»',
        nameAlt: '',
        icon: '37009395045',
        url: 'https://newb2b.fstravel.com/actions/tarif-promo-broniruite-tury-na-privlekatelnyx-usloviyax'
      },
      color: null,
      freights: null,
      availablePromos: [],
      spo: 'OH Promo 42383-AYT',
      hasPacketTransfer: false,
      withoutPromo: false,
      external: 0,
      listTime: ''
    }
  ]
}

