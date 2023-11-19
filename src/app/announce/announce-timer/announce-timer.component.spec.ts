import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnounceTimerComponent } from './announce-timer.component';

describe('AnnounceTimerComponent', () => {
  let component: AnnounceTimerComponent;
  let fixture: ComponentFixture<AnnounceTimerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnnounceTimerComponent]
    });
    fixture = TestBed.createComponent(AnnounceTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
