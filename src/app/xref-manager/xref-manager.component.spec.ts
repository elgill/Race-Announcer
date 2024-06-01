import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XrefManagerComponent } from './xref-manager.component';

describe('XrefManagerComponent', () => {
  let component: XrefManagerComponent;
  let fixture: ComponentFixture<XrefManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [XrefManagerComponent]
    });
    fixture = TestBed.createComponent(XrefManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
