import { Component, Input, ViewContainerRef } from '@angular/core';
// d3.js module import
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import {extent,min,max} from 'd3-array';
import { axisBottom} from 'd3-axis';
import { line,area } from 'd3-shape'


@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.scss']
})
export class AreaChartComponent {
  @Input() public containerWidth! : number   // total containerWidth including margins
  @Input() public containerHeight! : number  // total containerHeight including margins
  @Input() public chartData! : Array<ChartDataInterface>   // required chartData 

  private svgInHtml! : d3.Selection<d3.BaseType, unknown, null, undefined>
  private chartGroup! : d3.Selection<SVGGElement, unknown, null, undefined>
  private margin = {
                      top: 20, 
                      right: 25, 
                      bottom: 30, 
                      left: 30
                    }
  private chartWidth! : number
  private chartHeight! : number
  private xScale! : d3.ScaleLinear<number, number, never>
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
     this.drawLine();
     this.drawArea();
     this.printYLabel();
   }


  /**
   * @description remove extisting area chart from DOM
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
          Year : d.Year,
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
    const xDomain = extent(this.dataToPlot, (d: DataToPlotInterface) => d.Year) as [number,number]

    // find xRange [0, chartWidth]
    const xRange = [0, this.chartWidth];


    // add xScale
    this.xScale = scaleLinear()
                     .domain(xDomain)
                     .range(xRange);


    // add xAxis
    const xAxis = axisBottom(this.xScale)
                    // print only first and last tickValues
                    .tickValues([this.xScale.domain()[0], this.xScale.domain()[1]])
                    .tickFormat((d: any) => d);
                 
    
    this.chartGroup.append("g")
                  .attr("class", "x-axis")
                  .style("font-size", "14")
                  .attr("font-weight","bold")
                  .attr("transform", `translate(0,${this.chartHeight})`)
                  .call(xAxis)

    // Select and remove the axis lines
    this.chartGroup.select(".domain").remove();

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
    // take yDomainMin is 0 so htat chart will not start from given data min value
    this.yScale = scaleLinear()
                     .domain([0,yDomainMax])
                     .range(yRange);
  }


     /**
   * @description draw line
   * @function drawLine
   */
     private drawLine(): void { 
      // line generator
      let lineGenerator = line()
                          .x((d:any)=> this.xScale(d.Year))
                          .y((d:any)=> this.yScale(d.Population_Bn));

      this.chartGroup.append("path")
                     .datum(this.dataToPlot)
                     .attr("d", lineGenerator as any)
                     .attr("stroke", "#FF9C05")
                     .attr("stroke-width", 2)
                     .attr("fill", "none");
  }


  /**
   * @description create path and area
   * @function drawArea
   */
  private drawArea() : void {

    // create area generator 
    let areaGenerator : d3.Area<[number, number]> = area()
                                                    .x((d:any)=>  this.xScale(d.Year))
                                                    .y0(this.chartHeight)
                                                    .y1((d: any)=> this.yScale(d.Population_Bn));
      // add path and area
      this.chartGroup.append('g')
                     .append("path")
                     .datum(this.dataToPlot)
                     .attr("fill", "#ffddb5")
                     .attr("opacity",0.5)
                     .attr("d", areaGenerator as any)
  }

  private printYLabel() : void { 
    // adding y value labels as text
    this.chartGroup.selectAll(".y-label")
    .data(this.dataToPlot)
    .join("text")
    .attr("class", "y-label")
    .text((d:DataToPlotInterface,i:number) => (i === 0 || i === this.dataToPlot.length-1) ? `${d.Population_Bn.toFixed(2)}Bn` : null)
    .attr("x", (d:DataToPlotInterface) => this.xScale(d.Year)) 
    .attr("y", (d:DataToPlotInterface) => this.yScale(d.Population_Bn))
    .attr("dy",-10)
    .attr("dx",2)
    .attr("font-size", "14")
    .attr("font-weight","bold")
    .attr("text-anchor", "middle");
  }
}

export interface ChartDataInterface {
  Year: number
  TotalPopulation: number
}
export interface DataToPlotInterface {
  Year: number
  TotalPopulation: number
  Population_Bn : number
}

