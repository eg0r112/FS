using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Bogus;

namespace TelegramFunSun.Fields_api
{
    public static class FunSunMockStore
    {
        private static readonly object Sync = new();
        private static bool _initialized;

        public static IReadOnlyList<DepartureCityDto> Cities { get; private set; } = Array.Empty<DepartureCityDto>();
        public static IReadOnlyList<ArrivalCountryDto> Countries { get; private set; } = Array.Empty<ArrivalCountryDto>();
        public static IReadOnlyList<MockHotel> Hotels { get; private set; } = Array.Empty<MockHotel>();

        private static readonly string[] Amenities =
        {
            "Wi-Fi в номерах", "Кондиционер", "SPA-центр", "Бассейн", "Аквапарк",
            "Пляж", "Детский клуб", "Фитнес", "Ресторан", "Анимация"
        };

        private static readonly (int Id, string Name, string NameRu, string NameEn)[] Meals =
        {
            (8, "AUI", "Ультра все включено", "Ultra All Inclusive"),
            (10004, "AI", "Все включено", "All Inclusive"),
            (10003, "FB", "Полный пансион", "Full Board"),
            (10002, "HB", "Полупансион", "Half Board"),
            (10001, "BB", "Завтрак", "Bed & Breakfast"),
            (10005, "RO", "Без питания", "Room Only")
        };

        private static readonly (string Url, string Continent, string Name, int Id, string[] Regions, string[] Cities)[] CountryCatalog =
        {
            ("turkey", "europe", "Турция", 18803, new[] { "Анталья", "Аланья", "Белек", "Сиде", "Кемер", "Бодрум" }, new[] { "Чолаклы", "Кызылот", "Лара", "Текирова", "Гёйнюк" }),
            ("egypt", "africa", "Египет", 18804, new[] { "Хургада", "Шарм-эль-Шейх", "Макади", "Сахл-Хашиш" }, new[] { "Хургада", "Наама-Бей", "Макади-Бей" }),
            ("uae", "asia", "ОАЭ", 18805, new[] { "Дубай", "Абу-Даби", "Рас-эль-Хайма", "Шарджа" }, new[] { "Джумейра", "Палм-Джумейра", "Дейра" }),
            ("thailand", "asia", "Таиланд", 18806, new[] { "Пхукет", "Паттайя", "Самуи", "Бангкок" }, new[] { "Ката", "Карон", "Джомтьен" }),
            ("maldives", "asia", "Мальдивы", 18807, new[] { "Северный Мале", "Ари-Атолл", "Баа-Атолл" }, new[] { "Мале", "Хулхумале" }),
            ("cyprus", "europe", "Кипр", 223800, new[] { "Пафос", "Лимассол", "Айя-Напа", "Протарас" }, new[] { "Пафос", "Лимассол" }),
            ("greece", "europe", "Греция", 223801, new[] { "Крит", "Родос", "Корфу", "Санторини" }, new[] { "Херсониссос", "Ираклион", "Линдос" }),
            ("tunisia", "africa", "Тунис", 223802, new[] { "Хаммамет", "Сусс", "Джерба", "Монастир" }, new[] { "Ясмин-Хаммамет", "Порт-эль-Кантауи" }),
            ("vietnam", "asia", "Вьетнам", 223803, new[] { "Нячанг", "Фукуок", "Дананг", "Муйне" }, new[] { "Нячанг", "Зыонг-Донг" }),
            ("sri-lanka", "asia", "Шри-Ланка", 223804, new[] { "Бентота", "Негомбо", "Хиккадува", "Коломбо" }, new[] { "Бентота", "Унаватуна" }),
            ("georgia", "europe", "Грузия", 223991, new[] { "Батуми", "Кобулети", "Тбилиси" }, new[] { "Батуми", "Кобулети" }),
            ("russia", "europe", "Россия", 210357, new[] { "Сочи", "Крым", "Анапа", "Геленджик" }, new[] { "Адлер", "Ялта", "Анапа" })
        };

        static FunSunMockStore() => EnsureInitialized();

        public static void EnsureInitialized()
        {
            if (_initialized) return;
            lock (Sync)
            {
                if (_initialized) return;
                Randomizer.Seed = new Random(20261031);
                Cities = BuildCities();
                Countries = BuildCountries();
                Hotels = BuildHotels();
                _initialized = true;
            }
        }

        public static object GetDepartureCities() => Cities;

        public static object GetArrival(int departureCityId, string? arrivalPlaceName)
        {
            var countries = Countries.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(arrivalPlaceName))
            {
                countries = countries.Where(c =>
                    c.LocalizedName.Contains(arrivalPlaceName, StringComparison.OrdinalIgnoreCase) ||
                    c.Regions.Any(r => r.LocalizedName.Contains(arrivalPlaceName, StringComparison.OrdinalIgnoreCase)));
            }

