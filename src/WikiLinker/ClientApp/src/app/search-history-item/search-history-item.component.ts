import { Component, OnInit, Input } from '@angular/core';
import { SearchHistoryItem } from '../search-history-item';

@Component({
  selector: 'search-history-item',
  templateUrl: './search-history-item.component.html',
  styleUrls: ['./search-history-item.component.css']
})
export class SearchHistoryItemComponent implements OnInit {
  @Input() historyItem: SearchHistoryItem;
  @Input() miniSize: boolean = false;
  linkTypes: any[] = [];

  constructor() { }

  ngOnInit() {
    this.historyItem.links.forEach(l => {
      let type = l.type;
      if (this.linkTypes.filter(lt => lt.name == type).length == 0) {
        let matchingLinks = this.historyItem.links.filter(hi => hi.type == type)
        if (matchingLinks.length > 0) {
          this.linkTypes.push({name: type, links: matchingLinks})
        }
      }
    });
  }
}
