import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchHistoryItemComponent } from './search-history-item.component';

describe('SearchHistoryItemComponent', () => {
  let component: SearchHistoryItemComponent;
  let fixture: ComponentFixture<SearchHistoryItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchHistoryItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchHistoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
