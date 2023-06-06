import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerTableComponent } from './runner-table.component';

describe('RunnerTableComponent', () => {
  let component: RunnerTableComponent;
  let fixture: ComponentFixture<RunnerTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RunnerTableComponent]
    });
    fixture = TestBed.createComponent(RunnerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
