﻿using Microsoft.Azure.CognitiveServices.Language.TextAnalytics;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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
            var entitiesResponse = await _client.EntitiesAsync(input, "en");
            var keyPhrasesResponse = await _client.KeyPhrasesAsync(input, "en");
            var words = new SortedSet<string>();

            foreach (var entity in entitiesResponse.Entities)
            {
                words.Add($"{entity.Name}_{entity.Type.Replace("DateTime", "Date")}");
            }

            foreach (var keyPhrase in keyPhrasesResponse.KeyPhrases)
            {
                words.Add($"{keyPhrase}_Phrase");
            }

            var photos = new HashSet<dynamic>();
            foreach (var word in words)
            {
                var text = word.Split('_')[0];
                var type = word.Split('_')[1];

                using var httpClient = new HttpClient();
                var encodedEntity = HttpUtility.UrlEncode(text);

                var wikiResponseRaw = await httpClient.GetStringAsync(
                   $"{WikiSearchEndpoint}?action=opensearch&" +
                   $"search={encodedEntity}&" +
                    "limit=1&" +
                    "namespace=0&" +
                    "format=json");

                if (!string.IsNullOrEmpty(wikiResponseRaw))
                {
                    var wikiResponse = (JArray)JsonConvert.DeserializeObject(wikiResponseRaw);
                    if (wikiResponse.Count == 4)
                    {
                        var links = (JArray)wikiResponse[3];
                        if (links.Count == 1)
                        {
                            var link = ((JArray)wikiResponse[3])[0].Value<string>();
                            var description = ((JArray)wikiResponse[2])[0].Value<string>();

                            input = " " + input;
                            input = ReplaceWithLink(input, " ", text, "", link);
                            input = ReplaceWithLink(input, " ", text, " ", link);
                            input = ReplaceWithLink(input, ", ", text, " ", link);
                            input = ReplaceWithLink(input, ". ", text, " ", link);

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
                                    imageUrl = imageUrl, 
                                    title = text, 
                                    link = link, 
                                    type = type, 
                                    description = description 
                                });
                            }
                        }
                    }
                }
            }

            return JsonConvert.SerializeObject(new { input = input, photos = photos });
        }

        private static string ReplaceWithLink(string input, string delimiterBefore, string text, string delimiterAfter, string link)
        {
            input = input.Replace(
                $"{delimiterBefore}{text}{delimiterAfter}", 
                $"<a target='_blank' href='{link}'>{delimiterBefore}{text}{delimiterAfter}</a>");

            return input;
        }
    }
}
