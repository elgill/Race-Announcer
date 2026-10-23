import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';

import { ConnectMatStreamComponent } from './connect-mat-stream.component';
import { DEFAULT_SETTINGS, SettingsService } from '../services/settings.service';
import { TimingBoxService } from '../services/timing-box.service';
import { ConnectionStatus } from '../models/connection.enum';

describe('ConnectMatStreamComponent', () => {
  let component: ConnectMatStreamComponent;
  let fixture: ComponentFixture<ConnectMatStreamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConnectMatStreamComponent]
    });
    spyOn(localStorage, 'setItem');
    TestBed.inject(SettingsService).updateSettings({
      ...DEFAULT_SETTINGS,
      matConnections: [{ id: 'mat-a', label: 'Finish', ip: '192.168.1.10', port: 10001, enabled: true, type: 'trident' }]
    });
    fixture = TestBed.createComponent(ConnectMatStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates the status badge when mat status arrives outside the Angular zone', () => {
    const badge = () => fixture.nativeElement.querySelector('.status-badge') as HTMLElement;
    expect(badge().textContent).toContain(ConnectionStatus.DISCONNECTED);

    // Same path the timing-box-status IPC listener takes
    const timingBoxService = TestBed.inject(TimingBoxService) as any;
    TestBed.inject(NgZone).runOutsideAngular(() => {
      timingBoxService.getOrCreateStatusSubject('mat-a').next({ status: ConnectionStatus.CONNECTED });
    });
    fixture.detectChanges();

    expect(badge().textContent).toContain(ConnectionStatus.CONNECTED);
    expect(badge().classList).toContain('status-connected');
    expect(fixture.nativeElement.querySelector('.mat-action').textContent).toContain('Disconnect');
  });

  it('drops mats that are removed from settings', () => {
    spyOn(TestBed.inject(TimingBoxService), 'disconnect');
    TestBed.inject(SettingsService).updateSettings({ ...DEFAULT_SETTINGS, matConnections: [] });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No timing mats configured');
  });
});
