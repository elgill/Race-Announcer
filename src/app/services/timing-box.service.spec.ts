import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { TimingBoxService } from './timing-box.service';
import { SettingsService, DEFAULT_SETTINGS, Settings } from './settings.service';
import { RunnerDataService } from './runner-data.service';
import { ConnectionStatus } from '../models/connection.enum';

// Captures handlers registered via ipcRenderer.on() so tests can fire fake events.
function makeIpcMock() {
  const handlers: Record<string, Array<(event: any, data: any) => void>> = {};
  const ipcRenderer = {
    on: jasmine.createSpy('on').and.callFake((channel: string, fn: any) => {
      handlers[channel] = handlers[channel] ?? [];
      handlers[channel].push(fn);
    }),
    send: jasmine.createSpy('send'),
  };
  const emit = (channel: string, data: any) =>
    (handlers[channel] ?? []).forEach(fn => fn({}, data));
  return { ipcRenderer, emit, handlers };
}

describe('TimingBoxService', () => {
  let service: TimingBoxService;
  let ipc: ReturnType<typeof makeIpcMock>;

  const MAT_ID = 'mat-1';
  const MAT: any = { id: MAT_ID, label: 'Start', ip: '192.168.1.10', port: 10001, enabled: true, type: 'trident' };

  const FAST_SETTINGS: Settings = {
    ...DEFAULT_SETTINGS,
    reconnectDelay: 100,
    numReconnectAttempts: 3,
    matConnections: [MAT],
  };

  function mockSettingsService(settings = FAST_SETTINGS) {
    return { getSettings: () => of(settings) };
  }

  function mockRunnerDataService() {
    return {
      getBibByChipId: jasmine.createSpy('getBibByChipId').and.returnValue(null),
      enterBib: jasmine.createSpy('enterBib'),
    };
  }

  function createService(settings = FAST_SETTINGS) {
    ipc = makeIpcMock();
    (window as any).require = () => ({ ipcRenderer: ipc.ipcRenderer });

    TestBed.configureTestingModule({
      providers: [
        TimingBoxService,
        { provide: SettingsService, useValue: mockSettingsService(settings) },
        { provide: RunnerDataService, useValue: mockRunnerDataService() },
      ],
    });
    service = TestBed.inject(TimingBoxService);
  }

  afterEach(() => {
    delete (window as any).require;
    TestBed.resetTestingModule();
  });

  // ── Initialisation ──────────────────────────────────────────────────────────

  it('registers timing-box-status listener on init', () => {
    createService();
    expect(ipc.ipcRenderer.on).toHaveBeenCalledWith('timing-box-status', jasmine.any(Function));
  });

  it('registers timing-box-data listener on init', () => {
    createService();
    expect(ipc.ipcRenderer.on).toHaveBeenCalledWith('timing-box-data', jasmine.any(Function));
  });

  it('sends get-timing-box-states on init to sync state after a renderer crash', () => {
    createService();
    expect(ipc.ipcRenderer.send).toHaveBeenCalledWith('get-timing-box-states');
  });

  // ── Status updates ──────────────────────────────────────────────────────────

  it('reflects Connected status received from main process', () => {
    createService();
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Connected' });
    expect(service.getCurrentStatus(MAT_ID).status).toBe(ConnectionStatus.CONNECTED);
  });

  it('reflects Disconnected status received from main process', () => {
    createService();
    // First connect so shouldReconnect is true, then disable reconnect for this check.
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Connected' });
    service.disconnect(MAT_ID); // sets shouldReconnect=false
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Disconnected' });
    expect(service.getCurrentStatus(MAT_ID).status).toBe(ConnectionStatus.DISCONNECTED);
  });

  it('exposes Error status and message received from main process', () => {
    createService();
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Error', message: 'ECONNREFUSED' });
    // Error triggers auto-reconnect so status transitions to RECONNECTING shortly;
    // check before any ticks.
    const status = service.getCurrentStatus(MAT_ID);
    expect([ConnectionStatus.ERROR, ConnectionStatus.RECONNECTING]).toContain(status.status);
  });

  // ── Reconnect state machine ─────────────────────────────────────────────────

  it('starts auto-reconnect when an enabled mat disconnects unexpectedly', fakeAsync(() => {
    createService();
    ipc.ipcRenderer.send.calls.reset();

    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Disconnected' });
    expect(service.getCurrentStatus(MAT_ID).status).toBe(ConnectionStatus.RECONNECTING);

    tick(FAST_SETTINGS.reconnectDelay);
    expect(ipc.ipcRenderer.send).toHaveBeenCalledWith('connect-timing-box',
      jasmine.objectContaining({ matId: MAT_ID }));

    // Clean up interval
    service.disconnect(MAT_ID);
    tick(FAST_SETTINGS.reconnectDelay * FAST_SETTINGS.numReconnectAttempts);
  }));

  it('sets status to CONNECTING immediately after firing a reconnect attempt (prevents duplicate attempts)', fakeAsync(() => {
    createService();
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Disconnected' });

    tick(FAST_SETTINGS.reconnectDelay);
    // After the first attempt, status should be CONNECTING — not RECONNECTING —
    // so the very next tick does not send a second connect-timing-box before the
    // first one resolves.
    expect(service.getCurrentStatus(MAT_ID).status).toBe(ConnectionStatus.CONNECTING);

    // Confirm the next tick is silent while we're still CONNECTING.
    ipc.ipcRenderer.send.calls.reset();
    tick(FAST_SETTINGS.reconnectDelay);
    expect(ipc.ipcRenderer.send).not.toHaveBeenCalledWith('connect-timing-box',
      jasmine.any(Object));

    service.disconnect(MAT_ID);
    tick(FAST_SETTINGS.reconnectDelay * FAST_SETTINGS.numReconnectAttempts);
  }));

  it('stops auto-reconnect and resets status when connected', fakeAsync(() => {
    createService();
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Disconnected' });
    tick(FAST_SETTINGS.reconnectDelay);

    ipc.ipcRenderer.send.calls.reset();
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Connected' });

    tick(FAST_SETTINGS.reconnectDelay * 2);
    // No further connect attempts after connection established.
    expect(ipc.ipcRenderer.send).not.toHaveBeenCalledWith('connect-timing-box',
      jasmine.any(Object));
    expect(service.getCurrentStatus(MAT_ID).status).toBe(ConnectionStatus.CONNECTED);
  }));

  it('gives up after numReconnectAttempts and sets status to Disconnected', fakeAsync(() => {
    createService();
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Disconnected' });

    // Each tick fires one attempt, then main responds with Disconnected again.
    for (let i = 0; i < FAST_SETTINGS.numReconnectAttempts; i++) {
      tick(FAST_SETTINGS.reconnectDelay);
      ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Disconnected' });
    }

    tick(FAST_SETTINGS.reconnectDelay);
    expect(service.getCurrentStatus(MAT_ID).status).toBe(ConnectionStatus.DISCONNECTED);

    // No more sends after giving up.
    ipc.ipcRenderer.send.calls.reset();
    tick(FAST_SETTINGS.reconnectDelay * 2);
    expect(ipc.ipcRenderer.send).not.toHaveBeenCalledWith('connect-timing-box',
      jasmine.any(Object));
  }));

  // ── Manual disconnect ───────────────────────────────────────────────────────

  it('does not auto-reconnect after an explicit disconnect()', fakeAsync(() => {
    createService();
    // Simulate a prior successful connection.
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Connected' });

    service.disconnect(MAT_ID);
    ipc.ipcRenderer.send.calls.reset();

    // Main process confirms disconnect.
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Disconnected' });

    tick(FAST_SETTINGS.reconnectDelay * (FAST_SETTINGS.numReconnectAttempts + 1));
    expect(ipc.ipcRenderer.send).not.toHaveBeenCalledWith('connect-timing-box',
      jasmine.any(Object));
  }));

  it('sends disconnect-timing-box IPC when disconnect() is called', () => {
    createService();
    service.disconnect(MAT_ID);
    expect(ipc.ipcRenderer.send).toHaveBeenCalledWith('disconnect-timing-box',
      jasmine.objectContaining({ matId: MAT_ID }));
  });

  it('sends disconnect-all-timing-boxes IPC when disconnectAll() is called', () => {
    createService();
    service.disconnectAll();
    expect(ipc.ipcRenderer.send).toHaveBeenCalledWith('disconnect-all-timing-boxes');
  });

  // ── connect() guard ─────────────────────────────────────────────────────────

  it('ignores connect() when already connected', () => {
    createService();
    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Connected' });
    ipc.ipcRenderer.send.calls.reset();

    service.connect(MAT_ID, MAT.ip, MAT.port, MAT.label);
    expect(ipc.ipcRenderer.send).not.toHaveBeenCalledWith('connect-timing-box',
      jasmine.any(Object));
  });

  it('ignores connect() when already connecting', () => {
    createService();
    service.connect(MAT_ID, MAT.ip, MAT.port, MAT.label);
    ipc.ipcRenderer.send.calls.reset();

    service.connect(MAT_ID, MAT.ip, MAT.port, MAT.label);
    expect(ipc.ipcRenderer.send).not.toHaveBeenCalledWith('connect-timing-box',
      jasmine.any(Object));
  });

  // ── Disabled mat ────────────────────────────────────────────────────────────

  it('does not auto-reconnect a disabled mat', fakeAsync(() => {
    const settingsWithDisabledMat: Settings = {
      ...FAST_SETTINGS,
      matConnections: [{ ...MAT, enabled: false }],
    };
    createService(settingsWithDisabledMat);
    ipc.ipcRenderer.send.calls.reset();

    ipc.emit('timing-box-status', { matId: MAT_ID, status: 'Disconnected' });

    tick(FAST_SETTINGS.reconnectDelay * (FAST_SETTINGS.numReconnectAttempts + 1));
    expect(ipc.ipcRenderer.send).not.toHaveBeenCalledWith('connect-timing-box',
      jasmine.any(Object));
  }));
});
