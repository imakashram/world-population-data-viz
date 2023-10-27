import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorldPopulationDashboardComponent } from './pages/world-population-dashboard/world-population-dashboard.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'world-population-dashboard', pathMatch: 'full'
  },
  {
    path: 'world-population-dashboard', component : WorldPopulationDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
