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
import { VrExampleComponent } from './three-js-prac/vr-example/vr-example.component';
import { IfcJsComponent } from './ifc-js/ifc-js.component';
import { IfcJsHelloWorldComponent } from './ifc-js/ifc-js-hello-world/ifc-js-hello-world.component';
import { ViewerExampleComponent } from './ifc-js/viewer-example/viewer-example.component';
import { SpatialTreeExampleComponent } from './ifc-js/spatial-tree-example/spatial-tree-example.component';

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
              ModelLoaderComponent,
              VrExampleComponent,
              IfcJsComponent,
              IfcJsHelloWorldComponent,
              ViewerExampleComponent,
              SpatialTreeExampleComponent,

            ],
            imports: [
              BrowserModule.withServerTransition({appId: 'ng-cli-universal'}),
              HttpClientModule,
              FormsModule,
              RouterModule.forRoot([
                                     {path: '', component: HomeComponent, pathMatch: 'full'},
                                     {path: 'counter', component: CounterComponent},
                                     {path: 'fetch-data', component: FetchDataComponent},
                                     {path: 'three-js-prac/hello-world', component: HelloWorldComponent},
                                     {path: 'three-js-prac/texture-loader', component: TextureLoaderComponent},
                                     {path: 'three-js-prac/model-loader', component: ModelLoaderComponent},
                                     {path: 'three-js-prac/vr-example', component: VrExampleComponent},
                                     {path: 'ifc-js/hello-world', component: IfcJsHelloWorldComponent},
                                     {path: 'ifc-js/viewer-example', component: ViewerExampleComponent} ,
                                     {path: 'ifc-js/spatial-tree-example', component: SpatialTreeExampleComponent}

                                   ])
            ],
            providers: [],
            bootstrap: [AppComponent]
          })
export class AppModule {}
