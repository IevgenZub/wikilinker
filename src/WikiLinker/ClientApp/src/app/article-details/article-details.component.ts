import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../article.service';
import { Article } from '../article';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-article-details',
  templateUrl: './article-details.component.html',
  styleUrls: ['./article-details.component.css']
})
export class ArticleDetailsComponent implements OnInit {
  article: Article;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService
  ) { }

  ngOnInit() {
    this.route.params.pipe(map(p => p.text)).subscribe(
      result => this.article = this.articleService.getSavedArticles().filter(sa => sa.text == result)[0]
    );
  }
}
