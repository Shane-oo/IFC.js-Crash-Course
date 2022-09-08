import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { ThreeJsPracComponent } from './three-js-prac/three-js-prac.component';
import { HelloWorldComponent } from './three-js-prac/hello-world/hello-world.component';
import { TextureLoaderComponent } from './three-js-prac/texture-loader/texture-loader.component';
import { ModelLoaderComponent } from './three-js-prac/model-loader/model-loader.component';

@NgModule({
            declarations: [
              AppComponent,
              NavMenuComponent,
              HomeComponent,
              CounterComponent,
              FetchDataComponent,
              ThreeJsPracComponent,
              HelloWorldComponent,
              TextureLoaderComponent,
              ModelLoaderComponent
            ],
            imports: [
              BrowserModule.withServerTransition({appId: 'ng-cli-universal'}),
              HttpClientModule,
              FormsModule,
              RouterModule.forRoot([
                                     {path: '', component: HomeComponent, pathMatch: 'full'},
                                     {path: 'counter', component: CounterComponent},
                                     {path: 'fetch-data', component: FetchDataComponent},
                                     {path: 'three-js-prac/hello-world', component: HelloWorldComponent}     ,
                                     {path: 'three-js-prac/texture-loader', component: TextureLoaderComponent}        ,
                                     {path: 'three-js-prac/model-loader', component: ModelLoaderComponent}

                                   ])
            ],
            providers: [],
            bootstrap: [AppComponent]
          })
export class AppModule {}
