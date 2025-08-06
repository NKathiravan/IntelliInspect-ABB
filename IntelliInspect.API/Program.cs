//using IntelliInspect.API.Services;
//using Microsoft.AspNetCore.Http.Features;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.IdentityModel.Tokens;
//using System.Text;

//var builder = WebApplication.CreateBuilder(args);

//builder.Services.Configure<FormOptions>(options =>
//{
//    options.MultipartBodyLengthLimit = 10_000_000_000;
//});

//builder.WebHost.ConfigureKestrel(serverOptions =>
//{
//    serverOptions.Limits.MaxRequestBodySize = 10_000_000_000;
//});

//// Add services to the container
//builder.Services.AddControllers();
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

////user auth
//builder.Services.AddSingleton<MongoService>();
//builder.Services.AddSingleton<AuthService>();
//builder.Services.AddSingleton<TokenBlacklistService>();

////add ml service 
//builder.Services.AddHttpClient();


//// Register your services (optional: move to DI)
//builder.Services.AddScoped<DatasetService>();
////builder.Services.AddScoped<IDatasetService, DatasetService>();

////regiter simulation service 
//builder.Services.AddScoped<SimulationService>();

//// JWT
//var jwtKey = builder.Configuration["Jwt:Key"];
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidIssuer = builder.Configuration["Jwt:Issuer"],
//            ValidAudience = builder.Configuration["Jwt:Audience"],
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
//        };

//        options.Events = new JwtBearerEvents
//        {
//            OnMessageReceived = context =>
//            {
//                var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
//                var blacklist = context.HttpContext.RequestServices.GetRequiredService<TokenBlacklistService>();
//                if (blacklist.IsBlacklisted(token))
//                    context.Fail("Token blacklisted");
//                return Task.CompletedTask;
//            }
//        };
//    });

//builder.Services.AddAuthorization();

//var app = builder.Build();

//// Enable Swagger in development
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}
//app.UseCors(options =>
//{
//    options.AllowAnyOrigin()
//           .AllowAnyMethod()
//           .AllowAnyHeader();
//});
//// Enable file serving if needed (for downloading temp files)
//app.UseStaticFiles();

//app.UseAuthentication();
//app.UseHttpsRedirection();
//app.UseAuthorization();
//app.MapControllers();

//app.Run();
using IntelliInspect.API.Services;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

// Increase file upload limit
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10_000_000_000;
});
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 10_000_000_000;
});

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Services
builder.Services.AddSingleton<MongoService>();
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<TokenBlacklistService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<DatasetService>();
builder.Services.AddScoped<SimulationService>();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.LoginPath = "/api/auth/login"; // Redirect for unauthenticated users
        options.LogoutPath = "/api/auth/logout";
        options.AccessDeniedPath = "/api/auth/denied";
        options.SlidingExpiration = true;
        options.ExpireTimeSpan = TimeSpan.FromHours(1);
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Swagger for development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Allow cross-origin requests (you may restrict in prod)
app.UseCors(options =>
{
    options
        .AllowCredentials()
        .AllowAnyMethod()
        .AllowAnyHeader()
        .SetIsOriginAllowed(origin => true); // Allow any origin
});

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
