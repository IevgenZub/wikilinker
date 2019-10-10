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
  links = [];
  linkTypes = [];
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
    if (!this.searchStarted) {
      this.articleForm.reset();
      this.wikiLinkedArticle = <Article>{};
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    @Inject('BASE_URL')
    private baseUrl: string) { }

  private displaySearchResult(result, articleData) {
    this.wordTypes = [];
    this.linkTypes = [];

    this.words = (<any>result).words;
    for (let word of this.words) {
      let typeName = word.type;
      if (this.wordTypes.filter(w => w.name == typeName).length == 0) {
        this.wordTypes.push({ name: typeName, words: this.words.filter(w => w.type == typeName) });
      }
    }

    this.links = (<any>result).links;
    let delimiters = [[" ", " "], [". ", " "], [", ", " "], [" ", "."], [" ", ", "]];
    let linkedText = " " + articleData.text + " ";
    for (let link of this.links) {
      
      let typeName = link.type;
      let cssClass = this.getLinkStyle(typeName);
      if (this.linkTypes.filter(l => l.name == typeName).length == 0) {
        this.linkTypes.push({ name: typeName, links: this.links.filter(l => l.type == typeName && l.description.length > 0) });
      }

      for (let delimiter of delimiters) {
        linkedText = linkedText.replace(
          `${delimiter[0]}${link.text}${delimiter[1]}`,
          `<a target='_blank' class='${cssClass}' href='${link.url}'>${delimiter[0]}${link.text}${delimiter[1]}</a>`
        );
      }

      let innerLinkedText = link.description;
      
      if (link.innerSearch && innerLinkedText.length > 0) {
        for (let innerLink of link.innerSearch.links) {
          link.innerLinkTypes = [];
          let innerTypeName = innerLink.type;
          let innerCss = this.getLinkStyle(innerTypeName);
          if (link.innerLinkTypes.filter(l => l.name == innerTypeName).length == 0) {
            link.innerLinkTypes.push({
              name: innerTypeName,
              links: link.innerSearch.links.filter(l => l.type == innerTypeName && l.description.length > 0)
            });
          }

          for (let delimiter of delimiters) {
            innerLinkedText = innerLinkedText.replace(
              `${delimiter[0]}${innerLink.text}${delimiter[1]}`,
              `<a target='_blank' class='${innerCss}' href='${innerLink.url}'>${delimiter[0]}${innerLink.text}${delimiter[1]}</a>`
            );
          }
        }

        link.description = innerLinkedText;
      }
    }

    this.wikiLinkedArticle.text = linkedText;
    this.searchStarted = false;
  }

  private getLinkStyle(type) {
    let cssClass = "text-primary";
    switch (type) {
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

    return cssClass;
  }
}

interface Article {
  text: string;
}
