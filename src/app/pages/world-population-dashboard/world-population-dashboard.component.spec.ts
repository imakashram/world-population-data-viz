import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldPopulationDashboardComponent } from './world-population-dashboard.component';

describe('WorldPopulationDashboardComponent', () => {
  let component: WorldPopulationDashboardComponent;
  let fixture: ComponentFixture<WorldPopulationDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorldPopulationDashboardComponent]
    });
    fixture = TestBed.createComponent(WorldPopulationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
