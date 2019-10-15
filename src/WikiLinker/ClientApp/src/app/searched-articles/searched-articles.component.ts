import { Component, OnInit } from '@angular/core';
import { SearchHistoryService } from '../search-history.service';
import { SearchHistoryItem } from '../search-history-item';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-searched-articles',
  templateUrl: './searched-articles.component.html',
  styleUrls: ['./searched-articles.component.css']
})
export class SearchedArticlesComponent implements OnInit {
  searchHistory: SearchHistoryItem[] = [];
  articleTypes = [];
  articlesCount = 0;
  faTrash = faTrash;

  constructor(private searchHistoryService: SearchHistoryService) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.searchHistory = this.searchHistoryService.getSearchHistory();
    this.articleTypes = [];
    for (let seachHistoryItem of this.searchHistory) {
      for (let article of seachHistoryItem.links) {
        let type = article.type;
        if (this.articleTypes.filter(at => at.name == type).length == 0) {
          var articles = seachHistoryItem.links.filter(l => l.type == type && l.description.length > 0);
          if (articles.length > 0) {
            this.articleTypes.push({ name: type, articles: articles });
            this.articlesCount += articles.length;
          }
        }
      }
    }
  }
}
