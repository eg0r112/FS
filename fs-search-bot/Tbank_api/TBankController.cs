using System;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text;
using System.Net.Http.Headers;
using System.Text.Json;

namespace TestTbankController
{
    [ApiController]
    [Route("api/[controller]")]
    public class Tbank : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public Tbank(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }
        //Запрос на выполнение платежа на карту Т-Банка
        [HttpPost("SendMoneyFoCard")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> SendRequest([FromBody] PaymentRequest request)
        {
            string json;

            if (!string.IsNullOrWhiteSpace(request.Id))
            {
                json = JsonSerializer.Serialize(request, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            }
            else
            {
                json = @"
                {
                    ""id"": ""unique-payment-id-123"",
                    ""from"": {
                        ""accountNumber"": ""40702810510000710417"",
                        ""inn"": ""17499237465"",
                        ""kpp"": ""0"",
                        ""name"": ""ИП Котиков Александр Михайлович"",
                        ""bankBic"": ""044525974""
                    },
                    ""to"": { ""agreementNumber"": ""17369058"" },
                    ""purpose"": ""Оплата услуг по договору 17369058. НДС не облагается"",
                    ""documentNumber"": 1,
                    ""amount"": 484.5,
                    ""executionOrder"": 1,
                    ""dueDate"": ""2025-10-26T23:59:59Z""
                }";
            }

            var apiUrl = "https://business.tbank.ru/openapi/sandbox/secured/api/v1/payment/card-transfer/pay";
            var httpReq = new HttpRequestMessage(HttpMethod.Post, apiUrl)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            var token = "TBankSandboxToken"; // Лучше хранить в конфиге
            if (string.IsNullOrEmpty(token))
                return StatusCode(500, "T-Bank token not configured on server.");

            httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var resp = await _httpClient.SendAsync(httpReq);
            var respBody = await resp.Content.ReadAsStringAsync();

            // Берём x-request-id из заголовков
            string requestId = resp.Headers.Contains("x-request-id")
                ? string.Join(", ", resp.Headers.GetValues("x-request-id"))
                : string.Empty;

            // Формируем удобный JSON для Swagger
            object bodyObject = null;
            if (!string.IsNullOrWhiteSpace(respBody))
            {
                try
                {
                    bodyObject = JsonSerializer.Deserialize<object>(respBody);
                }
                catch
                {
                    bodyObject = respBody; // Если JSON некорректен, возвращаем как строку
                }
            }

            return Ok(new
            {
                status = resp.StatusCode.ToString(),
                requestId,
                body = bodyObject
            });
        }

        [HttpPost("GetMoneyFromClient")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetMoney([FromBody] InvoiceDto request)
        {
            string json;

            if (!string.IsNullOrWhiteSpace(request.InvoiceNumber))
            {
                json = JsonSerializer.Serialize(request, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            }
            else
            {
                json = @"
                {
                ""invoiceNumber"": ""123456789"",
                ""dueDate"": ""2025-10-30"",
                ""invoiceDate"": ""2025-10-25"",
                ""accountNumber"": ""40702810510000710417"",
                ""payer"": {
                    ""name"": ""ИП Котиков Александр Михайлович"",
                    ""inn"": ""17499237465"",
                    ""kpp"": ""0""
                },
                ""items"": [
                    {
                        ""name"": ""Услуги по договору №17369058"",
                        ""amount"": 484.5,
                        ""price"": 484.5,
                        ""unit"": ""шт"",
                        ""vat"": ""0""
                    }
                ],
                ""contacts"": [
                    {
                        ""email"": ""example@mail.ru""
                    }
                ],
                ""contactPhone"": ""+79261234567"",
                ""comment"": ""Оплата за услуги по договору"",
                ""customPaymentPurpose"": ""Оплата услуг по QR-коду""
            }";
            }
            var apiUrl = "https://business.tbank.ru/openapi/sandbox/api/v1/invoice/send";

            var httpReq = new HttpRequestMessage(HttpMethod.Post, apiUrl)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            var token = "TBankSandboxToken"; // Лучше хранить в конфиге
            if (string.IsNullOrEmpty(token))
                return StatusCode(500, "T-Bank token not configured on server.");

            httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var resp = await _httpClient.SendAsync(httpReq);
            var respBody = await resp.Content.ReadAsStringAsync();

            // Получаем X-Request-Id из заголовков
            string requestId = resp.Headers.Contains("x-request-id")
                ? string.Join(", ", resp.Headers.GetValues("x-request-id"))
                : string.Empty;

            // Пробуем десериализовать JSON для Swagger
            object bodyObject = null;
            if (!string.IsNullOrWhiteSpace(respBody))
            {
                try
                {
                    bodyObject = JsonSerializer.Deserialize<object>(respBody);
                }
                catch
                {
                    bodyObject = respBody; // Если не JSON, вернём как строку
                }
            }

            // Возвращаем объект, который Swagger красиво покажет
            return Ok(new
            {
                status = resp.StatusCode.ToString(),
                requestId,
                body = bodyObject
            });
        }
        [HttpGet("GetInfo")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetInfo(string invoiceId)
        {
            if (string.IsNullOrWhiteSpace(invoiceId))
                return BadRequest("invoiceId is required.");

            var apiUrl = $"https://business.tbank.ru/openapi/sandbox/api/v1/invoice/{invoiceId}/info";

            var httpReq = new HttpRequestMessage(HttpMethod.Get, apiUrl);

            var token = "TBankSandboxToken"; // Лучше хранить в конфиге
            if (string.IsNullOrEmpty(token))
                return StatusCode(500, "T-Bank token not configured on server.");

            httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var resp = await _httpClient.SendAsync(httpReq);
            var respBody = await resp.Content.ReadAsStringAsync();

            // Получаем X-Request-Id из заголовков
            string requestId = resp.Headers.Contains("x-request-id")
                ? string.Join(", ", resp.Headers.GetValues("x-request-id"))
                : string.Empty;

            // Пробуем десериализовать JSON для Swagger
            object bodyObject = null;
            if (!string.IsNullOrWhiteSpace(respBody))
            {
                try
                {
                    bodyObject = JsonSerializer.Deserialize<object>(respBody);
                }
                catch
                {
                    bodyObject = respBody; // Если не JSON, вернём как строку
                }
            }

            return Ok(new
            {
                status = resp.StatusCode.ToString(),
                requestId,
                body = bodyObject
            });
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////




        [HttpPost("tours/{tourId}/payment")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> CreateQr()
        {

            // Формируем тело запроса для T-Bank
            var sbpRequest = new SbpQrRequest
            {
                AccountNumber = "40802810000000144655",
                Sum = 100,
                Purpose = "Тестовый платеж",
                Ttl = 60,
                Vat = "22",
                RedirectUrl = "https://example.com"
            };

            var json = JsonSerializer.Serialize(sbpRequest, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            var apiUrl = "https://business.tbank.ru/openapi/sandbox/api/v1/b2b/qr/onetime";
            var httpReq = new HttpRequestMessage(HttpMethod.Post, apiUrl)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            var token = "TBankSandboxToken";
            if (string.IsNullOrEmpty(token))
                return StatusCode(500, "T-Bank token not configured on server.");

            httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var resp = await _httpClient.SendAsync(httpReq);
            var respBody = await resp.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(respBody))
                return Ok(new { status = resp.StatusCode.ToString(), body = "Empty response" });

            try
            {
                var root = JsonSerializer.Deserialize<JsonElement>(respBody);

                string qrId = null;
                string paymentUrl = null;

                // Безопасно проверяем, есть ли "body"
                if (root.TryGetProperty("body", out var bodyElem))
                {
                    qrId = bodyElem.TryGetProperty("qrId", out var qrIdProp) ? qrIdProp.GetString() : null;
                    paymentUrl = bodyElem.TryGetProperty("paymentUrl", out var urlProp) ? urlProp.GetString() : null;
                }
                else
                {
                    qrId = root.TryGetProperty("qrId", out var qrIdProp) ? qrIdProp.GetString() : null;
                    paymentUrl = root.TryGetProperty("paymentUrl", out var urlProp) ? urlProp.GetString() : null;
                }

                return Ok(new
                {
                    status = resp.StatusCode.ToString(),
                    body = new { qrId, paymentUrl }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка парсинга: {ex.Message}");
            }
        }

        [HttpGet("tours/{qrId?}")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetQr(string qrId, [FromQuery] bool withImage)
        {
            var apiUrl = $"https://business.tbank.ru/openapi/sandbox/api/v1/b2b/qr/{qrId}/info";
            if (withImage)
                apiUrl += "?withImage=true";

            var httpReq = new HttpRequestMessage(HttpMethod.Get, apiUrl);
            httpReq.Headers.Add("X-Request-Id", Guid.NewGuid().ToString());
            var token = "TBankSandboxToken"; // Лучше хранить в конфиге
            if (string.IsNullOrEmpty(token))
                return StatusCode(500, "T-Bank token not configured on server.");

            httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var resp = await _httpClient.SendAsync(httpReq);
            var respBody = await resp.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(respBody))
                return Ok(new { status = resp.StatusCode.ToString(), body = "Empty response" });

            try
            {
                var jsonDoc = JsonDocument.Parse(respBody);
                var root = jsonDoc.RootElement;

                string status = root.TryGetProperty("status", out var statusProp) ? statusProp.GetString() : null;
                string paymentUrl = root.TryGetProperty("paymentUrl", out var urlProp) ? urlProp.GetString() : null;

                return Ok(new
                {
                    status = resp.StatusCode.ToString(),
                    body = new { status, paymentUrl }
                });
            }
            catch (Exception ex)
            {
                // Обработка ошибок парсинга
                return StatusCode(500, $"Ошибка парсинга: {ex.Message}");
            }
        }
    }
    ///////////////////////////////////////////////////////////////////
        //для создания оплаты СБП
        public class SbpQrRequest
        {
            public string AccountNumber { get; set; } = string.Empty;
            public decimal Sum { get; set; }
            public string Purpose { get; set; } = string.Empty;
            public int Ttl { get; set; }
            public string? Vat { get; set; }
            public string? RedirectUrl { get; set; }
        }
        ///////////////////////////////////////////////////////////////////
        //классы для выставления счёта
        public class InvoiceDto
        {
            public string InvoiceNumber { get; set; } = string.Empty;
            public string DueDate { get; set; } = string.Empty;      // yyyy-MM-dd
            public string? InvoiceDate { get; set; }                 // yyyy-MM-dd
            public string? AccountNumber { get; set; }
            public InvoicePayer Payer { get; set; } = new();
            public List<InvoiceItem> Items { get; set; } = new();
            public List<InvoiceContact> Contacts { get; set; } = new();
            public string ContactPhone { get; set; } = string.Empty;
            public string? Comment { get; set; }
            public string? CustomPaymentPurpose { get; set; }
        }

        public class InvoicePayer
        {
            public string Name { get; set; } = string.Empty;
            public string Inn { get; set; } = string.Empty;
            public string Kpp { get; set; } = string.Empty;
        }

        public class InvoiceItem
        {
            public string Name { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public decimal Price { get; set; }
            public string Unit { get; set; } = string.Empty;
            public string Vat { get; set; } = "0"; // допустимые значения: "None","0","5","7","10","18","20","22"
        }

        public class InvoiceContact
        {
            public string Email { get; set; } = string.Empty;
        }
        ///////////////////////////////////////////////////////////////////
        //классы нужные для того чтобы челику заплатить
        public class PaymentRequest
        {
            public string Id { get; set; } = string.Empty;           // <=64, non-empty
            public PayerRequisites From { get; set; } = new();
            public AgreementRequisites To { get; set; } = new();
            public string Purpose { get; set; } = string.Empty;      // <=210
            public int DocumentNumber { get; set; }                  // >=1, <=999999
            public decimal Amount { get; set; }
            public int? ExecutionOrder { get; set; }                 // 1..5
            public string? DueDate { get; set; }                     // ISO8601
        }
        
        public class AgreementRequisites
        {
            public string AgreementNumber { get; set; } = string.Empty;
        }

        public class PayerRequisites
        {
            public string AccountNumber { get; set; } = string.Empty;
            public string Inn { get; set; } = string.Empty;
            public string Kpp { get; set; } = "0";
            public string Name { get; set; } = string.Empty;
            public string BankBic { get; set; } = string.Empty;
        }
    ///////////////////////////////////////////////////////////////////
}
//curl -X GET "http://localhost:5277/api/Tbank/GetQr/3fa85f64-5717-4562-b3fc-2c963f66afa6?withImage=true" -H "accept: text/plain"
//curl -X POST "http://localhost:5277/api/Tbank/tours/123123/payment" ^
//    -H "Content-Type: application/json"
