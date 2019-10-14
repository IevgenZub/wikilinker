import { Article } from "./article";
import { Word } from "./word";

export class SearchHistoryItem {
  text: string;
  links: Article[] = [];
  words: Word[] = [];
}
