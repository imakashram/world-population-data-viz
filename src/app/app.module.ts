import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorldPopulationDashboardComponent } from './pages/world-population-dashboard/world-population-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    WorldPopulationDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
