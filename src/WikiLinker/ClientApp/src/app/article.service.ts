import { Injectable, Inject } from '@angular/core';
import { StorageService, LOCAL_STORAGE } from 'ngx-webstorage-service';
import { Article } from './article';
import { SAVED_ARTICLES_KEY } from './constants';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  readonly SAVED_ARTICLES_KEY = SAVED_ARTICLES_KEY;
  
  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
    if (!this.storage.has(this.SAVED_ARTICLES_KEY)) {
      this.storage.set(this.SAVED_ARTICLES_KEY, []);
    } 
  }

  getSavedArticles() {
    return this.storage.get(this.SAVED_ARTICLES_KEY);
  }

  saveArticle(article: Article) {
    var savedArticles = this.storage.get(this.SAVED_ARTICLES_KEY);
    savedArticles.push(article);
    this.storage.set(this.SAVED_ARTICLES_KEY, savedArticles);
  }
}
