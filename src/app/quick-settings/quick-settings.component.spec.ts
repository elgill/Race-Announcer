import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { QuickSettingsComponent } from './quick-settings.component';

describe('QuickSettingsComponent', () => {
  let component: QuickSettingsComponent;
  let fixture: ComponentFixture<QuickSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickSettingsComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
