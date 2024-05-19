import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportXrefComponent } from './import-xref.component';

describe('ImportXrefComponent', () => {
  let component: ImportXrefComponent;
  let fixture: ComponentFixture<ImportXrefComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportXrefComponent]
    });
    fixture = TestBed.createComponent(ImportXrefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
