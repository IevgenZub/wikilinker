import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { faSearch, faUndo, faTrash } from '@fortawesome/free-solid-svg-icons';
import { SearchParams } from '../search-params';
import { SearchHistoryService } from '../search-history.service';
import { SearchHistoryItem } from '../search-history-item';
import { Article } from '../article';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  faUndo = faUndo;
  faSearch = faSearch;
  searchStarted = false;
  searchParams = <SearchParams> {};
  searchForm = this.formBuilder.group({
    text: new FormControl(this.searchParams.text, [Validators.required, Validators.minLength(3)]),
    recursiveSearch: new FormControl(this.searchParams.recursiveSearch)
  });

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    @Inject('BASE_URL')
    private baseUrl: string,
    private router: Router,
    private searcHistoryService: SearchHistoryService) {
  }

  ngOnInit(): void {    
    this.searchForm.controls['recursiveSearch'].setValue(false);
  }

  onSubmit(searchData) {
    this.searchStarted = true;
    this.http.post(this.baseUrl + 'api/articles', searchData).subscribe(
      result => {
        this.searcHistoryService.saveHistory({
          text: searchData.text,
          date: new Date(),
          links: (<any>result).links,
          words: (<any>result).words
        });

        this.router.navigate([`/search-result/${searchData.text}`]);
      },
      error => console.error(error)
    );
  }

  reset() {
    if (!this.searchStarted) {
      this.searchForm.reset();
      this.searchForm.controls['recursiveSearch'].setValue(false);
    }
  }
}