            var seed = departureCityId == 0 ? 1 : departureCityId;
            return new
            {
                countries = countries.OrderBy(c => (c.EbgNodeId * 17 + seed) % 97).ToList(),
                regions = Array.Empty<object>(),
                cities = Array.Empty<object>(),
                hotels = Array.Empty<object>()
            };
        }

        public static object GetAvailableCheckins()
        {
            var culture = new CultureInfo("ru-RU");
            var today = DateTime.Today;
            var months = new List<object>();

            for (var offset = 0; offset < 6; offset++)
            {
                var first = new DateTime(today.Year, today.Month, 1).AddMonths(offset);
                var daysInMonth = DateTime.DaysInMonth(first.Year, first.Month);
                var mondayBased = ((int)first.DayOfWeek + 6) % 7;
                var days = new List<object>();

                for (var i = 0; i < mondayBased; i++) days.Add(EmptyDay());

                for (var day = 1; day <= daysInMonth; day++)
                {
                    var date = new DateTime(first.Year, first.Month, day);
                    var past = date < today;
                    days.Add(new
                    {
                        checkin = date.ToString("yyyy-MM-dd"),
                        classes = Array.Empty<object>(),
                        dayOfTheWeek = ((int)date.DayOfWeek + 6) % 7 + 1,
                        isCharter = !past && date.DayOfWeek is not DayOfWeek.Monday and not DayOfWeek.Wednesday,
                        isRegular = !past && date.DayOfWeek is not DayOfWeek.Sunday,
                        isReservation = !past && date.Day % 4 == 0,
                        iso = date.ToString("yyyy-MM-dd"),
                        number = day,
                        pastDay = past,
                        year = date.Year.ToString(),
                        month = culture.DateTimeFormat.GetMonthName(date.Month).ToLowerInvariant(),
                        is_nullable = false
                    });
                }

                months.Add(new
                {
                    year = first.Year.ToString(),
                    month = culture.DateTimeFormat.GetMonthName(first.Month).ToLowerInvariant(),
                    first_date = first.ToString("yyyy-MM-dd"),
                    days
                });
            }

            return months;
        }

        public static object GetNights() =>
            Enumerable.Range(1, 21).Select(n => new { night = n, selected = n == 7, disabled = n is < 3 or 20 or 21 }).ToList();

        public static object SearchTours(
            int arrivalCountryId, string minStartDate, int minNightsCount, int adults,
            string? mealTypes, string? stars, string? hotelName, double? priceMin, double? priceMax,
            bool? isInstantConfirmation, string? sort)
        {
            var startDate = ParseDate(minStartDate) ?? DateTime.Today.AddDays(14);
            var nights = Math.Clamp(minNightsCount, 3, 14);
            var hotels = Hotels.Where(h => h.CountryId == arrivalCountryId || arrivalCountryId == 0).ToList();
            if (hotels.Count == 0) hotels = Hotels.ToList();

            if (!string.IsNullOrWhiteSpace(stars))
            {
                var starSet = stars.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(s => int.TryParse(s, out var v) ? v : -1).ToHashSet();
                hotels = hotels.Where(h => starSet.Contains(h.Stars)).ToList();
            }

            if (!string.IsNullOrWhiteSpace(hotelName))
                hotels = hotels.Where(h => h.Name.Contains(hotelName, StringComparison.OrdinalIgnoreCase)).ToList();

            var tours = hotels.Select(h => BuildTour(h, startDate, nights, adults)).ToList();

            if (!string.IsNullOrWhiteSpace(mealTypes))
            {
                var mealSet = mealTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(s => int.TryParse(s, out var v) ? v : -1).ToHashSet();
                tours = tours.Where(t => t.PriceOffer.Meal.Any(m => mealSet.Contains(m.Id))).ToList();
            }

            if (priceMin.HasValue) tours = tours.Where(t => t.PriceOffer.Price[0].Value >= priceMin.Value).ToList();
            if (priceMax.HasValue) tours = tours.Where(t => t.PriceOffer.Price[0].Value <= priceMax.Value).ToList();
            if (isInstantConfirmation == true) tours = tours.Where(t => t.IsInstantConfirmation).ToList();

            tours = sort switch
            {
                "cheap" or "price_asc" => tours.OrderBy(t => t.PriceOffer.Price[0].Value).ToList(),
                "expensive" or "price_desc" => tours.OrderByDescending(t => t.PriceOffer.Price[0].Value).ToList(),
                "stars" => tours.OrderByDescending(t => t.Hotel.Stars).ToList(),
                _ => tours.OrderByDescending(t => t.IsInstantConfirmation).ThenByDescending(t => t.Hotel.TopHotels.HotelRating).ToList()
            };

            var prices = tours.Select(t => t.PriceOffer.Price[0].Value).DefaultIfEmpty(80000).ToList();
            var country = Countries.FirstOrDefault(c => c.EbgNodeId == arrivalCountryId) ?? Countries[0];
            return new { tours, filters = BuildFilters(country, hotels, prices), other = new { count_tours = tours.Count, total_counts = tours.Count, page = 1, totalPage = 1, percent = 100 } };
        }

