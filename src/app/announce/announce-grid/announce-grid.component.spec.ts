import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnounceGridComponent } from './announce-grid.component';

describe('AnnounceGridComponent', () => {
  let component: AnnounceGridComponent;
  let fixture: ComponentFixture<AnnounceGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnnounceGridComponent]
    });
    fixture = TestBed.createComponent(AnnounceGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
