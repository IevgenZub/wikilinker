import { Component, OnInit, Inject, Input } from '@angular/core';
import { ArticleService } from '../article.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'saved-articles',
  templateUrl: './saved-articles.component.html',
  styleUrls: ['./saved-articles.component.css']
})
export class SavedArticlesComponent implements OnInit {
  @Input() miniSize: boolean = false;
  savedArticles = [];
  articleTypes = [];
  faTrash = faTrash;

  constructor(private articleService: ArticleService) { }

  ngOnInit() {
    this.refresh();
  }

  deleteArticle(text) {
    this.articleService.deleteArticle(text);
    this.refresh();
  }

  private refresh() {
    this.savedArticles = this.articleService.getSavedArticles();
    this.articleTypes = [];
    for (let article of this.savedArticles) {
      let type = article.type;
      if (this.articleTypes.filter(l => l.name == type).length == 0) {
        var articles = this.savedArticles.filter(a => a.type == type);
        if (articles.length > 0) {
          this.articleTypes.push({ name: type, articles: articles });
        }
      }
    }
  }
}