        public static object GetObjectByUrlName(string urlName)
        {
            var hotel = Hotels.FirstOrDefault(h =>
                string.Equals(h.UrlFriendlyName, urlName, StringComparison.OrdinalIgnoreCase) ||
                h.UrlFriendlyName.EndsWith("/" + urlName, StringComparison.OrdinalIgnoreCase) ||
                h.UrlSlug.Equals(urlName, StringComparison.OrdinalIgnoreCase)) ?? Hotels[0];
            return BuildFullHotel(hotel);
        }

        public static object GetForCrmAdviceHotels(JsonElement requestBody)
        {
            var hotelIds = new List<int>();
            if (requestBody.ValueKind == JsonValueKind.Object &&
                requestBody.TryGetProperty("hotelIds", out var ids) &&
                ids.ValueKind == JsonValueKind.Array)
            {
                foreach (var id in ids.EnumerateArray())
                    if (id.TryGetInt32(out var n)) hotelIds.Add(n);
            }

            var startDate = DateTime.Today.AddDays(14);
            var nights = 7;
            var adults = 2;
            if (requestBody.ValueKind == JsonValueKind.Object)
            {
                if (TryGetString(requestBody, "minStartDate", out var minStart))
                    startDate = ParseDate(minStart) ?? startDate;
                if (TryGetString(requestBody, "nightsFrom", out var nightsFrom) && int.TryParse(nightsFrom, out var nFrom))
                    nights = Math.Clamp(nFrom, 3, 14);
                if (TryGetString(requestBody, "adults", out var adultsRaw) && int.TryParse(adultsRaw, out var a))
                    adults = Math.Max(1, a);
            }

            var hotel = Hotels.FirstOrDefault(h => hotelIds.Contains(h.Id)) ?? Hotels[0];
            var faker = new Faker("ru");
            var rooms = new[]
            {
                new { id = 101, name = "Standard Room", isFakeId = false },
                new { id = 102, name = "Superior Sea View", isFakeId = false },
                new { id = 103, name = "Family Room", isFakeId = false },
                new { id = 104, name = "Deluxe Suite", isFakeId = false },
                new { id = 105, name = "Villa with Pool", isFakeId = false }
            };

            var meals = Meals.Select(m => new
            {
                mealTypeGroupId = m.Id,
                mealTypeId = m.Id,
                mealTypeGroupName = m.NameRu,
                mealTypeName = m.Name,
                isFakeId = false
            }).ToList();

            var offers = new List<object>();
            var index = 0;
            foreach (var room in rooms)
            {
                foreach (var meal in Meals.Take(4))
                {
                    var basePrice = hotel.BasePrice + room.id * 180 + meal.Id % 100 * 90 + faker.Random.Int(0, 8000);
                    var oldPrice = (int)Math.Round(basePrice * faker.Random.Double(1.15, 1.45));
                    offers.Add(new
                    {
                        hotelId = hotel.Id,
                        hotelName = hotel.Name,
                        stars = hotel.Stars,
                        categoryId = hotel.Stars,
                        tourKey = Guid.NewGuid().ToString("N")[..16],
                        tourName = $"{hotel.Name} / {room.name} / {meal.Name}",
                        tourId = 900000 + hotel.Id + index,
                        partnerIncoming = "FS",
                        partnerIncomingKey = 1,
                        townId = hotel.CityId,
                        townName = hotel.CityName,
                        tourStartDate = startDate.ToString("yyyy-MM-dd"),
                        tourEndDate = startDate.AddDays(nights).ToString("yyyy-MM-dd"),
                        checkinDate = startDate.ToString("yyyy-MM-dd"),
                        checkoutDate = startDate.AddDays(nights).ToString("yyyy-MM-dd"),
                        daysCount = nights + 1,
                        nightsCount = nights,
                        hotelNightsCount = nights,
                        roomId = room.id,
                        mealId = meal.Id,
                        accomodation = new { id = adults, name = $"{adults} взрослых", latinName = $"{adults}ADL" },
                        price = new { value = basePrice, oldValue = oldPrice, currencyAlias = "RUB", currencyId = 1 },
                        supplement = new { adult = 8000, child = 4000, currency = 1 },
                        fullPrice = new { value = basePrice + 18000, oldValue = oldPrice + 18000, currencyAlias = "RUB", currencyId = 1 },
                        isInstantConfirmation = hotel.Instant,
                        isRegularFlight = index % 3 == 0,
                        tourType = new { id = 36, name = "Пляжный" },
                        paxes = new { adultsCount = adults, childrenCount = 0, infantsCount = 0 },
                        index,
                        programType = new { key = 1, name = "Пакетный тур", nameAlt = "Package", icon = "", url = "" },
                        color = (string?)null,
                        freights = (object?)null,
                        availablePromos = Array.Empty<object>(),
                        spo = "",
                        hasPacketTransfer = true,
                        withoutPromo = false,
                        external = 0,
                        listTime = DateTime.UtcNow.ToString("O")
                    });
                    index++;
                }
            }

