import { Component, Input, ViewContainerRef } from '@angular/core';
// d3.js module import
import { select,selectAll } from 'd3-selection';
import { scaleLinear,scaleOrdinal } from 'd3-scale';
import {extent,min,max} from 'd3-array';
import { axisBottom,axisLeft } from 'd3-axis';

@Component({
  selector: 'app-scatter-plot-chart',
  templateUrl: './scatter-plot-chart.component.html',
  styleUrls: ['./scatter-plot-chart.component.scss']
})
export class ScatterPlotChartComponent {
    @Input() public containerWidth! : number   // total containerWidth including margins
    @Input() public containerHeight! : number  // total containerHeight including margins
    @Input() public chartData! : Array<ScatterPlotChartDataInterface>   // required chartData to plot

    private svgInHtml! : d3.Selection<d3.BaseType, unknown, null, undefined>
    private chartGroup! : d3.Selection<SVGGElement, unknown, null, undefined>
    private margin = {
                        top: 50, 
                        right: 15, 
                        bottom: 100, 
                        left: 50
                      }
    private chartWidth! : number
    private chartHeight! : number
    private dataToPlot! : Array<DataToPlotInterface>
    private xScale! : d3.ScaleLinear<number, number, never>
    private yScale! : d3.ScaleLinear<number, number, never>
    private worldAverage! : number
    private continentList = ["Asia and Pacefic","Europe and Africa","America"]
 


    constructor(private viewContainerRef : ViewContainerRef) {}

    ngOnChanges() : void {
      this.removeScatterPlotChart();
      this.createSvg();
      if(this.svgInHtml && this.containerWidth && this.chartData?.length) {
          this.drawScatterPlotChart();
      }
    }


      /**
       * @description create and configure svg container with standard d3.js margin convention
       * @function createSvg
       */
      private createSvg() : void {
      // set the dimensions and margins of the graph
      // chart width after margin-left and margin-right
      this.chartWidth =  this.containerWidth - this.margin.left - this.margin.right;  
      // chart height after margin-top and margin-bottom 
      this.chartHeight = this.containerHeight - this.margin.top - this.margin.bottom;  

      // configure svg element
      this.svgInHtml = select(this.viewContainerRef.element.nativeElement).select("svg")
                            .attr("width", this.containerWidth)
                            .attr("height", this.containerHeight)


      // create a group within the svg element to apply margins
      this.chartGroup = this.svgInHtml
                          .append("g")
                          .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
                        
     }


     private drawScatterPlotChart() : void {
       this.configureChartData();
       this.drawXAxis();
       this.drawXAxisLabel();
       this.drawYAxis();
       this.drawYAxisLabel();
       this.drawCircle();
       this.createLegend();
     }


    /**
     * @description remove extisting scatterplot chart from DOM
     * @function removeScatterPlotChart
     */
    private removeScatterPlotChart() : void {
      if(this.svgInHtml) {
        this.svgInHtml.selectAll('*').remove();
      }
    }

    /**
     * @description configure chart data according to plot
     * @function configureChartData
     */
    private configureChartData() : void {
      this.dataToPlot = this.chartData.map( (d: ScatterPlotChartDataInterface) => {
        return {
            Country : d['Country'],
            Year : d['Year'],
            Population  :  d[" Population (000s) "],
            Population_Density:  d[" Population_Density "],
            Population_Growth_Rate: d[" Population_Growth_Rate "],
            Population_Bn:(d[" Population (000s) "]/1000000),
            // implement color logic at random, this is not accurate mapping at all
            Continent: this.continentList[Math.floor(Math.random()*this.continentList.length)],
        };
      });

      // world average density upto 800 
      const Population_Density = 800
      const worldAverageValue = this.dataToPlot.filter((el:DataToPlotInterface) => el["Population_Density"] < Population_Density)
      // world average 
      this.worldAverage = worldAverageValue.reduce((accumulator:number, currentObject:DataToPlotInterface) => {
        return accumulator + currentObject["Population_Density"];
      }, 0)/worldAverageValue.length;
    }

