using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using IntelliInspect.API.Models;

namespace IntelliInspect.API.Services {

    public class AuthService
    {
       

        private readonly IConfiguration _config;
        private readonly MongoService _mongoService;

        public AuthService(IConfiguration config, MongoService mongoService)
        {
            _config = config;
            _mongoService = mongoService;
        }
        public async Task<User?> ValidateUserAsync(string email, string password)
        {
            var user = await _mongoService.GetUserByEmailAsync(email);
            if (user == null || !VerifyPassword(password, user.PasswordHash))
                return null;

            return user;
        }

        public string HashPassword(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password);

        public bool VerifyPassword(string password, string hash) =>
            BCrypt.Net.BCrypt.Verify(password, hash);

        public string GenerateToken(User user)
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}