            return new { rooms, meals, offers, fullHotel = BuildFullHotel(hotel) };
        }

        private static IReadOnlyList<DepartureCityDto> BuildCities()
        {
            var catalog = new (int Id, string Name)[]
            {
                (274286, "Москва"), (274287, "Санкт-Петербург"), (274288, "Казань"),
                (274289, "Екатеринбург"), (274290, "Новосибирск"), (274291, "Краснодар"),
                (274292, "Самара"), (274293, "Ростов-на-Дону"), (274294, "Уфа"),
                (274295, "Пермь"), (274296, "Воронеж"), (274297, "Нижний Новгород"),
                (274298, "Челябинск"), (274299, "Тюмень"), (274300, "Калининград"),
                (274301, "Минеральные Воды"), (274302, "Сочи"), (274303, "Иркутск")
            };
            return catalog.Select(c => new DepartureCityDto
            {
                Id = Guid.NewGuid().ToString(),
                EbgNodeId = c.Id,
                LocalizedName = c.Name,
                CountryEbgNodeId = 210357,
                CountryLocalizedName = "Россия"
            }).ToList();
        }

        private static IReadOnlyList<ArrivalCountryDto> BuildCountries()
        {
            var faker = new Faker("ru");
            return CountryCatalog.Select((c, i) => new ArrivalCountryDto
            {
                Id = Guid.NewGuid().ToString(),
                EbgNodeId = c.Id,
                LocalizedName = c.Name,
                PriorityTours = faker.Random.Int(10, 99),
                PriorityHotels = faker.Random.Int(10, 99),
                PriorityExcursionTour = faker.Random.Int(1, 40),
                UrlName = c.Url,
                IsVisaRequired = i is 2 or 4 or 8,
                OpenTours = true,
                OpenHotels = true,
                FlightType = new FlightTypeDto { Id = 1, Name = "charter", LocalizedName = "Чартер" },
                Regions = c.Regions.Select((r, ri) => new ArrivalRegionDto { EbgNodeId = c.Id * 10 + ri + 1, LocalizedName = r }).ToList()
            }).ToList();
        }

        private static IReadOnlyList<MockHotel> BuildHotels()
        {
            var hotels = new List<MockHotel>();
            var id = 770000;
            foreach (var country in CountryCatalog)
            {
                var hotelFaker = new Faker<MockHotel>("en").CustomInstantiator(f =>
                {
                    id++;
                    var city = f.PickRandom(country.Cities);
                    var region = f.PickRandom(country.Regions);
                    var stars = f.PickRandom(3, 4, 5, 5, 4);
                    var brand = f.PickRandom("FUN&SUN", "Calimera", "Barut", "Rixos", "Maxx Royal", "Crystal", "Selectum", "TUI Blue", "Kaya", "Delphin");
                    var suffix = f.PickRandom("Resort", "Palace", "Beach", "Club", "Grand", "Spa", "Villa", "Park");
                    var name = $"{brand} {f.Address.City().Split(' ')[0]} {suffix}";
                    var slug = Slug(name);
                    return new MockHotel
                    {
                        Id = id,
                        GeoId = Guid.NewGuid().ToString(),
                        Name = name,
                        Stars = stars,
                        CityId = 400000 + id % 900,
                        CityName = city,
                        RegionName = region,
                        CountryName = country.Name,
                        CountryId = country.Id,
                        Continent = country.Continent,
                        CountryUrl = country.Url,
                        UrlSlug = slug,
                        UrlFriendlyName = $"hotel/{country.Continent}/{country.Url}/{Slug(region)}/{Slug(city)}/{slug}",
                        PhotoUrl = $"https://picsum.photos/seed/hotel{id}/1200/800",
                        GalleryUrls = Enumerable.Range(1, f.Random.Int(4, 8)).Select(n => $"https://picsum.photos/seed/hotel{id}g{n}/1200/800").ToList(),
                        Rating = Math.Round(f.Random.Double(3.9, 4.9), 2),
                        RatesCount = f.Random.Int(80, 2400),
                        Instant = f.Random.Bool(0.7f),
                        BasePrice = f.Random.Int(42000, 280000) + stars * 8000,
                        ShortText = $"Отель {stars}* в курорте {city}, {country.Name}.",
                        Description = $"{name} — {stars}-звёздочный отель в районе {city}."
                    };
                });
                hotels.AddRange(hotelFaker.Generate(8));
            }
            return hotels;
        }

