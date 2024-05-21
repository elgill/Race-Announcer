import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerRunnerTableComponent } from './timer-runner-table.component';

describe('TimerRunnerTableComponent', () => {
  let component: TimerRunnerTableComponent;
  let fixture: ComponentFixture<TimerRunnerTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimerRunnerTableComponent]
    });
    fixture = TestBed.createComponent(TimerRunnerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
