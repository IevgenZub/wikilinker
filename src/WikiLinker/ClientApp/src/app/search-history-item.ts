import { Article } from "./article";
import { Word } from "./word";

export class SearchHistoryItem {
  text: string;
  date: Date;
  links: Article[] = [];
  words: Word[] = [];
}
