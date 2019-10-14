import { Component, OnInit, Inject } from '@angular/core';
import { StorageService, LOCAL_STORAGE } from 'ngx-webstorage-service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { SearchHistoryService } from '../search-history.service';

@Component({
  selector: 'search-history',
  templateUrl: './search-history.component.html',
  styleUrls: ['./search-history.component.css']
})
export class SearchHistoryComponent implements OnInit {
  faTrash = faTrash;
  searchHistory = [];

  constructor(private searchHistoryService: SearchHistoryService) { }

  ngOnInit() {
    this.searchHistory = this.searchHistoryService.getSearchHistory();  
  }

  deleteHistory(text) {
    this.searchHistoryService.deleteHistory(text);
    this.searchHistory = this.searchHistoryService.getSearchHistory();
  }
}
