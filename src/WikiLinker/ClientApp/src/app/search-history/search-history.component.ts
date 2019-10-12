import { Component, OnInit, Inject } from '@angular/core';
import { StorageService, LOCAL_STORAGE } from 'ngx-webstorage-service';

@Component({
  selector: 'app-search-history',
  templateUrl: './search-history.component.html',
  styleUrls: ['./search-history.component.css']
})
export class SearchHistoryComponent implements OnInit {
  readonly SEARCH_HISTORY_KEY = "WIKILINKER_SEARCH_HISTORY";
  searchHistory = [];

  constructor(
    @Inject(LOCAL_STORAGE)
    private storage: StorageService) { }

  ngOnInit() {
    if (!this.storage.has(this.SEARCH_HISTORY_KEY)) {
      this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);
    } else {
      this.searchHistory = this.storage.get(this.SEARCH_HISTORY_KEY);
    }
  }
}
