import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { WorldPopulationDashboardComponent } from "./world-population-dashboard.component";
import { NgModule } from "@angular/core";
import { AreaChartComponent } from "src/app/components/area-chart/area-chart.component";
import { ScatterPlotChartComponent } from "src/app/components/scatter-plot-chart/scatter-plot-chart.component";

const routes: Routes = [
    {
      path: '',
      component: WorldPopulationDashboardComponent
    }
  ];
  
  @NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(routes)
    ],
    declarations: [WorldPopulationDashboardComponent, AreaChartComponent, ScatterPlotChartComponent]
  })
  export class WorldPopulationDashboardModule {}