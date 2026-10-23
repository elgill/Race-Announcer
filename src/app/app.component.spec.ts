import { TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { ElectronService } from './services/electron.service';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [AppComponent],
    providers: [provideRouter([])]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('shows update progress pushed from the main process', () => {
    const listeners = new Map<string, (...args: any[]) => void>();
    spyOn(TestBed.inject(ElectronService), 'on').and.callFake((channel: string, listener: any) => {
      listeners.set(channel, listener);
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // IPC listeners run outside the Angular zone
    const zone = TestBed.inject(NgZone);
    zone.runOutsideAngular(() => {
      listeners.get('update-available')!({}, { version: '9.9.9' });
      listeners.get('update-progress')!({}, { percent: 42.4 });
    });
    fixture.detectChanges();
    const banner = () => fixture.nativeElement.querySelector('.update-banner') as HTMLElement;
    expect(banner().textContent).toContain('v9.9.9');
    expect(banner().textContent).toContain('42%');

    zone.runOutsideAngular(() => listeners.get('update-downloaded')!({}, {}));
    fixture.detectChanges();
    expect(banner().classList).toContain('ready');
    expect(banner().textContent).toContain('Version 9.9.9');
  });
});
