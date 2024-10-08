import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerInfoComponent } from './runner-info.component';

describe('RunnerInfoComponent', () => {
  let component: RunnerInfoComponent;
  let fixture: ComponentFixture<RunnerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunnerInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunnerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
