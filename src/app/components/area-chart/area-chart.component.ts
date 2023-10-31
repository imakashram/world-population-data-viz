import { Component, Input, ViewContainerRef } from '@angular/core';
// d3.js module import
import { select,selectAll } from 'd3-selection';
import { scaleLinear,scaleTime } from 'd3-scale';
import {extent,min,max} from 'd3-array';
import { axisBottom,axisLeft } from 'd3-axis';
import { area } from 'd3-shape'

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.scss']
})
export class AreaChartComponent {
  @Input() public containerWidth! : number   // total containerWidth including margins
  @Input() public containerHeight! : number  // total containerHeight including margins
  @Input() public chartData! : Array<ChartDataInterface>   // required chartData to plot

  private svgInHtml! : d3.Selection<d3.BaseType, unknown, null, undefined>
  private chartGroup! : d3.Selection<SVGGElement, unknown, null, undefined>
  private margin = {
                      top: 10, 
                      right: 10, 
                      bottom: 50, 
                      left: 50
                    }
  private chartWidth! : number
  private chartHeight! : number
  private xScale! : d3.ScaleTime<number, number, never>
  private yScale! : d3.ScaleLinear<number, number, never>
  private dataToPlot! : Array<DataToPlotInterface>
  
  constructor(private viewContainerRef : ViewContainerRef) {}

  ngOnChanges() : void {
    this.removeAreaChart();
    this.createSvg();
    if(this.svgInHtml && this.containerWidth && this.chartData?.length) {
        this.drawAreaChart();
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


   private drawAreaChart() : void {
     this.configureChartData();
     this.drawXAxis();
     this.drawYAxis();
     this.drawArea();
   }


  /**
   * @description remove extisting scatterplot chart from DOM
   * @function removeAreaChart
   */
  private removeAreaChart() : void {
    if(this.svgInHtml) {
      this.svgInHtml.selectAll('*').remove();
    }
  }

  /**
   * @description configure chart data according to plot
   * @function configureChartData
   */
  private configureChartData() : void {
    this.dataToPlot = this.chartData.map( (d: ChartDataInterface) => {
      return {
          Year : new Date (`${d.Year}`),
          TotalPopulation  :  d.TotalPopulation,
          Population_Bn : d.TotalPopulation/1000000,
      };
    });
  }

  /**
   * @description draw xAxis and format according to chart
   * @function drawXAxis
   */
  private drawXAxis() : void { 
    // find xDomain Array [min,max]
    const xDomain = extent(this.dataToPlot, (d: DataToPlotInterface) => d.Year) as any
    // find xRange [0, chartWidth]
    const xRange = [0, this.chartWidth];

    // add xScale
    this.xScale = scaleTime()
                     .domain(xDomain)
                     .range(xRange);

    // add xAxis
    const xAxis = axisBottom(this.xScale)
                  //.tickFormat((d:any) => d === xDomain[1] ? `>${d}` : d)
                 
    
    this.chartGroup.append("g")
                  .attr("class", "x-axis")
                  .attr("transform", `translate(0,${this.chartHeight})`)
                  .call(xAxis)
   }

  /**
   * @description draw yAxis and format according to chart
   * @function drawYAxis
   */
  private drawYAxis() : void { 
    // find yDomain Array [min,max]
    const yDomainMin = min(this.dataToPlot, (d: DataToPlotInterface) => d.Population_Bn) as number
    const yDomainMax = max(this.dataToPlot, (d: DataToPlotInterface) => d.Population_Bn) as number

    // find yRange [chartHeight,0]
    const yRange = [this.chartHeight,0];

    // add yScale
    this.yScale = scaleLinear()
                     .domain([yDomainMin,yDomainMax])
                     .range(yRange);

    // add yAxis
    const yAxis = axisLeft(this.yScale)

    this.chartGroup.append("g")
                  .attr("class", "y-axis")
                  .call(yAxis)
  }


  /**
   * @description create path and area
   * @function drawArea
   */
  private drawArea() : void {
  // add circle
  this.chartGroup.append('g')
                 .append("path")
                 .datum(this.dataToPlot)
                 .attr("fill", "#cce5df")
                 .attr("stroke", "#69b3a2")
                 .attr("stroke-width", 1.5)
                 .attr("d", area()
                  .x((d:any )=> this.xScale(d.Year))
                  .y0(this.yScale(0))
                  .y1((d:any) => this.yScale(d.Population_Bn)) as any
                 )
  }
}

export interface ChartDataInterface {
  Year: number
  TotalPopulation: number
}
export interface DataToPlotInterface {
  Year: Date
  TotalPopulation: number
  Population_Bn : number
}

