import { Component, OnInit, Inject, Input } from '@angular/core';
import { ArticleService } from '../article.service';

@Component({
  selector: 'saved-articles',
  templateUrl: './saved-articles.component.html',
  styleUrls: ['./saved-articles.component.css']
})
export class SavedArticlesComponent implements OnInit {
  @Input() miniSize: boolean = false;
  savedArticles = [];
  articleTypes = [];

  constructor(private articleService: ArticleService) { }

  ngOnInit() {
    this.savedArticles = this.articleService.getSavedArticles();
    for (let article of this.savedArticles) {
      let typeName = article.type;
      if (this.articleTypes.filter(l => l.name == typeName).length == 0) {
        var articles = this.savedArticles.filter(a => a.type == typeName);
        if (articles.length > 0) {
          this.articleTypes.push({ name: typeName, articles: articles });
        }
      }
    }
  }
}
