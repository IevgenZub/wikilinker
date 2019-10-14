import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article } from '../article';
import { SearchHistoryService } from '../search-history.service';
import { ArticleService } from '../article.service';
import { SearchHistoryItem } from '../search-history-item';
import { faSave, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {
  faSearch = faSearch;
  faSave = faSave;
  faTrash = faTrash;
  linkTypes = [];
  linksCount = 0;
  wordTypes = [];
  wordsCount = 0;
  wikiLinkedArticle: any;
  searchPhrase: string;

  constructor(
    private searchHistoryService: SearchHistoryService,
    private articleService: ArticleService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.pipe(map(p => p.text)).subscribe(result => {
      this.refresh(result);
    })
  }

  removeArticleFromHistory(historyText: string, articleText: string) {
    this.searchHistoryService.deleteArticleFromHistory(historyText, articleText);
    this.refresh(historyText);
  }

  saveArticle(article: Article) {
    this.articleService.saveArticle(article);
  }

  private refresh(historyText) {
    var match = this.searchHistoryService.getSearchHistory().filter(sh => sh.text == historyText);
    if (match.length == 1) {
      this.searchPhrase = historyText;
      this.showResult(match[0]);
    }
  }

  private showResult(historyItem: SearchHistoryItem) {
    this.wordTypes = [];
    this.linkTypes = [];
    this.linksCount = historyItem.links.length;
    this.wordsCount = historyItem.words.length;

    for (let word of historyItem.words) {
      let typeName = word.type;
      if (this.wordTypes.filter(w => w.name == typeName).length == 0) {
        this.wordTypes.push({ name: typeName, words: historyItem.words.filter(w => w.type == typeName) });
      }
    }

    let delimiters = [[" ", " "], [". ", " "], [", ", " "], [" ", "."], [" ", ", "]];
    let linkedText = " " + historyItem.text + " ";
    for (let link of historyItem.links) {
      let typeName = link.type;
      let cssClass = this.getLinkStyle(typeName);
      if (this.linkTypes.filter(l => l.name == typeName).length == 0) {
        var matchingLinks = historyItem.links.filter(l =>
          l.type == typeName &&
          l.description.length > 0 &&
          !l.description.includes("may refer to:") &&
          !l.description.includes("commonly refers to:"));

        if (matchingLinks.length > 0) {
          this.linkTypes.push({ name: typeName, links: matchingLinks });
        }
      }

      for (let delimiter of delimiters) {
        linkedText = linkedText.replace(
          `${delimiter[0]}${link.text}${delimiter[1]}`,
          `<a target='_blank' class='${cssClass}' href='${link.url}'>${delimiter[0]}${link.text}${delimiter[1]}</a>`
        );
      }

      let innerLinkedText = link.description;
      if (link.innerSearch && innerLinkedText.length > 0) {
        link.innerLinkTypes = [];
        for (let innerLink of link.innerSearch.links) {
          let innerTypeName = innerLink.type;
          let innerCss = this.getLinkStyle(innerTypeName);
          if (link.innerLinkTypes.filter(l => l.name == innerTypeName).length == 0) {
            var innerLinks = link.innerSearch.links.filter(l =>
              l.type == innerTypeName &&
              l.description.length > 0 &&
              !l.description.includes("may refer to:") &&
              !l.description.includes("commonly refers to:") &&
              l.text.toUpperCase() != link.text.toUpperCase());

            if (innerLinks.length > 0) {
              link.innerLinkTypes.push({ name: innerTypeName, links: innerLinks });
            }

            innerLinkedText = " " + innerLinkedText + " ";
            for (let delimiter of delimiters) {
              innerLinkedText = innerLinkedText.replace(
                `${delimiter[0]}${innerLink.text}${delimiter[1]}`,
                `<a target='_blank' class='${innerCss}' href='${innerLink.url}'>${delimiter[0]}${innerLink.text}${delimiter[1]}</a>`
              );
            }
          }
        }
      }

      link.linkedDescription = innerLinkedText;
    }

    this.wikiLinkedArticle = { text: linkedText };
  }

  private getLinkStyle(type) {
    let cssClass = "text-primary";
    switch (type) {
      case "ORGANIZATION":
        cssClass = "text-primary";
        break;
      case "LOCATION":
        cssClass = "text-success";
        break;
      case "DATETIME":
        cssClass = "text-secondary";
        break;
      case "OTHER":
        cssClass = "text-info";
        break;
      case "PHRASE":
        cssClass = "text-warning";
        break;
    }

    return cssClass;
  }
}
