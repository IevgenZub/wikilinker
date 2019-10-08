import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  article = <Article>{};
  wikiLinkedArticle = <Article>{};
  articleForm = this.formBuilder.group({
    text: new FormControl(this.article.text, [Validators.required, Validators.minLength(3)])
  });

  onSubmit(articleData) {
    this.http.post(this.baseUrl + 'api/articles', articleData).subscribe(
      result => this.wikiLinkedArticle = <Article>{ text: (<any>result).input },
      error => console.error(error)
    );
  }

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    @Inject('BASE_URL')
    private baseUrl: string) { }
}

interface Article {
  text: string;
}
