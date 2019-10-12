import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { faSearch, faSave, faUndo, faBookOpen, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  readonly SEARCH_HISTORY_KEY = "WIKILINKER_SEARCH_HISTORY";
  readonly SAVED_ARTICLES_KEY = "WIKILINKER_SAVED_ARTICLES";
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faTrash = faTrash;
  faBookOpen = faBookOpen;
  faUndo = faUndo;
  faSearch = faSearch;
  faSave = faSave;
  searchStarted = false;
  article = <Article> {};
  wikiLinkedArticle = <Article>{};
  links = [];
  linkTypes = [];
  words = [];
  wordTypes = [];
  searchHistory = [];
  savedArticles = [];
  articleForm = this.formBuilder.group({
    text: new FormControl(this.article.text, [Validators.required, Validators.minLength(3)]),
    recursiveSearch: new FormControl(this.article.recursiveSearch)
  });

  constructor(
    @Inject(LOCAL_STORAGE)
    private storage: StorageService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    @Inject('BASE_URL')
    private baseUrl: string) {
  }

  ngOnInit(): void {
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
  }

  onSubmit(articleData) {
    this.searchStarted = true;
    this.wikiLinkedArticle = <Article>{};
    this.http.post(this.baseUrl + 'api/articles', articleData).subscribe(
      result => {
        this.displaySearchResult(result, articleData);
        this.searchHistory.push({ text: articleData.text, result: result });
        this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);
      },
      error => console.error(error)
    );
  }

  openHistory(text) {
    let historyItem = this.searchHistory.filter(sh => sh.text == text)[0];
    this.displaySearchResult(historyItem.result, { text: text });
    window.scroll(0, 0);
  }

  removeFromHistory(text) {
    this.searchHistory = this.searchHistory.filter(sh => sh.text != text);
    this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);    
  }

  removeFromHistoryElements(text) {
    this.searchHistory.forEach((sh, index) => {
      sh.result.links = sh.result.links.filter(l => l.text != text);
      sh.result.links.forEach((li, index) => {
        if (li.innerSearch) {
          li.innerSearch.links = li.innerSearch.links.filter(inner => inner.text != text);
        }
      })
    });

    this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);

    let historyItem = this.searchHistory.filter(sh => sh.text == this.article.text)[0];
    this.displaySearchResult(historyItem.result, { text: historyItem.text });
  }

  removeSavedArticle(text) {
    this.savedArticles = this.savedArticles.filter(sh => sh.text != text);
    this.storage.set(this.SAVED_ARTICLES_KEY, this.savedArticles);    
  }

  saveArticle(text, url, description, linkedDescription, imageUrl, type) {
    this.savedArticles.push({
      text: text,
      url: url,
      description: description,
      linkedDescription: linkedDescription,
      imageUrl: imageUrl,
      type: type
    });

    this.storage.set(this.SAVED_ARTICLES_KEY, this.savedArticles);
  }

  reset() {
    if (!this.searchStarted) {
      this.articleForm.reset();
      this.wikiLinkedArticle = <Article>{};
      this.articleForm.controls['recursiveSearch'].setValue(false);
    }
  }

  searchDetails(text) {
    this.article.text = text;
    this.articleForm.controls['text'].setValue(text);
    this.onSubmit({ text: text });
  }

  private displaySearchResult(result, articleData) {
    this.wordTypes = [];
    this.linkTypes = [];
    this.article.text = articleData.text;
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
    let linkedText = " " + articleData.text + " ";
    for (let link of this.links) {
      link.sort = this.links.indexOf(link);
      let typeName = link.type;
      let cssClass = this.getLinkStyle(typeName);
      if (this.linkTypes.filter(l => l.name == typeName).length == 0) {
        var links = this.links.filter(l =>
          l.type == typeName &&
          l.description.length > 0 &&
          !l.description.includes("may refer to:") &&
          !l.description.includes("commonly refers to:") );

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

    this.wikiLinkedArticle.text = linkedText;
    this.searchStarted = false;
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

interface Article {
  text: string;
  recursiveSearch: boolean;
}
