using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WikiLinker.Dto;
using WikiLinker.Services;

namespace WikiLinker.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private readonly IWikiLinkerService _wikiLinkerService;

        public ArticlesController(IWikiLinkerService wikiLinkerService)
        {
            _wikiLinkerService = wikiLinkerService;
        }

        // POST: api/Articles
        [HttpPost]
        public async Task<IActionResult> Post(ArticlePostRequest request)
        {
            var article = await _wikiLinkerService.FindLinksAndImages(request.Text);
            return Ok(article);
        }
    }
}
