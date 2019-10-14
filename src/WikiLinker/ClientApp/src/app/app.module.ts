import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { ApiAuthorizationModule } from 'src/api-authorization/api-authorization.module';
import { AuthorizeGuard } from 'src/api-authorization/authorize.guard';
import { AuthorizeInterceptor } from 'src/api-authorization/authorize.interceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SavedArticlesComponent } from './saved-articles/saved-articles.component';
import { SearchHistoryComponent } from './search-history/search-history.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { ArticleComponent } from './article/article.component';
import { ArticleService } from './article.service';
import { SearchHistoryService } from './search-history.service';
import { SearchHistoryItemComponent } from './search-history-item/search-history-item.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    SavedArticlesComponent,
    SearchHistoryComponent,
    SearchResultComponent,
    ArticleComponent,
    SearchHistoryItemComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    StorageServiceModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    ApiAuthorizationModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'saved-articles', component: SavedArticlesComponent },
      { path: 'search-result/:text', component: SearchResultComponent},
      { path: 'search-history', component: SearchHistoryComponent}
    ])
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true }, ArticleService, SearchHistoryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
