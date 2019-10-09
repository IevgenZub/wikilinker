﻿using Microsoft.Azure.CognitiveServices.Language.TextAnalytics;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
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
            var photos = new List<dynamic>();
            var links = new List<dynamic>();
            var language = await _client.DetectLanguageAsync(input);
            var languageIso = language.DetectedLanguages[0].Iso6391Name;
            
            var entitiesResponse = await _client.EntitiesAsync(input, languageIso);
            foreach (var entity in entitiesResponse.Entities.Where(e => e.Type != "Quantity"))
            {

                if (!words.ContainsKey(entity.Name))
                {
                    words[entity.Name] = entity.Type.ToUpper();
                }
            }

            var keyPhrasesResponse = await _client.KeyPhrasesAsync(input, languageIso);
            foreach (var keyPhrase in keyPhrasesResponse.KeyPhrases)
            {
                if (!words.ContainsKey(keyPhrase))
                {
                    words[keyPhrase] = "PHRASE";
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


                var wikiResponse = (JArray)JsonConvert.DeserializeObject(wikiResponseRaw);
                var url = wikiResponse.SelectToken("$[3].[0]")?.Value<string>();
                var description = wikiResponse.SelectToken("$[2].[0]")?.Value<string>();

                if (!string.IsNullOrEmpty(url))
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

                    if (string.IsNullOrEmpty(imageUrl))
                    {
                        imageUrl = "http://municipalmagazine.com/wp-content/uploads/2017/04/jayankondam-wiki.png";
                    }

                    links.Add(new { text = text, url = url, type = type, description = description, imageUrl = imageUrl });
                }
            }

            return JsonConvert.SerializeObject(new 
            { 
                words = words.Select(w => new { text = w.Key, type = w.Value }), 
                links = links 
            });
        }
    }
}
