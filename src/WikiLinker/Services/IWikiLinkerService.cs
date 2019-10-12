using System.Threading.Tasks;

namespace WikiLinker.Services
{
    public interface IWikiLinkerService
    {
        Task<string> FindLinksAndImages(string input, bool recursiveSearch, int recursionLevel = 0);
    }
}