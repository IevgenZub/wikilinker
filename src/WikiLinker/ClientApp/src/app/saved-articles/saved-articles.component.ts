import { Component, OnInit, Inject } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { faSearch, faSave, faUndo, faBookOpen, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'saved-articles',
  templateUrl: './saved-articles.component.html',
  styleUrls: ['./saved-articles.component.css']
})
export class SavedArticlesComponent implements OnInit {
  readonly SAVED_ARTICLES_KEY = "WIKILINKER_SAVED_ARTICLES";
  savedArticles = [];
  articleTypes = [];
  faTrash = faTrash;
  faSearch = faSearch;
  
  constructor(
    @Inject(LOCAL_STORAGE)
    private storage: StorageService) { }

  ngOnInit() {
    if (!this.storage.has(this.SAVED_ARTICLES_KEY)) {
      this.storage.set(this.SAVED_ARTICLES_KEY, this.savedArticles);
    } else {
      this.savedArticles = this.storage.get(this.SAVED_ARTICLES_KEY);
      for (let article of this.savedArticles) {
        let typeName = article.type;
        if (this.articleTypes.filter(l => l.name == typeName).length == 0) {
          var articles = this.savedArticles.filter(a =>a.type == typeName);
          if (articles.length > 0) {
            this.articleTypes.push({ name: typeName, articles: articles });
          }
        }
      }
    }
  }

  removeSavedArticle(text) {
    this.savedArticles = this.savedArticles.filter(sh => sh.text != text);
    this.storage.set(this.SAVED_ARTICLES_KEY, this.savedArticles);
  }
}
