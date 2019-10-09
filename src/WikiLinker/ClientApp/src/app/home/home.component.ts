import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  searchStarted = false;
  article = <Article>{};
  wikiLinkedArticle = <Article>{};
  entityTypes = [];
  photos = [];
  links = [];
  words = [];
  wordTypes = [];
  articleForm = this.formBuilder.group({
    text: new FormControl(this.article.text, [Validators.required, Validators.minLength(3)])
  });

  onSubmit(articleData) {
    this.searchStarted = true;
    this.wikiLinkedArticle = <Article>{};
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
    this.entityTypes = [];
    this.wordTypes = [];

    this.photos = (<any>result).photos;
    for (let photo of this.photos) {
      let typeName = photo.type;
      if (this.entityTypes.filter(e => e.name == typeName).length == 0) {
        this.entityTypes.push({ name: typeName, photos: this.photos.filter(p => p.type == typeName) });
      }
    }

    this.words = (<any>result).words;
    for (let word of this.words) {
      let typeName = word.type;
      if (this.wordTypes.filter(w => w.name == typeName).length == 0) {
        this.wordTypes.push({ name: typeName, words: this.words.filter(w => w.type == typeName) });
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
          `<a target='_blank' class='${cssClass}' href='${link.url}'>${delimiter[0]}${link.text}${delimiter[1]}</a>`
        );
      }
    }

    this.wikiLinkedArticle.text = linkedText;
    this.searchStarted = false;
  }
}

interface Article {
  text: string;
}
