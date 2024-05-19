import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowXrefComponent } from './show-xref.component';

describe('ShowXrefComponent', () => {
  let component: ShowXrefComponent;
  let fixture: ComponentFixture<ShowXrefComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowXrefComponent]
    });
    fixture = TestBed.createComponent(ShowXrefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
