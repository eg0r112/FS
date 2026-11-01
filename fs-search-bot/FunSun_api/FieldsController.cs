using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace TelegramFunSun.Fields_api
{
    [ApiController]
    [Route("api/v1/ru/fields")]
    public class FieldsController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private const string ClientKey = "e289ae03-720f-4ef6-b934-02675eed817d";
        private const string BaseUrl = "https://service-api.fstravel.com";
        private const string UserAgent = "mopsapp_b2c_ru";

        public FieldsController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _configuration = configuration;
        }

        /// <summary>
        /// Получить список городов отправления
        /// </summary>
        [HttpGet("get-departure-cities")]
        [ProducesResponseType(typeof(object), 200)]
        public Task<IActionResult> GetDepartureCities()
        {
            // Fun&Sun service-api недоступен — моки.
            // var url = $"{BaseUrl}/api/v1/ru/fields/get-departure-cities";
            // var request = new HttpRequestMessage(HttpMethod.Get, url);
            // request.Headers.Add("X-User-Agent", UserAgent);
            // var response = await _httpClient.SendAsync(request);
            return Task.FromResult<IActionResult>(Ok(FunSunMockStore.GetDepartureCities()));
        }

        /// <summary>
        /// Получить список мест прибытия
        /// </summary>
        [HttpGet("get-arrival")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> GetArrival(
            [FromQuery] int departureCityId,
            [FromQuery] string whoRequest = "tours",
            [FromQuery] string? arrivalPlaceName = null,
            [FromQuery] int? tourType = null,
            [FromQuery] bool? onlyWithWeekendTours = null,
            [FromQuery] bool? excludeExcursionsFromHotels = null)
        {
            var queryParams = new List<string>
            {
                $"departureCityId={departureCityId}",
                $"whoRequest={whoRequest}"
            };

            if (!string.IsNullOrEmpty(arrivalPlaceName))
                queryParams.Add($"arrivalPlaceName={Uri.EscapeDataString(arrivalPlaceName)}");

            if (tourType.HasValue)
                queryParams.Add($"tourType={tourType.Value}");

            if (onlyWithWeekendTours.HasValue)
                queryParams.Add($"onlyWithWeekendTours={onlyWithWeekendTours.Value.ToString().ToLower()}");

            if (excludeExcursionsFromHotels.HasValue)
                queryParams.Add($"ExcludeExcursionsFromHotels={excludeExcursionsFromHotels.Value.ToString().ToLower()}");

            // var url = $"{BaseUrl}/api/v1/ru/fields/get-arrival?{string.Join("&", queryParams)}";
            return Ok(FunSunMockStore.GetArrival(departureCityId, arrivalPlaceName));
        }

        /// <summary>
        /// Получить доступные даты заезда
        /// </summary>
        [HttpGet("get-available-checkins")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> GetAvailableCheckins(
            [FromQuery] int arrivalCountryId,
            [FromQuery] int departureCityId,
            [FromQuery] int adultsCount,
            [FromQuery] bool? isResirvation = null,
            [FromQuery] string? hotelIds = null,
            [FromQuery] int? tourType = null,
            [FromQuery] string? regionIds = null,
            [FromQuery] string? arrivalCityIds = null,
            [FromQuery] bool? isEmpty = null)
        {
            var queryParams = new List<string>
            {
                $"arrivalCountryId={arrivalCountryId}",
                $"departureCityId={departureCityId}",
                $"adultsCount={adultsCount}"
            };

            if (isResirvation.HasValue)
                queryParams.Add($"isResirvation={isResirvation.Value.ToString().ToLower()}");

            if (!string.IsNullOrEmpty(hotelIds))
                queryParams.Add($"hotelIds={hotelIds}");

            if (tourType.HasValue)
                queryParams.Add($"tourType={tourType.Value}");

            if (!string.IsNullOrEmpty(regionIds))
                queryParams.Add($"regionIds={regionIds}");

            if (!string.IsNullOrEmpty(arrivalCityIds))
                queryParams.Add($"arrivalCityIds={arrivalCityIds}");

            if (isEmpty.HasValue)
                queryParams.Add($"isEmpty={isEmpty.Value.ToString().ToLower()}");

            // var url = $"{BaseUrl}/api/v1/ru/fields/get-available-checkins?{string.Join("&", queryParams)}";
            return Ok(FunSunMockStore.GetAvailableCheckins());
        }

        /// <summary>
        /// Получить количество ночей по типу перевозки
        /// </summary>
        [HttpGet("get-nights-by-freight-type")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> GetNightsByFreightType(
            [FromQuery] int departureCityId,
            [FromQuery] int arrivalCountryId,
            [FromQuery] int adult,
            [FromQuery] string checkinBeg,
            [FromQuery] string checkinEnd,
            [FromQuery] int child,
            [FromQuery] int freightType,
            [FromQuery] string? regions = null,
            [FromQuery] string? tours = null,
            [FromQuery] int? tourType = null)
        {
            // Нормализуем даты (убираем время, оставляем только дату)
            var normalizedCheckinBeg = NormalizeDate(checkinBeg);
            var normalizedCheckinEnd = NormalizeDate(checkinEnd);
            
            var queryParams = new List<string>
            {
                $"departureCityId={departureCityId}",
                $"arrivalCountryId={arrivalCountryId}",
                $"adult={adult}",
                $"checkinBeg={Uri.EscapeDataString(normalizedCheckinBeg)}",
                $"checkinEnd={Uri.EscapeDataString(normalizedCheckinEnd)}",
                $"child={child}",
                $"freightType={freightType}"
            };

            // Добавляем regions только если он передан
            if (!string.IsNullOrEmpty(regions))
                queryParams.Add($"regions={Uri.EscapeDataString(regions)}");

            if (!string.IsNullOrEmpty(tours))
                queryParams.Add($"tours={Uri.EscapeDataString(tours)}");

            if (tourType.HasValue)
                queryParams.Add($"tourType={tourType.Value}");

            // var url = $"{BaseUrl}/api/v1/ru/fields/get-nights-by-freight-type?{string.Join("&", queryParams)}";
            return Ok(FunSunMockStore.GetNights());
        }

        /// <summary>
        /// Поиск туров по стране
        /// </summary>
        [HttpGet("/api/v1/ru/search/get-by-country")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> GetByCountry(
            [FromQuery] string sort,
            [FromQuery] int departureCityId,
            [FromQuery] int arrivalCountryId,
            [FromQuery] string minStartDate,
            [FromQuery] string maxStartDate,
            [FromQuery] int minNightsCount,
            [FromQuery] int maxNightsCount,
            [FromQuery] int adults,
            [FromQuery] string flightTypes,
            [FromQuery] string? arrivalCityIds = null,
            [FromQuery] string? arrivalRegionIds = null,
            [FromQuery] string? children = null,
            // Фильтры
            [FromQuery] string? mealTypes = null,
            [FromQuery] string? stars = null,
            [FromQuery] int? topHotels = null,
            [FromQuery] string? placementTypes = null,
            [FromQuery] string? tourTypes = null,
            [FromQuery] string? distanceSea = null,
            [FromQuery] string? beach = null,
            [FromQuery] string? funSunHotels = null,
            [FromQuery] string? locations = null,
            [FromQuery] string? hotelTypes = null,
            [FromQuery] string? forKids = null,
            [FromQuery] string? waterActivities = null,
            [FromQuery] string? additionally = null,
            [FromQuery] string? placementFeatures = null,
            [FromQuery] double? priceMin = null,
            [FromQuery] double? priceMax = null,
            [FromQuery] string? hotelName = null,
            [FromQuery] bool? isInstantConfirmation = null)
        {
            var queryParams = new List<string>
            {
                $"sort={Uri.EscapeDataString(sort)}",
                $"departureCityId={departureCityId}",
                $"arrivalCountryId={arrivalCountryId}",
                $"minStartDate={Uri.EscapeDataString(minStartDate)}",
                $"maxStartDate={Uri.EscapeDataString(maxStartDate)}",
                $"minNightsCount={minNightsCount}",
                $"maxNightsCount={maxNightsCount}",
                $"adults={adults}",
                $"flightTypes={Uri.EscapeDataString(flightTypes)}"
            };

            if (!string.IsNullOrEmpty(arrivalCityIds))
                queryParams.Add($"arrivalCityIds={arrivalCityIds}");

            if (!string.IsNullOrEmpty(arrivalRegionIds))
                queryParams.Add($"arrivalRegionIds={arrivalRegionIds}");

            // Добавляем параметр children если он передан
            // Формат: "4,6" - возрасты детей через запятую
            if (!string.IsNullOrEmpty(children))
            {
                queryParams.Add($"children={Uri.EscapeDataString(children)}");
            }

            // Добавляем параметры фильтров
            if (!string.IsNullOrEmpty(mealTypes))
                queryParams.Add($"mealTypes={Uri.EscapeDataString(mealTypes)}");

            if (!string.IsNullOrEmpty(stars))
                queryParams.Add($"stars={Uri.EscapeDataString(stars)}");

            if (topHotels.HasValue)
                queryParams.Add($"topHotels={topHotels.Value}");

            if (!string.IsNullOrEmpty(placementTypes))
                queryParams.Add($"placementTypes={Uri.EscapeDataString(placementTypes)}");

            if (!string.IsNullOrEmpty(tourTypes))
                queryParams.Add($"tourTypes={Uri.EscapeDataString(tourTypes)}");

            if (!string.IsNullOrEmpty(distanceSea))
                queryParams.Add($"distanceSea={Uri.EscapeDataString(distanceSea)}");

            if (!string.IsNullOrEmpty(beach))
                queryParams.Add($"beach={Uri.EscapeDataString(beach)}");

            if (!string.IsNullOrEmpty(funSunHotels))
                queryParams.Add($"funSunHotels={Uri.EscapeDataString(funSunHotels)}");

            if (!string.IsNullOrEmpty(locations))
                queryParams.Add($"locations={Uri.EscapeDataString(locations)}");

            if (!string.IsNullOrEmpty(hotelTypes))
                queryParams.Add($"hotelTypes={Uri.EscapeDataString(hotelTypes)}");

            if (!string.IsNullOrEmpty(forKids))
                queryParams.Add($"forKids={Uri.EscapeDataString(forKids)}");

            if (!string.IsNullOrEmpty(waterActivities))
                queryParams.Add($"waterActivities={Uri.EscapeDataString(waterActivities)}");

            if (!string.IsNullOrEmpty(additionally))
                queryParams.Add($"additionally={Uri.EscapeDataString(additionally)}");

            if (!string.IsNullOrEmpty(placementFeatures))
                queryParams.Add($"placementFeatures={Uri.EscapeDataString(placementFeatures)}");

            if (priceMin.HasValue)
                queryParams.Add($"priceMin={priceMin.Value}");

            if (priceMax.HasValue)
                queryParams.Add($"priceMax={priceMax.Value}");

            if (!string.IsNullOrEmpty(hotelName))
                queryParams.Add($"hotelName={Uri.EscapeDataString(hotelName)}");

            if (isInstantConfirmation.HasValue)
                queryParams.Add($"isInstantConfirmation={isInstantConfirmation.Value.ToString().ToLower()}");

            // var url = $"{BaseUrl}/api/v1/ru/search/get-by-country?{string.Join("&", queryParams)}";
            return Ok(FunSunMockStore.SearchTours(
                arrivalCountryId, minStartDate, minNightsCount, adults,
                mealTypes, stars, hotelName, priceMin, priceMax, isInstantConfirmation, sort));
        }

        /// <summary>
        /// Поиск туров по стране
        /// </summary>
        [HttpGet("/api/v1/ru/geo/get-object-by-urlname")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> GetByCountry(
            [FromQuery] string isFull,
            [FromQuery] string urlName)
        {
            var queryParams = new List<string>
            {
                $"isFull={Uri.EscapeDataString(isFull)}",
                $"urlName={Uri.EscapeDataString(urlName)}"
            };

            // var url = $"{BaseUrl}/api/v1/ru/geo/get-object-by-urlname?{string.Join("&", queryParams)}";
            return Ok(FunSunMockStore.GetObjectByUrlName(urlName));
        }

        // /// <summary>
        // /// Вспомогательный метод для поиска в JSON
        // /// </summary>
        // private Task<int?> SearchWithMeiliSearch(string jsonData, string indexName, string searchValue, string searchField)
        // {
        //     // Поиск по JSON
        //     try
        //     {
        //         using var doc = JsonDocument.Parse(jsonData);
        //         JsonElement rootArray = doc.RootElement;
                
        //         // Проверяем, может быть данные обернуты в объект
        //         if (rootArray.ValueKind == JsonValueKind.Object)
        //         {
        //             // Пробуем найти массив в объекте (data, results, items и т.д.)
        //             if (rootArray.TryGetProperty("data", out var dataElement) && dataElement.ValueKind == JsonValueKind.Array)
        //             {
        //                 rootArray = dataElement;
        //             }
        //             else if (rootArray.TryGetProperty("results", out var resultsElement) && resultsElement.ValueKind == JsonValueKind.Array)
        //             {
        //                 rootArray = resultsElement;
        //             }
        //             else if (rootArray.TryGetProperty("items", out var itemsElement) && itemsElement.ValueKind == JsonValueKind.Array)
        //             {
        //                 rootArray = itemsElement;
        //             }
        //             else
        //             {
        //                 // Пробуем найти первый массив в объекте
        //                 foreach (var prop in rootArray.EnumerateObject())
        //                 {
        //                     if (prop.Value.ValueKind == JsonValueKind.Array)
        //                     {
        //                         rootArray = prop.Value;
        //                         break;
        //                     }
        //                 }
        //             }
        //         }
                
        //         if (rootArray.ValueKind == JsonValueKind.Array)
        //         {
        //             var searchValueNormalized = searchValue?.Trim() ?? string.Empty;
        //             int count = 0;
        //             int? partialMatch = null;
                    
        //             foreach (var element in rootArray.EnumerateArray())
        //             {
        //                 count++;
        //                 if (element.TryGetProperty(searchField, out var name))
        //                 {
        //                     var nameValue = name.GetString();
        //                     var nameValueNormalized = nameValue?.Trim() ?? string.Empty;
                            
        //                     // Сравниваем без учета регистра и пробелов
        //                     if (string.Equals(nameValueNormalized, searchValueNormalized, StringComparison.OrdinalIgnoreCase))
        //                     {
        //                         if (element.TryGetProperty("ebgNodeId", out var ebgNodeId))
        //                         {
        //                             Console.WriteLine($"Найдено точное совпадение: '{nameValue}' = '{searchValue}', ebgNodeId: {ebgNodeId.GetInt32()}");
        //                             return Task.FromResult<int?>(ebgNodeId.GetInt32());
        //                         }
        //                     }
                            
        //                     // Также проверяем частичное совпадение (на случай опечаток)
        //                     if (nameValueNormalized.Contains(searchValueNormalized, StringComparison.OrdinalIgnoreCase) ||
        //                         searchValueNormalized.Contains(nameValueNormalized, StringComparison.OrdinalIgnoreCase))
        //                     {
        //                         if (element.TryGetProperty("ebgNodeId", out var ebgNodeId))
        //                         {
        //                             if (!partialMatch.HasValue)
        //                             {
        //                                 partialMatch = ebgNodeId.GetInt32();
        //                                 Console.WriteLine($"Найдено частичное совпадение: '{nameValue}' содержит '{searchValue}', ebgNodeId: {ebgNodeId.GetInt32()}");
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
                    
        //             if (partialMatch.HasValue)
        //             {
        //                 return Task.FromResult<int?>(partialMatch.Value);
        //             }
                    
        //             Console.WriteLine($"Не найдено совпадение для '{searchValue}' в массиве из {count} элементов");
        //         }
        //         else
        //         {
        //             Console.WriteLine($"JSON не является массивом, тип: {rootArray.ValueKind}");
        //         }
        //     }
        //     catch (Exception ex)
        //     {
        //         Console.WriteLine($"Ошибка при поиске: {ex.Message}");
        //     }

        //     return Task.FromResult<int?>(null);
        // }

        /// <summary>
        /// Получить туры по отелям для карточки отеля (CRM Advice)
        /// </summary>
        [HttpPost("/api/v1/ru/search/get-for-crm-advice-hotels")]
        [ProducesResponseType(typeof(object), 200)]
        public Task<IActionResult> GetForCrmAdviceHotels([FromBody] JsonElement requestBody)
        {
            // var url = "https://apigate.fstravel.com/api/Tours/GetByHotels";
            return Task.FromResult<IActionResult>(Ok(FunSunMockStore.GetForCrmAdviceHotels(requestBody)));
        }

        /// <summary>
        /// Нормализует дату в формат YYYY-MM-DD
        /// </summary>
        private string NormalizeDate(string date)
        {
            if (string.IsNullOrWhiteSpace(date))
                return date;

            // Если дата уже в формате YYYY-MM-DD, возвращаем как есть
            if (System.Text.RegularExpressions.Regex.IsMatch(date, @"^\d{4}-\d{2}-\d{2}$"))
                return date;

            // Пробуем распарсить дату в разных форматах
            if (DateTime.TryParse(date, out DateTime parsedDate))
            {
                return parsedDate.ToString("yyyy-MM-dd");
            }

            // Если не удалось распарсить, возвращаем как есть
            return date;
        }
    }
}

