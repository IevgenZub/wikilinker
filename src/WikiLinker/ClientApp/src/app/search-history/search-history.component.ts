import { Component, OnInit, Inject } from '@angular/core';
import { StorageService, LOCAL_STORAGE } from 'ngx-webstorage-service';
import { SEARCH_HISTORY_KEY} from '../constants';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'search-history',
  templateUrl: './search-history.component.html',
  styleUrls: ['./search-history.component.css']
})
export class SearchHistoryComponent implements OnInit {
  readonly SEARCH_HISTORY_KEY = SEARCH_HISTORY_KEY;
  faTrash = faTrash;
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

  removeFromHistory(text) {
    this.searchHistory = this.searchHistory.filter(sh => sh.text != text);
    this.storage.set(this.SEARCH_HISTORY_KEY, this.searchHistory);
  }
}
