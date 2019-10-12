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

    this.articleForm.controls['recursiveSearch'].setValue(false);
  }

  onSubmit(articleData) {
    this.searchStarted = true;
    this.wikiLinkedArticle = <Article>{};
    this.http.post(this.baseUrl + 'api/articles', articleData).subscribe(
      result => {
        //this.displaySearchResult(result, articleData);
        this.searchHistory.push({ text: articleData.text, result: result });
        this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);
      },
      error => console.error(error)
    );
  }

  openHistory(text) {
    let historyItem = this.searchHistory.filter(sh => sh.text == text)[0];
    //this.displaySearchResult(historyItem.result, { text: text });
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
    //this.displaySearchResult(historyItem.result, { text: historyItem.text });
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
}

interface Article {
  text: string;
  recursiveSearch: boolean;
}
