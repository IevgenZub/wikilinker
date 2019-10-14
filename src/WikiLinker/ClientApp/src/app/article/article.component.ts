import { Component, OnInit, Input } from '@angular/core';
import { Article } from '../article';
import { ArticleService } from '../article.service';
import { faSave } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  @Input() article: Article;
  @Input() miniSize: boolean = false;
  faSave = faSave;
  
  constructor(private articleService: ArticleService) { }

  ngOnInit() {
  }

  saveArticle() {
    this.articleService.saveArticle(this.article);
  }
}
