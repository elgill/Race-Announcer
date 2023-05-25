import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnounceFreeformComponent } from './announce-freeform.component';

describe('AnnounceTestComponent', () => {
  let component: AnnounceFreeformComponent;
  let fixture: ComponentFixture<AnnounceFreeformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnnounceFreeformComponent]
    });
    fixture = TestBed.createComponent(AnnounceFreeformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
