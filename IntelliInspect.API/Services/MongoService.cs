using MongoDB.Driver;
using IntelliInspect.API.Models;

namespace IntelliInspect.API.Services;

public class MongoService
{
    private readonly IMongoCollection<User> _userCollection;

    public MongoService(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDB:ConnectionString"]);
        var database = client.GetDatabase(config["MongoDB:Database"]);
        _userCollection = database.GetCollection<User>("Users");
    }

    public async Task<User?> GetUserByEmailAsync(string email) =>
        await _userCollection.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task CreateUserAsync(User user) =>
        await _userCollection.InsertOneAsync(user);
}