        private static TourDto BuildTour(MockHotel hotel, DateTime startDate, int nights, int adults)
        {
            var faker = new Faker("ru");
            var meal = faker.PickRandom(Meals);
            var price = hotel.BasePrice + nights * 3500 + adults * 4200;
            var oldPrice = (int)Math.Round(price * faker.Random.Double(1.12, 1.55));
            var sale = Math.Round((1 - (double)price / oldPrice) * 100, 2);
            var iso = startDate.ToString("yyyy-MM-dd") + "T00:00:00Z";
            return new TourDto
            {
                Md5Id = Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(hotel.Id + iso + nights))).ToLowerInvariant(),
                StartDate = iso,
                IsInstantConfirmation = hotel.Instant,
                Hotel = new HotelDto
                {
                    Id = hotel.Id,
                    GeoId = hotel.GeoId,
                    Name = hotel.Name,
                    Stars = hotel.Stars,
                    CityName = hotel.CityName,
                    CountryName = hotel.CountryName,
                    PhotoUrl = hotel.PhotoUrl,
                    GalleryUrls = hotel.GalleryUrls,
                    UrlFriendlyName = hotel.UrlFriendlyName,
                    TopHotels = new TopHotelsDto
                    {
                        Rating = hotel.Rating.ToString(CultureInfo.InvariantCulture),
                        RatesCount = hotel.RatesCount,
                        MealRating = (hotel.Rating + 0.1).ToString("0.######", CultureInfo.InvariantCulture),
                        ServiceRating = (hotel.Rating - 0.05).ToString("0.######", CultureInfo.InvariantCulture),
                        HotelRating = hotel.Rating
                    },
                    PriorityFilters = faker.PickRandom(Amenities, 3).Select((a, i) => new HotelFilterDto
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = a,
                        IsPriority = true,
                        Priority = i + 1
                    }).ToList()
                },
                PriceOffer = new PriceOfferDto
                {
                    TourTypeId = 36,
                    HotelAvailability = hotel.Instant ? "YYYY" : "YNYN",
                    Meal = new List<MealDto> { new() { Id = meal.Id, Name = meal.Name, NameRu = meal.NameRu, NameEn = meal.NameEn, Translate = "tourSearch/countryData.meal" + meal.Name } },
                    FlightTypes = new List<FlightTypeOfferDto> { new() { Id = 1, Name = "charter", StartDate = iso } },
                    Price = new List<PriceDto> { Price(price, oldPrice, sale, iso, meal, nights) },
                    FullPrice = new List<PriceDto> { Price(price + 18000, oldPrice + 18000, sale, iso, meal, nights) },
                    Supplement = new List<SupplementDto>
                    {
                        new() { Adult = 9000, Child = 4500, Currency = 1, StartDate = iso, FlightTypeId = 1, FlightTypeName = "charter", MealId = meal.Id, MealName = meal.Name, NightsCount = nights.ToString() }
                    },
                    People = new PeopleDto { Adults = adults.ToString() },
                    DepartureTimeOptions = new List<string> { "02:45", "04:10", "07:00", "08:10", "12:00", "14:00", "16:55", "21:30" }
                }
            };
        }

        private static PriceDto Price(int value, int oldValue, double sale, string iso, (int Id, string Name, string NameRu, string NameEn) meal, int nights) =>
            new()
            {
                Value = value, OldValue = oldValue, SalePrice = sale, CurrencyAlias = "RUB", CurrencyId = "1",
                StartDate = iso, FlightTypeId = 1, FlightTypeName = "charter", MealId = meal.Id, MealName = meal.Name,
                MealNameEn = meal.NameEn, NightsCount = nights.ToString()
            };

        private static object BuildFilters(ArrivalCountryDto country, List<MockHotel> hotels, List<int> prices)
        {
            object Filter(string nameRu, string param, int order, object data) => new
            {
                name_ru = nameRu, name = param, paramName = param, translate = param, sortOrder = order, data
            };
            var min = prices.Count == 0 ? 40000 : prices.Min();
            var max = prices.Count == 0 ? 400000 : prices.Max();
            return new
            {
                md5_id = Guid.NewGuid().ToString("N"),
                country = new
                {
                    id = country.Id, ebgNodeId = country.EbgNodeId, localizedName = country.LocalizedName, urlName = country.UrlName,
                    caseForms = new { nominativeCase = country.LocalizedName, genitiveCase = country.LocalizedName, dativeCase = country.LocalizedName, accusativeCase = country.LocalizedName, instrumentalCase = country.LocalizedName, prepositionalCase = country.LocalizedName }
                },
                popularTypes = Filter("Популярные фильтры", "popularTypes", 1, new object[] { new { id = "10004", name_ru = "Все включено", translate = "AI", paramName = "mealTypes", sortOrder = 1 } }),
                enrichment = "",
                price = Filter("Стоимость", "price", 2, new object[]
                {
                    new { id = min, name_ru = "", translate = "", paramName = "priceMin", sortOrder = 1 },
                    new { id = max, name_ru = "", translate = "", paramName = "priceMax", sortOrder = 2 }
                }),
                searchHotel = Filter("Поиск отеля", "hotelName", 3, Array.Empty<object>()),
                regionsAndResorts = new
                {
                    name_ru = "Регионы и курорты", name = "regionsAndResorts", translate = "regions", sortOrder = 4,
                    data = country.Regions.Select(r => new { id = Guid.NewGuid().ToString(), ebgNodeId = r.EbgNodeId, localizedName = r.LocalizedName, urlName = Slug(r.LocalizedName), children = Array.Empty<object>() }).ToList()
                },
                categoryOfHotel = Filter("Категория отеля", "stars", 5, new object[]
                {
                    new { id = 5, name_ru = "5 звезд", name = "5", sortOrder = 1 },
                    new { id = 4, name_ru = "4 звезды", name = "4", sortOrder = 2 },
                    new { id = 3, name_ru = "3 звезды", name = "3", sortOrder = 3 }
                }),
                isInstantConfirmation = Filter("Только мгновенное подтверждение", "isInstantConfirmation", 6, Array.Empty<object>()),
                mealTypes = Filter("Питание", "mealTypes", 7, Meals.Select((m, i) => new { id = m.Id, name_ru = m.NameRu, name = m.Name, name_en = m.NameEn, translate = m.Name, sortOrder = i + 1 }).ToList()),
                topHotels = Filter("Рейтинг по отзывам", "topHotels", 8, new object[]
                {
                    new { id = 4, name_ru = "Любой", sortOrder = 1 },
                    new { id = 1, name_ru = "Хорошо: 4 и выше", sortOrder = 4 }
                }),
                placementTypes = Filter("Тип размещения", "placementTypes", 9, new object[] { new { id = Guid.NewGuid().ToString(), name_ru = "Курортный отель", sortOrder = 1 } }),
                tourTypes = Filter("Тип отдыха", "tourTypes", 10, new object[] { new { id = Guid.NewGuid().ToString(), name_ru = "Пляжный", sortOrder = 1 } }),
                distanceSea = Filter("Расстояние до моря", "distanceSea", 11, new object[] { new { id = Guid.NewGuid().ToString(), name_ru = "1-я линия", sortOrder = 1 } }),
                beach = Filter("Пляж", "beach", 12, new object[] { new { id = Guid.NewGuid().ToString(), name_ru = "Песчаный пляж", sortOrder = 1 } }),
                funSunHotels = Filter("Отели FUN&SUN", "funSunHotels", 13, Array.Empty<object>()),
                locations = Filter("Расположение", "locations", 14, hotels.Select(h => h.CityName).Distinct().Select((c, i) => new { id = 5000 + i, name_ru = c, sortOrder = i + 1 }).ToList()),
                hotelTypes = Filter("Тип отеля", "hotelTypes", 15, Array.Empty<object>()),
                forKids = Filter("Для детей", "forKids", 16, Array.Empty<object>()),
                flightTypes = Filter("Тип рейса", "flightTypes", 17, new object[] { new { id = "charter", name_ru = "Чартер", sortOrder = 1 } }),
                waterActivities = Filter("Водные развлечения", "waterActivities", 18, Array.Empty<object>()),
                additionally = Filter("Дополнительно", "additionally", 19, Array.Empty<object>()),
                placementFeatures = Filter("Особенности размещения", "placementFeatures", 20, Array.Empty<object>())
            };
        }

        private static object BuildFullHotel(MockHotel hotel) => new
        {
            id = hotel.GeoId,
            localizedName = hotel.Name,
            ebgNodeId = hotel.Id,
            objectType = "Hotel",
            address = $"{hotel.CityName}, {hotel.CountryName}",
            phone = "+90 242 000 00 00",
            fax = "",
            website = "https://fstravel.com",
            email = "hotel@example.com",
            constructionYear = 2008,
            renovationYear = 2022,
            distanceToTheBeach = "50 м",
            distanceToAirport = "45 км",
            latitude = 36.85,
            longitude = 31.1,
            urlName = hotel.UrlFriendlyName,
            shortText = hotel.ShortText,
            generalDescription = hotel.Description,
            images = hotel.GalleryUrls.Select((src, i) => new { id = Guid.NewGuid().ToString(), resolutionType = "large", imageType = i == 0 ? "Main" : "Gallery", description = hotel.Name, sortOrder = i, src }).ToList(),
            hotelCategory = new { id = hotel.Stars, name = $"{hotel.Stars}*", displayName = $"{hotel.Stars} звезды" },
            topHotels = new { id = hotel.Id, rating = hotel.Rating, mealRating = hotel.Rating + 0.1, ratesCount = hotel.RatesCount, hotelRating = hotel.Rating, serviceRating = hotel.Rating - 0.05 },
            typeTags = new[] { new { id = 1, name = "Beach", localizedName = "Пляжный" } },
            restTypes = new[] { new { id = 1, name = "Пляжный", isDeleted = false } },
            recommendations = new[] { new { id = 1, name = "Для пар" }, new { id = 2, name = "Для семей" } },
            roomTypes = new[]
            {
                new
                {
                    samoId = 101, numberOfBeds = 2, square = 28, name = "Standard Room", alternativeName = "Стандарт",
                    description = "Стандартный номер с балконом", status = "Active",
                    amenities = Amenities.Take(4).Select((a, i) => new { id = Guid.NewGuid().ToString(), name = a, sortOrder = i, payType = "Free", iconUrl = "" }).ToList(),
                    images = hotel.GalleryUrls.Take(2).Select((src, i) => new { id = Guid.NewGuid().ToString(), resolutionType = "large", imageType = "Room", description = "Номер", sortOrder = i, src }).ToList()
                }
            },
            descriptionBlocks = Array.Empty<object>(),
            caseForms = new { nominativeCase = hotel.Name, genitiveCase = hotel.Name, dativeCase = hotel.Name, accusativeCase = hotel.Name, instrumentalCase = hotel.Name, prepositionalCase = hotel.Name }
        };

        private static object EmptyDay() => new
        {
            checkin = "", classes = Array.Empty<object>(), dayOfTheWeek = 0, isCharter = false, isRegular = false,
            isReservation = false, iso = "", number = 0, pastDay = false, year = "", month = "", is_nullable = true
        };

        private static string Slug(string value)
        {
            var map = new Dictionary<char, string>
            {
                ['а'] = "a", ['б'] = "b", ['в'] = "v", ['г'] = "g", ['д'] = "d", ['е'] = "e", ['ё'] = "e",
                ['ж'] = "zh", ['з'] = "z", ['и'] = "i", ['й'] = "y", ['к'] = "k", ['л'] = "l", ['м'] = "m",
                ['н'] = "n", ['о'] = "o", ['п'] = "p", ['р'] = "r", ['с'] = "s", ['т'] = "t", ['у'] = "u",
                ['ф'] = "f", ['х'] = "h", ['ц'] = "ts", ['ч'] = "ch", ['ш'] = "sh", ['щ'] = "sch", ['ъ'] = "",
                ['ы'] = "y", ['ь'] = "", ['э'] = "e", ['ю'] = "yu", ['я'] = "ya"
            };
            var sb = new StringBuilder();
            foreach (var ch in value.ToLowerInvariant())
            {
                if (map.TryGetValue(ch, out var repl)) sb.Append(repl);
                else if (char.IsLetterOrDigit(ch)) sb.Append(ch);
                else if (ch is ' ' or '-' or '_') sb.Append('-');
            }
            return sb.ToString().Trim('-');
        }

        private static DateTime? ParseDate(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null :
            DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var date) ? date.Date : null;

        private static bool TryGetString(JsonElement el, string name, out string value)
        {
            value = "";
            if (!el.TryGetProperty(name, out var prop)) return false;
            value = prop.ValueKind == JsonValueKind.String ? prop.GetString() ?? "" : prop.ToString();
            return !string.IsNullOrWhiteSpace(value);
        }
    }

    public class DepartureCityDto { public string Id { get; set; } = ""; public int EbgNodeId { get; set; } public string LocalizedName { get; set; } = ""; public int CountryEbgNodeId { get; set; } public string CountryLocalizedName { get; set; } = ""; }
    public class ArrivalRegionDto { public int EbgNodeId { get; set; } public string LocalizedName { get; set; } = ""; }
    public class FlightTypeDto { public int Id { get; set; } public string Name { get; set; } = ""; public string LocalizedName { get; set; } = ""; }
    public class ArrivalCountryDto
    {
        public string Id { get; set; } = ""; public int EbgNodeId { get; set; } public string LocalizedName { get; set; } = "";
        public int PriorityTours { get; set; } public int PriorityHotels { get; set; } public int PriorityExcursionTour { get; set; }
        public string UrlName { get; set; } = ""; public bool IsVisaRequired { get; set; } public bool OpenTours { get; set; } public bool OpenHotels { get; set; }
        public FlightTypeDto FlightType { get; set; } = new(); public List<ArrivalRegionDto> Regions { get; set; } = new();
    }
    public class MockHotel
    {
        public int Id { get; set; } public string GeoId { get; set; } = ""; public string Name { get; set; } = ""; public int Stars { get; set; }
        public int CityId { get; set; } public string CityName { get; set; } = ""; public string RegionName { get; set; } = "";
        public string CountryName { get; set; } = ""; public int CountryId { get; set; } public string Continent { get; set; } = "";
        public string CountryUrl { get; set; } = ""; public string UrlSlug { get; set; } = ""; public string UrlFriendlyName { get; set; } = "";
        public string PhotoUrl { get; set; } = ""; public List<string> GalleryUrls { get; set; } = new(); public double Rating { get; set; }
        public int RatesCount { get; set; } public bool Instant { get; set; } public int BasePrice { get; set; }
        public string ShortText { get; set; } = ""; public string Description { get; set; } = "";
    }
    public class TourDto { [JsonPropertyName("md5_id")] public string Md5Id { get; set; } = ""; public string StartDate { get; set; } = ""; public bool IsInstantConfirmation { get; set; } public HotelDto Hotel { get; set; } = new(); public PriceOfferDto PriceOffer { get; set; } = new(); }
    public class HotelDto { public int Id { get; set; } public string GeoId { get; set; } = ""; public string Name { get; set; } = ""; public int Stars { get; set; } public string CityName { get; set; } = ""; public string CountryName { get; set; } = ""; public string PhotoUrl { get; set; } = ""; public List<string> GalleryUrls { get; set; } = new(); public string UrlFriendlyName { get; set; } = ""; public TopHotelsDto TopHotels { get; set; } = new(); public List<HotelFilterDto> PriorityFilters { get; set; } = new(); }
    public class TopHotelsDto { public string Rating { get; set; } = ""; public int RatesCount { get; set; } public string MealRating { get; set; } = ""; public string ServiceRating { get; set; } = ""; public double HotelRating { get; set; } }
    public class HotelFilterDto { public string Id { get; set; } = ""; public string Name { get; set; } = ""; [JsonPropertyName("is_priority")] public bool IsPriority { get; set; } public int Priority { get; set; } }
    public class PriceOfferDto { public int TourTypeId { get; set; } public string HotelAvailability { get; set; } = ""; public List<MealDto> Meal { get; set; } = new(); public List<FlightTypeOfferDto> FlightTypes { get; set; } = new(); public List<PriceDto> Price { get; set; } = new(); public List<PriceDto> FullPrice { get; set; } = new(); public List<SupplementDto> Supplement { get; set; } = new(); public PeopleDto People { get; set; } = new(); public List<string> DepartureTimeOptions { get; set; } = new(); }
    public class MealDto { public int Id { get; set; } public string Name { get; set; } = ""; [JsonPropertyName("name_ru")] public string NameRu { get; set; } = ""; [JsonPropertyName("name_en")] public string NameEn { get; set; } = ""; public string Translate { get; set; } = ""; }
    public class FlightTypeOfferDto { public int Id { get; set; } public string Name { get; set; } = ""; public string StartDate { get; set; } = ""; }
    public class PriceDto { public int Value { get; set; } public int OldValue { get; set; } public double SalePrice { get; set; } public string CurrencyAlias { get; set; } = "RUB"; public string CurrencyId { get; set; } = "1"; public string StartDate { get; set; } = ""; public int FlightTypeId { get; set; } public string FlightTypeName { get; set; } = ""; public int MealId { get; set; } public string MealName { get; set; } = ""; public string MealNameEn { get; set; } = ""; public string NightsCount { get; set; } = ""; }
    public class SupplementDto { public int Adult { get; set; } public int Child { get; set; } public int Currency { get; set; } public string StartDate { get; set; } = ""; public int FlightTypeId { get; set; } public string FlightTypeName { get; set; } = ""; public int MealId { get; set; } public string MealName { get; set; } = ""; public string NightsCount { get; set; } = ""; }
    public class PeopleDto { public string Adults { get; set; } = "2"; public string? Children { get; set; } }
}
