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
  links = [];
  articleForm = this.formBuilder.group({
    text: new FormControl(this.article.text, [Validators.required, Validators.minLength(3)])
  });

  onSubmit(articleData) {
    this.http.post(this.baseUrl + 'api/articles', articleData).subscribe(
      result => this.displaySearchResult(result, articleData),
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

  private displaySearchResult(result, articleData) {
    this.photos = (<any>result).photos;
    this.entityTypes = [];
    for (let i = 0; i < this.photos.length; i++) {
      let typeName = this.photos[i].type;
      let type = { name: typeName, photos: this.photos.filter(p => p.type == typeName) };
      if (this.entityTypes.filter(e => e.name == typeName).length == 0) {
        this.entityTypes.push(type);
      }
    }

    this.links = (<any>result).links;
    let delimiters = [[" ", " "], [" ", ""], [". ", " "], [", ", " "], [" ", "."], [" ", ", "]];
    let linkedText = " " + articleData.text;
    for (let link of this.links) {
      let cssClass = "text-primary";
      switch (link.type) {
        case "LOCATION":
          cssClass = "text-success";
          break;
        case "DATETIME":
          cssClass = "text-warning";
          break;
        case "OTHER":
          cssClass = "text-secondary";
          break;
        case "PHRASE":
          cssClass = "text-info";
          break;
      }

      for (let delimiter of delimiters) {
        linkedText = linkedText.replace(
          `${delimiter[0]}${link.text}${delimiter[1]}`,
          `<a class='${cssClass}' href='${link.url}'>${delimiter[0]}${link.text}${delimiter[1]}</a>`
        );
      }
    }

    this.wikiLinkedArticle.text = linkedText;
  }
}

interface Article {
  text: string;
}
