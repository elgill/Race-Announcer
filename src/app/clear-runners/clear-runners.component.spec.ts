import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearRunnersComponent } from './clear-runners.component';

describe('ClearRunnersComponent', () => {
  let component: ClearRunnersComponent;
  let fixture: ComponentFixture<ClearRunnersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClearRunnersComponent]
    });
    fixture = TestBed.createComponent(ClearRunnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
