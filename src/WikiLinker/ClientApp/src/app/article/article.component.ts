import { Component, OnInit, Input } from '@angular/core';
import { Article } from '../article';
import { faSearch, faTrash, faArrowUp, faArrowDown, faSave } from '@fortawesome/free-solid-svg-icons';
import { SAVED_ARTICLES_KEY } from '../constants';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  @Input() article: Article;
  readonly SAVED_ARTICLES_KEY = SAVED_ARTICLES_KEY;
  faTrash = faTrash;
  faSearch = faSearch;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faSave = faSave;
  
  constructor() { }

  ngOnInit() {
  }

  saveArticle() {
    //this.savedArticles.push(this.article);

    //this.storage.set(this.SAVED_ARTICLES_KEY, this.savedArticles);
  }

}
