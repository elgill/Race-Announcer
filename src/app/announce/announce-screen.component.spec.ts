import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnounceScreenComponent } from './announce-screen.component';

describe('RunnerComponent', () => {
  let component: AnnounceScreenComponent;
  let fixture: ComponentFixture<AnnounceScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnnounceScreenComponent]
    });
    fixture = TestBed.createComponent(AnnounceScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
