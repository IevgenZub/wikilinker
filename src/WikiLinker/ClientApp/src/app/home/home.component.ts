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
  entityTypes = [];
  photos = [];
  articleForm = this.formBuilder.group({
    text: new FormControl(this.article.text, [Validators.required, Validators.minLength(3)])
  });

  onSubmit(articleData) {
    this.http.post(this.baseUrl + 'api/articles', articleData).subscribe(
      result => {
        this.wikiLinkedArticle = <Article>{ text: (<any>result).input };
        this.photos = (<any>result).photos;
        for (var i = 0; i < this.photos.length; i++) {
          var typeName = this.photos[i].type;
          var type = { name: typeName, photos: this.photos.filter(p => p.type == typeName) };
          if (this.entityTypes.filter(e => e.name == typeName).length == 0) {
            this.entityTypes.push(type);
          }
        }
      },
      error => console.error(error)
    );
  }

  reset() {
    this.articleForm.reset();
    this.wikiLinkedArticle = <Article>{};
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
