import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { faSearch, faUndo, faTrash } from '@fortawesome/free-solid-svg-icons';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { SEARCH_HISTORY_KEY, SAVED_ARTICLES_KEY } from '../constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  readonly SEARCH_HISTORY_KEY = SEARCH_HISTORY_KEY;
  readonly SAVED_ARTICLES_KEY = SAVED_ARTICLES_KEY;
  faTrash = faTrash;
  faUndo = faUndo;
  faSearch = faSearch;
  searchStarted = false;
  article = <Article> {};
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
    private baseUrl: string,
    private router: Router) {
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
    this.http.post(this.baseUrl + 'api/articles', articleData).subscribe(
      result => {
        this.searchHistory.push({ text: articleData.text, result: result });
        this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);
        this.router.navigate([`/search-result/${articleData.text}`]);
      },
      error => console.error(error)
    );
  }

  removeFromHistory(text) {
    this.searchHistory = this.searchHistory.filter(sh => sh.text != text);
    this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);    
  }

  removeSavedArticle(text) {
    this.savedArticles = this.savedArticles.filter(sh => sh.text != text);
    this.storage.set(this.SAVED_ARTICLES_KEY, this.savedArticles);    
  }

  reset() {
    if (!this.searchStarted) {
      this.articleForm.reset();
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
