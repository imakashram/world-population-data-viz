import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterPlotChartComponent } from './scatter-plot-chart.component';

describe('ScatterPlotChartComponent', () => {
  let component: ScatterPlotChartComponent;
  let fixture: ComponentFixture<ScatterPlotChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScatterPlotChartComponent]
    });
    fixture = TestBed.createComponent(ScatterPlotChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
