import { Component } from '@angular/core';
// Import D3.js Module
import * as d3 from 'd3'
import { convertToNumber } from 'src/app/services/utils';

@Component({
  selector: 'app-world-population-dashboard',
  templateUrl: './world-population-dashboard.component.html',
  styleUrls: ['./world-population-dashboard.component.scss']
})
export class WorldPopulationDashboardComponent {
  public populationData : any
  public uniqueYear: any
  public selectedYear: any;
  public graphData: any;
  public worldPopulation: any

  constructor() { }
  
  ngOnInit(): void {
    this.getPopulationData();
  }


  /**
   * @description get polulation data for work
   * @function getPopulationData
   */
  private getPopulationData() : void {
    // fetch .csv file by using d3.csv method
    d3.csv('./assets/data/world_population.csv').then((response) => {
      this.populationData = response
      this.uniqueYear = [...new Set(this.populationData.map((el: any) => el.Year))];
      this.selectedYear = this.uniqueYear[this.uniqueYear.length-1] as any;
      this.getGraphData(this.selectedYear)
    }).catch(function (error) {
      console.log(error);
    });
  }

  /**
   * @description configure graph data
   * @function getGraphData
   * @param year 
   */
  private getGraphData(year: string) : void {
    let yearWiseData = this.populationData.filter((el: any) => el.Year === year);
    let customizedData = yearWiseData.map((d: any) => {
      return {
        ...d, 
        " Population (000s) ": convertToNumber(d[" Population (000s) "]), 
        " Population_Density ": convertToNumber(d[" Population_Density "] ),
        " Population_Growth_Rate ":convertToNumber(d[" Population_Growth_Rate "] )
      }
    })
    customizedData.sort((a:any,b:any) =>b[" Population (000s) "]-a[" Population (000s) "])
    this.graphData = customizedData;
    this.worldPopulation = (this.graphData.reduce((accumulator:any, currentObject:any) => {
      return accumulator + currentObject[" Population (000s) "];
    }, 0))/1000000;
    this.worldPopulation = this.worldPopulation.toFixed(2);
    console.log(this.graphData,this.worldPopulation)
  }

  /**
   * @description change the year to get population data
   * @function getGraphData
   */
  public onYearChanged() : void {
    this.getGraphData(this.selectedYear)
  }
}
