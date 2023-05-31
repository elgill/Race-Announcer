import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameLookupComponent } from './name-lookup.component';

describe('NameLookupComponent', () => {
  let component: NameLookupComponent;
  let fixture: ComponentFixture<NameLookupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NameLookupComponent]
    });
    fixture = TestBed.createComponent(NameLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
