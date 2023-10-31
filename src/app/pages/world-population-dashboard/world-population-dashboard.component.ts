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
  public scatterPlotChartData: any;
  public areaChartData: any
  public worldPopulation: any
  public containerWidth: number = 700;
  

  constructor() { }
  
  ngOnInit(): void {
    this.containerWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      this.containerWidth = window.innerWidth;
    });
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
      this.getScatterPlotChartData(this.selectedYear)
      this.getAreaChartData()
    }).catch(function (error) {
      console.log(error);
    });
  }

  /**
   * @description configure area chart data
   * @function getAreaChartData
   * @param country 
   */
  private getAreaChartData() : void { 
    let populationGrowthData = this.populationData.map((d: any) => {
      return {
        ...d, 
        " Population (000s) ": convertToNumber(d[" Population (000s) "])
      }
    })
    
    const totalPopulationPerYear:any = {};
    populationGrowthData.forEach((el:any) => {
      const year = el.Year;
      const population = (el[" Population (000s) "]); 
      if (totalPopulationPerYear[year]) {
        totalPopulationPerYear[year] += population;
      } else {
        totalPopulationPerYear[year] = population;
      }
    });

    this.areaChartData = []
    Object.keys(totalPopulationPerYear).forEach((year:any) => {
      this.areaChartData.push({
        Year: parseInt(year),
        TotalPopulation: totalPopulationPerYear[year]
      })
    })

    // Convert the object to an array of objects for the desired format
    const totalPopulationList = Object.keys(totalPopulationPerYear).map(year => ({
      Year: parseInt(year),
      TotalPopulation: totalPopulationPerYear[year]
    }));
  }

  /**
   * @description configure scatter plot chart data
   * @function getScatterPlotChartData
   * @param year 
   */
  private getScatterPlotChartData(year: string) : void {
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
    this.scatterPlotChartData = customizedData;
    // world population data (in Billion)
    this.worldPopulation = (this.scatterPlotChartData.reduce((accumulator:any, currentObject:any) => {
      return accumulator + currentObject[" Population (000s) "];
    }, 0))/1000000;
    this.worldPopulation = this.worldPopulation.toFixed(2);
  }

  /**
   * @description get year wise population data
   * @function onYearChanged
   */
  public onYearChanged() : void {
    this.getScatterPlotChartData(this.selectedYear)
  }
}
