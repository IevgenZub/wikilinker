using Microsoft.Azure.CognitiveServices.Language.TextAnalytics;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace WikiLinker.Services
{
    public class WikiLinkerService : IWikiLinkerService
    {
        private const string AzureTextAnalyticsKey = "ced608eaa18b4bd195cd895dce0ec44c";
        private const string AzureTextAnalyticsEndpoint = "https://team-builder-text-analytics.cognitiveservices.azure.com/";
        private const string WikiSearchEndpoint = "https://en.wikipedia.org/w/api.php";

        private readonly TextAnalyticsClient _client = new TextAnalyticsClient(
            new ApiKeyServiceClientCredentials(AzureTextAnalyticsKey)) { Endpoint = AzureTextAnalyticsEndpoint };

        public async Task<string> FindLinksAndImages(string input)
        {
            var words = new SortedDictionary<string, string>();
            var photos = new HashSet<dynamic>();
            var language = await _client.DetectLanguageAsync(input);
            var languageIso = language.DetectedLanguages[0].Iso6391Name;
            
            var entitiesResponse = await _client.EntitiesAsync(input, languageIso);
            foreach (var entity in entitiesResponse.Entities)
            {
                if (!words.ContainsKey(entity.Name))
                {
                    words[entity.Name] = entity.Type;
                }
            }

            var keyPhrasesResponse = await _client.KeyPhrasesAsync(input, languageIso);
            foreach (var keyPhrase in keyPhrasesResponse.KeyPhrases)
            {
                if (!words.ContainsKey(keyPhrase))
                {
                    words[keyPhrase] = "Phrase";
                }
            }

            foreach (var text in words.Keys)
            {
                var encodedEntity = HttpUtility.UrlEncode(text);
                var type = words[text];
                using var httpClient = new HttpClient();
                var wikiResponseRaw = await httpClient.GetStringAsync(
                   $"{WikiSearchEndpoint}?action=opensearch&" +
                   $"search={encodedEntity}&" +
                    "limit=1&" +
                    "namespace=0&" +
                    "format=json");

                if (!string.IsNullOrEmpty(wikiResponseRaw))
                {
                    var wikiResponse = (JArray)JsonConvert.DeserializeObject(wikiResponseRaw);
                    var link = wikiResponse.SelectToken("$[3].[0]")?.Value<string>();
                    var description = wikiResponse.SelectToken("$[2].[0]")?.Value<string>();

                    if (!string.IsNullOrEmpty(link))
                    {
                        var delimiters = new List<KeyValuePair<string, string>>
                        {
                            new KeyValuePair<string, string>(" ", ""),
                            new KeyValuePair<string, string>(" ", " "),
                            new KeyValuePair<string, string>(" ", "."),
                            new KeyValuePair<string, string>(". ", " "),
                            new KeyValuePair<string, string>(", ", " "),
                            new KeyValuePair<string, string>(" ", ", "),
                        };

                        input = ReplaceWithLink(input, text, link, delimiters);
                        await GetWikiImage(httpClient, photos, text, link, description, type);
                    }
                }
            }

            return JsonConvert.SerializeObject(new { input = input, photos = photos });
        }

        private static async Task GetWikiImage(HttpClient httpClient, HashSet<dynamic> photos, string text, string link, string description, string type)
        {
            var wikiImageResponse = await httpClient.GetStringAsync(
               $"{WikiSearchEndpoint}?action=query&" +
                "prop=pageimages&" +
                "formatversion=2&" +
                "format=json&" +
                "piprop=original&" +
               $"titles={text}");

            var imageUrl = ((JObject)JsonConvert.DeserializeObject(wikiImageResponse))
                .SelectToken("$.query.pages[0].original.source")?.Value<string>();

            if (!string.IsNullOrEmpty(imageUrl))
            {
                photos.Add(new
                {
                    imageUrl = imageUrl, title = text, link = link, type = type, description = description
                });
            }
        }

        private static string ReplaceWithLink(string input, string text, string link, List<KeyValuePair<string, string>> delimiters)
        {
            input = " " + input;
            foreach (var delimiter in delimiters)
            {
                input = input.Replace(
                    $"{delimiter.Key}{text}{delimiter.Value}",
                    $"<a target='_blank' href='{link}'>{delimiter.Key}{text}{delimiter.Value}</a>");
            }

            return input;
        }
    }
}
