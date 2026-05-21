import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AutoImportComponent } from './auto-import.component';

describe('AutoImportComponent', () => {
  let component: AutoImportComponent;
  let fixture: ComponentFixture<AutoImportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AutoImportComponent],
      providers: [provideHttpClient()]
    });
    fixture = TestBed.createComponent(AutoImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
