

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IntelliInspect.API.Models;
using IntelliInspect.API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;


namespace IntelliInspect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly MongoService _mongoService;
    private readonly AuthService _authService;
    private readonly TokenBlacklistService _blacklistService;

    public AuthController(MongoService mongoService, AuthService authService, TokenBlacklistService blacklistService)
    {
        _mongoService = mongoService;
        _authService = authService;
        _blacklistService = blacklistService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(LoginRequest request)
    {
        var existingUser = await _mongoService.GetUserByEmailAsync(request.Email);
        if (existingUser != null)
            return Conflict("User already exists");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _authService.HashPassword(request.Password),
            Role = "User"
        };

        await _mongoService.CreateUserAsync(user);
        return Ok("User registered");
    }

    //[HttpPost("login")]
    //public async Task<IActionResult> Login(LoginRequest request)
    //{
    //    var user = await _mongoService.GetUserByEmailAsync(request.Email);
    //    if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
    //        return Unauthorized();

    //    var token = _authService.GenerateToken(user);

    //    var cookieOptions = new CookieOptions
    //    {
    //        HttpOnly = true,
    //        Secure = true, // make false in development if not using HTTPS
    //        SameSite = SameSiteMode.Strict,
    //        Expires = DateTime.UtcNow.AddHours(1)
    //    };

    //    Response.Cookies.Append("jwt", token, cookieOptions);
    //    return Ok("Logged in successfully");
    //}
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _authService.ValidateUserAsync(request.Email, request.Password);
        if (user == null)
            return Unauthorized("Invalid credentials");

        var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Email),
        new Claim(ClaimTypes.Role, user.Role)
    };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        return Ok(new { message = "Login successful" });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { message = "Logged out successfully" });
    }

    //[Authorize]
    //[HttpPost("logout")]
    //public IActionResult Logout()
    //{
    //    var token = Request.Cookies["jwt"];
    //    if (!string.IsNullOrEmpty(token))
    //    {
    //        _blacklistService.Blacklist(token);

    //        // Clear cookie
    //        Response.Cookies.Delete("jwt");
    //        return Ok("Logged out successfully");
    //    }

    //    return BadRequest("No token found in cookies");
    //}

    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public IActionResult AdminOnly() => Ok("Welcome Admin!");

    [Authorize(Roles = "User,Admin")]
    [HttpGet("user")]
    public IActionResult UserOrAdmin() => Ok("Welcome User!");
}
