import { Injectable, Inject } from '@angular/core';
import { StorageService, LOCAL_STORAGE } from 'ngx-webstorage-service';
import { SEARCH_HISTORY_KEY } from './constants';

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
  readonly SEARCH_HISTORY_KEY: string = SEARCH_HISTORY_KEY;

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
    if (!this.storage.has(this.SEARCH_HISTORY_KEY)) {
      this.storage.set(this.SEARCH_HISTORY_KEY, []);
    } 
  }

  deleteHistory(text) {
    let searchHistory = this.storage.get(this.SEARCH_HISTORY_KEY);
    searchHistory = searchHistory.filter(sh => sh.text != text);
    this.storage.set(this.SEARCH_HISTORY_KEY, searchHistory);
  }

  deleteArticleFromHistory(historyText, articleText) {
    let searchHistory = this.storage.get(this.SEARCH_HISTORY_KEY);
    let historyItem = searchHistory.filter(sh => sh.text == historyText)[0];
    historyItem.result.links = historyItem.result.links.filter(hi => hi.text != articleText);
    historyItem.result.links.forEach(link => {
      link.innerSearch.links = link.innerSearch.links.filter(hi => hi.text != articleText);
    });

    this.storage.set(this.SEARCH_HISTORY_KEY, searchHistory);
  }

  saveHistory(historyItem) {
    var searchHistory = this.storage.get(this.SEARCH_HISTORY_KEY);
    searchHistory.push(historyItem);
    this.storage.set(this.SEARCH_HISTORY_KEY, searchHistory);
  }

  getSearchHistory() {
    return this.storage.get(this.SEARCH_HISTORY_KEY);
  }
}
