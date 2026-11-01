using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TelegramBotApi;
using TestTbankController;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "TBank Proxy", Version = "v1" });

     c.MapType<SbpQrRequest>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    {
        Type = "object",
        Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
        {
            ["accountNumber"] = new Microsoft.OpenApi.Models.OpenApiSchema
            {
                Type = "string",
                Example = new Microsoft.OpenApi.Any.OpenApiString("40802810000000144655")
            },
            ["sum"] = new Microsoft.OpenApi.Models.OpenApiSchema
            {
                Type = "number",
                Example = new Microsoft.OpenApi.Any.OpenApiDouble(12345.67)
            },
            ["purpose"] = new Microsoft.OpenApi.Models.OpenApiSchema
            {
                Type = "string",
                Example = new Microsoft.OpenApi.Any.OpenApiString("Назначение платежа")
            },
            ["ttl"] = new Microsoft.OpenApi.Models.OpenApiSchema
            {
                Type = "integer",
                Example = new Microsoft.OpenApi.Any.OpenApiInteger(7)
            },
            ["vat"] = new Microsoft.OpenApi.Models.OpenApiSchema
            {
                Type = "string",
                Example = new Microsoft.OpenApi.Any.OpenApiString("22")
            },
            ["redirectUrl"] = new Microsoft.OpenApi.Models.OpenApiSchema
            {
                Type = "string",
                Example = new Microsoft.OpenApi.Any.OpenApiString("https://example.com")
            }
        }
    });
    // // Пример для PaymentRequest
    // c.MapType<PaymentRequest>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    // {
    //     Type = "object",
    //     Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
    //     {
    //         ["id"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "string", Example = new Microsoft.OpenApi.Any.OpenApiString("unique-payment-id-123") },
    //         ["from"] = new Microsoft.OpenApi.Models.OpenApiSchema
    //         {
    //             Type = "object",
    //             Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
    //             {
    //                 ["accountNumber"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "string", Example = new Microsoft.OpenApi.Any.OpenApiString("40702810510000710417") },
    //                 ["inn"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "string", Example = new Microsoft.OpenApi.Any.OpenApiString("17499237465") },
    //                 ["kpp"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "string", Example = new Microsoft.OpenApi.Any.OpenApiString("0") },
    //                 ["name"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "string", Example = new Microsoft.OpenApi.Any.OpenApiString("ИП Котиков Александр Михайлович") },
    //                 ["bankBic"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "string", Example = new Microsoft.OpenApi.Any.OpenApiString("044525974") },
    //             }
    //         },
    //         ["to"] = new Microsoft.OpenApi.Models.OpenApiSchema
    //         {
    //             Type = "object",
    //             Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
    //             {
    //                 ["agreementNumber"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "string", Example = new Microsoft.OpenApi.Any.OpenApiString("17369058") }
    //             }
    //         },
    //         ["purpose"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "string", Example = new Microsoft.OpenApi.Any.OpenApiString("Оплата услуг по договору 17369058. НДС не облагается") },
    //         ["documentNumber"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "integer", Example = new Microsoft.OpenApi.Any.OpenApiInteger(1) },
    //         ["amount"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "number", Example = new Microsoft.OpenApi.Any.OpenApiDouble(484.5) },
    //         ["executionOrder"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "integer", Example = new Microsoft.OpenApi.Any.OpenApiInteger(1) },
    //         ["dueDate"] = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "string", Example = new Microsoft.OpenApi.Any.OpenApiString("2025-10-26T23:59:59Z") }
    //     }
    // });

    // // Пример для InvoiceDto
    // c.MapType<InvoiceDto>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    // {
    //     Type = "object",
    //     Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
    //     {
    //         ["invoiceNumber"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //         { 
    //             Type = "string", 
    //             Example = new Microsoft.OpenApi.Any.OpenApiString("123456789") 
    //         },
    //         ["dueDate"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //         { 
    //             Type = "string", 
    //             Format = "date",
    //             Example = new Microsoft.OpenApi.Any.OpenApiString("2025-10-30") 
    //         },
    //         ["invoiceDate"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //         { 
    //             Type = "string", 
    //             Format = "date",
    //             Example = new Microsoft.OpenApi.Any.OpenApiString("2025-10-25") 
    //         },
    //         ["accountNumber"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //         { 
    //             Type = "string", 
    //             Example = new Microsoft.OpenApi.Any.OpenApiString("40702810510000710417") 
    //         },
    //         ["payer"] = new Microsoft.OpenApi.Models.OpenApiSchema
    //         {
    //             Type = "object",
    //             Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
    //             {
    //                 ["name"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //                 { 
    //                     Type = "string", 
    //                     Example = new Microsoft.OpenApi.Any.OpenApiString("ИП Котиков Александр Михайлович") 
    //                 },
    //                 ["inn"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //                 { 
    //                     Type = "string", 
    //                     Example = new Microsoft.OpenApi.Any.OpenApiString("17499237465") 
    //                 },
    //                 ["kpp"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //                 { 
    //                     Type = "string", 
    //                     Example = new Microsoft.OpenApi.Any.OpenApiString("0") 
    //                 },
    //             }
    //         },
    //         ["items"] = new Microsoft.OpenApi.Models.OpenApiSchema
    //         {
    //             Type = "array",
    //             Items = new Microsoft.OpenApi.Models.OpenApiSchema
    //             {
    //                 Type = "object",
    //                 Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
    //                 {
    //                     ["name"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //                     { 
    //                         Type = "string", 
    //                         Example = new Microsoft.OpenApi.Any.OpenApiString("Услуги по договору №17369058") 
    //                     },
    //                     ["amount"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //                     { 
    //                         Type = "number", 
    //                         Example = new Microsoft.OpenApi.Any.OpenApiDouble(484.5) 
    //                     },
    //                     ["price"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //                     { 
    //                         Type = "number", 
    //                         Example = new Microsoft.OpenApi.Any.OpenApiDouble(484.5) 
    //                     },
    //                     ["unit"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //                     { 
    //                         Type = "string", 
    //                         Example = new Microsoft.OpenApi.Any.OpenApiString("шт") 
    //                     },
    //                     ["vat"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //                     { 
    //                         Type = "string", 
    //                         Example = new Microsoft.OpenApi.Any.OpenApiString("0") 
    //                     }
    //                 }
    //             }
    //         },
    //         ["contacts"] = new Microsoft.OpenApi.Models.OpenApiSchema
    //         {
    //             Type = "array",
    //             Items = new Microsoft.OpenApi.Models.OpenApiSchema
    //             {
    //                 Type = "object",
    //                 Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
    //                 {
    //                     ["email"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //                     { 
    //                         Type = "string", 
    //                         Example = new Microsoft.OpenApi.Any.OpenApiString("example@mail.ru") 
    //                     }
    //                 }
    //             }
    //         },
    //         ["contactPhone"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //         { 
    //             Type = "string", 
    //             Example = new Microsoft.OpenApi.Any.OpenApiString("+79261234567") 
    //         },
    //         ["comment"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //         { 
    //             Type = "string", 
    //             Example = new Microsoft.OpenApi.Any.OpenApiString("Оплата за услуги по договору") 
    //         },
    //         ["customPaymentPurpose"] = new Microsoft.OpenApi.Models.OpenApiSchema 
    //         { 
    //             Type = "string", 
    //             Example = new Microsoft.OpenApi.Any.OpenApiString("Оплата услуг по QR-коду") 
    //         }
    //     }
    // });

    // // Пример где лишь строка
    // c.MapType<string>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    // {
    //     Type = "string",
    //     Example = new Microsoft.OpenApi.Any.OpenApiString("d8327c28-4a8e-4084-93ea-a94b7bd144c5")
    // });
});
builder.Services.AddHostedService<TelegramBotHostedService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAll");
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapControllers();
app.Run();