import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoImportComponent } from './auto-import.component';

describe('AutoImportComponent', () => {
  let component: AutoImportComponent;
  let fixture: ComponentFixture<AutoImportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AutoImportComponent]
    });
    fixture = TestBed.createComponent(AutoImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
