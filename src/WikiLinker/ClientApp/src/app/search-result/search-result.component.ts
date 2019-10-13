import { Component, OnInit, Inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { faSave, faTrash, faArrowUp, faArrowDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { SEARCH_HISTORY_KEY, SAVED_ARTICLES_KEY } from '../constants';
import { Article } from '../article';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {
  readonly SEARCH_HISTORY_KEY = SEARCH_HISTORY_KEY;
  readonly SAVED_ARTICLES_KEY = SAVED_ARTICLES_KEY;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faTrash = faTrash;
  faSave = faSave;
  faSearch = faSearch;
  links = [];
  linkTypes = [];
  words = [];
  wordTypes = [];
  searchHistory = [];
  savedArticles: Article [] = [];
  wikiLinkedArticle: any;
  searchPhrase: string;

  constructor(
    @Inject(LOCAL_STORAGE)
    private storage: StorageService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    if (!this.storage.has(this.SEARCH_HISTORY_KEY)) {
      this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);
    } else {
      this.searchHistory = this.storage.get(this.SEARCH_HISTORY_KEY);
    }

    if (!this.storage.has(this.SAVED_ARTICLES_KEY)) {
      this.storage.set(this.SAVED_ARTICLES_KEY, this.savedArticles);
    } else {
      this.savedArticles = this.storage.get(this.SAVED_ARTICLES_KEY);
    }

    this.route.params.pipe(map(p => p.text)).subscribe(result => {
      var match = this.searchHistory.filter(sh => sh.text == result);
      if (match.length == 1) {
        this.searchPhrase = result;
        this.showResult(match[0].result, match[0].text);
      }
    })
  }



  removeFromHistoryElements(text) {
    this.searchHistory.forEach(sh => {
      sh.result.links = sh.result.links.filter(l => l.text != text);
      sh.result.links.forEach(li => {
        if (li.innerSearch) {
          li.innerSearch.links = li.innerSearch.links.filter(inner => inner.text != text);
        }
      })
    });

    this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);

    let historyItem = this.searchHistory.filter(sh => sh.text == this.searchPhrase)[0];
    this.showResult(historyItem.result, historyItem.text);
  }

  private showResult(result, text) {
    this.wordTypes = [];
    this.linkTypes = [];
    this.words = (<any>result).words;
    for (let word of this.words) {
      word.sort = this.words.indexOf(word);
      let typeName = word.type;
      if (this.wordTypes.filter(w => w.name == typeName).length == 0) {
        this.wordTypes.push({ name: typeName, words: this.words.filter(w => w.type == typeName) });
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
        var links = this.links.filter(l =>
          l.type == typeName &&
          l.description.length > 0 &&
          !l.description.includes("may refer to:") &&
          !l.description.includes("commonly refers to:"));

        if (links.length > 0) {
          this.linkTypes.push({ name: typeName, links: links });
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
