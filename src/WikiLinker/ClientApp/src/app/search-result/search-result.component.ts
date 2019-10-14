import { Component, OnInit, Inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { faSave, faTrash, faArrowUp, faArrowDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { SEARCH_HISTORY_KEY, SAVED_ARTICLES_KEY } from '../constants';
import { Article } from '../article';
import { SearchHistoryService } from '../search-history.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {
  faSearch = faSearch;
  linkTypes = [];
  links = [];
  wordTypes = [];
  words = [];
  wikiLinkedArticle: any;
  searchPhrase: string;

  constructor(
    private searchHistoryService: SearchHistoryService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.pipe(map(p => p.text)).subscribe(result => {
      var match = this.searchHistoryService.getSearchHistory().filter(sh => sh.text == result);
      if (match.length == 1) {
        this.searchPhrase = result;
        this.showResult(match[0].result, match[0].text);
      }
    })
  }

  private showResult(result, text) {
    this.wordTypes = [];
    this.linkTypes = [];
    let words = (<any>result).words;
    for (let word of words) {
      word.sort = words.indexOf(word);
      let typeName = word.type;
      if (this.wordTypes.filter(w => w.name == typeName).length == 0) {
        this.wordTypes.push({ name: typeName, words: words.filter(w => w.type == typeName) });
      }
    }

    this.links = (<any>result).links;
    let delimiters = [[" ", " "], [". ", " "], [", ", " "], [" ", "."], [" ", ", "]];
    let linkedText = " " + text + " ";
    for (let link of this.links) {
      link.sort = this.links.indexOf(link);
      let typeName = link.type;
      let cssClass = this.getLinkStyle(typeName);
      if (this.linkTypes.filter(l => l.name == typeName).length == 0) {
        var matchingLinks = this.links.filter(l =>
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
        for (let innerLink of link.innerSearch.links) {
          innerLink.sort = link.innerSearch.links.indexOf(innerLink);
          link.innerLinkTypes = [];
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