    /**
     * @description draw xAxis and format according to chart
     * @function drawXAxis (Population Density)
     */
    private drawXAxis() : void { 
      // find xDomain Array [min,max]
      //const xDomain = extent(this.dataToPlot, (d: DataToPlotInterface) => d.Population_Density) as [number, number]

      // data according to given chart
      const xDomain = [0,800]
      // find xRange [0, chartWidth]
      const xRange = [0, this.chartWidth];

      // add xScale
      this.xScale = scaleLinear()
                       .domain(xDomain)
                       .range(xRange);

      // add xAxis
      const tickCountOnXAxis = 5;
      const xAxis = axisBottom(this.xScale)
                    .tickFormat((d:any) => d === xDomain[1] ? `>${d}` : d)
                    .ticks(tickCountOnXAxis)
      
      this.chartGroup.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0,${this.chartHeight})`)
                    .call(xAxis)

      // darw xAxis crosshair
      this.chartGroup.append("g")
                     .attr("class", "x-axis-crosshair")
                     .append("line")
                     .attr("x1",this.xScale(this.worldAverage))
                     .attr("x2", this.xScale(this.worldAverage))
                     .attr("y1", 0)
                     .attr("y2",this.chartHeight)
                      .attr("stroke", "grey")
                      .attr("stroke-dasharray","4,1")
                      .attr("stroke-opacity", 0.5)

      // darw xAxis crosshair text
      this.chartGroup.append("g")
                     .attr("class", "x-axis-crosshair-text")
                     .append("text")
                     .attr("x",this.xScale(this.worldAverage))
                     .attr("y",this.chartHeight)
                     .attr("dy",20)
                     .attr('text-anchor','middle')
                     .attr("font-weight","bold")
                     .attr('font-size',12)
                     .text(`world avg:${Math.trunc(this.worldAverage)}`)

     }


    /**
     * @description draw xAsis Label 
     * @function drawXAxisLabel
     */
    private drawXAxisLabel() : void {
      const xAxisLabel = this.chartGroup.append('g')
                             .attr('transform',`translate(${this.chartWidth/2},${this.chartHeight+this.margin.bottom/2})`)
                             .append('text')
                             .attr('text-anchor','middle')
                             .attr('font-size',13)
                             .attr('font-weight','bold')
                             .text('Population Density')

      const xAxisLegendLabel = this.chartGroup.append('g')
                             .attr('transform',`translate(0,${this.chartHeight+this.margin.bottom})`)
                             .append('text')
                             .attr("dy",-2)
                             .attr('text-anchor','start')
                             .attr('font-size',10)
                             .attr('font-weight','bold')
                             .text(`*Bubble size indicates country's population`)
    }


    /**
     * @description draw yAxis and format according to chart
     * @function drawYAxis (Population Growth Rate)
     */
    private drawYAxis() : void { 
      // find yDomain Array [min,max]
      const yDomainMin = min(this.dataToPlot, (d: DataToPlotInterface) => d.Population_Growth_Rate) as number
      const yDomainMax = max(this.dataToPlot, (d: DataToPlotInterface) => d.Population_Growth_Rate) as number

      // yDomain , data according to given chart 
      // chart is not visbile prperly so change to [yDomainMin,yDomainMax]
      //const yDomain = [-100,100] 
      const yDomain = [-5,yDomainMax]
      
      // find yRange [chartHeight,0]
      const yRange = [this.chartHeight,0];

      // add yScale
      this.yScale = scaleLinear()
                       //.domain([yDomainMin,yDomainMax])
                       .domain(yDomain)
                       .range(yRange);

      // add yAxis
      const tickCountOnYAxis = 2;
      const yAxis = axisLeft(this.yScale)
                   // .ticks(tickCountOnYAxis)

      this.chartGroup.append("g")
                    .attr("class", "y-axis")
                    .call(yAxis)
                    // darw yAxis crosshair
                    .call((g:any) => g
                      .selectAll(".tick line")
                      .clone()
                      .attr("x2", (d:number) => d === 0 ? this.chartWidth : 0)
                      .attr("stroke", "grey")
                      .attr("stroke-dasharray","4,1")
                      .attr("stroke-opacity", 0.5)
                      );
    }


    /**
     * @description draw yAsis Label 
     * @function drawYAxisLabel
    */
    private drawYAxisLabel() : void { 
      const yAxisLabel = this.chartGroup.append('g')
                             .attr('transform',`translate(${(-this.margin.left/2)},${this.chartHeight/2})`)
                             .append('text')
                             .attr("dy",20)
                             .attr('text-anchor','middle')
                             .attr('font-size',13)
                             .attr('font-weight','bold')
                             .attr("transform", "rotate(90)")
                             .text('Population Growth (%)')
    }

    /**
     * @description create scatter plot (i.e. circle)
     * @function drawCircle
     */
    private drawCircle() : void {
    // create circle domain
    const circleDomain = extent(this.dataToPlot,(d:DataToPlotInterface) => d["Population"]) as [number,number]
    const circleRadiusRange = [3,10]
    const circleRadiusScale =  scaleLinear().domain(circleDomain).range(circleRadiusRange)
    const circleColorRange = ["red","blue","green"]
    const colorScale =   scaleOrdinal()
                        .domain(this.continentList)
                        .range(circleColorRange)
    // add circle
    this.chartGroup.append('g')
                  .selectAll("circle")
                  .data(this.dataToPlot)
                  .join("circle")
                  .attr("cx",  (d:DataToPlotInterface) => this.xScale(d["Population_Density"]))
                  .attr("cy",  (d:DataToPlotInterface) => this.yScale(d["Population_Growth_Rate"]))
                  .attr("r",   (d:DataToPlotInterface) =>  circleRadiusScale(d["Population"]))
                  .attr("fill", (d:DataToPlotInterface) => colorScale(d["Continent"]) as any)
                  .attr("stroke", "black")
                  .attr("opacity","0.5")
                  .attr("stroke-width", "1px")
                  .attr("country", (d:DataToPlotInterface) => d["Country"])
                  .attr("year", (d:DataToPlotInterface) => d["Year"])
                  .attr("population", (d:DataToPlotInterface) => d["Population_Bn"])
                  .attr("population-density", (d:DataToPlotInterface) => d["Population_Density"])
                  .attr("population-growth-rate", (d:DataToPlotInterface) => d["Population_Growth_Rate"])

      // add mousemove for tooltip
     .on('mousemove', function(event) {
      const dataCountry = select(this).attr("country");
      const dataYear = select(this).attr("year");
      const dataPopulation = select(this).attr("population");
      const dataPopulationDensity = select(this).attr("population-density");
      const dataPopulationGrowth = select(this).attr("population-growth-rate");

      const [posX,posY] = [event.pageX,event.pageY];
      select("#tooltip")
      .attr('style',`left:${posX-30}px; top:${posY-30}px; visibility: visible;`)
      .html(`<strong>${dataCountry}-${dataYear}</strong><br>
      Population:${dataPopulation} Bn<br>
      Population Density:${dataPopulationDensity}<br>
      Population Growth Rate:${dataPopulationGrowth}%`)
      select(this).style('stroke', 'blue');
    })
  
    // hide tooltip in mouseout
   .on('mouseout', (d) => {
     selectAll('.circle').style('stroke', '');
     select("#tooltip").attr('style', 'visibility: hidden;');
    })

    }

    
    private createLegend(): void {

      const circleColorRange = ["red","blue","green"]
      const colorScale =   scaleOrdinal()
                        .domain(this.continentList)
                        .range(circleColorRange)
    
      // define the width and height of each legend item
      const itemWidth = 75;
      const itemHeight = 20;
      const itemSpacing = 30; 

      // create a group element for the legend
      const legendGroup = this.chartGroup
                              .append("g")  
                              .attr("class", "legend") 
                              .attr("transform", "translate(20,20)"); 

      // create a circle and text for each item in the legend
      const legendItems = legendGroup
        .selectAll("g")
        .data(this.continentList)
        .join("g")
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * (itemWidth + itemSpacing)-this.margin.left*1.8}, ${this.chartHeight+this.margin.bottom/2-20})`);

      legendItems
        .append("circle")
        .attr("cx", itemWidth)
        .attr("cy", itemHeight)
        .attr("r",5)
        .attr("fill", (d:string) => colorScale(d) as any)
        .attr("opacity","0.5")

      legendItems
        .append("text")
        .attr("x", itemWidth)
        .attr("y", itemHeight / 2)
        .attr("dx",10)
        .attr("dy",13)
        .attr("font-size",10)
        .text((d:string) => d);
    }

}

export interface ScatterPlotChartDataInterface {
  Country: string
  Year: string
  " Population (000s) ": number
  " Population_Density ": number
  " Population_Growth_Rate ": number
}

export interface DataToPlotInterface { 
    Country : string
    Year : string
    Population  : number
    Population_Density : number
    Population_Growth_Rate : number
    Population_Bn:number
    Continent:string
}
