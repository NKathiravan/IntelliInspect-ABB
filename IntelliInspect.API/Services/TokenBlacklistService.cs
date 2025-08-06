namespace IntelliInspect.API.Services;

public class TokenBlacklistService
{
    private readonly HashSet<string> _blacklist = new();

    public void Blacklist(string token) => _blacklist.Add(token);
    public bool IsBlacklisted(string token) => _blacklist.Contains(token);
}
