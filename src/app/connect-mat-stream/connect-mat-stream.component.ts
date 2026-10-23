import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, map, of, switchMap, tap } from 'rxjs';
import {TimingBoxService} from "../services/timing-box.service";
import {DEFAULT_SETTINGS, SettingsService} from "../services/settings.service";
import {ConnectionStatus} from "../models/connection.enum";
import {MatConnection} from "../interfaces/mat-connection";
import {CommonModule} from "@angular/common";

interface MatConnectionStatus extends MatConnection {
  status: string;
  statusMessage: string;
  reconnectionStatus: string;
}

@Component({
    selector: 'app-connect-mat-stream',
    templateUrl: './connect-mat-stream.component.html',
    styleUrls: ['./connect-mat-stream.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ConnectMatStreamComponent {
  private timingBoxService = inject(TimingBoxService);
  private settingsService = inject(SettingsService);

  private settings = toSignal(this.settingsService.getSettings(), { initialValue: DEFAULT_SETTINGS });

  // Status updates arrive over IPC (outside the Angular zone), so this is a signal that
  // re-subscribes to each enabled mat's status whenever the mat list changes.
  matStatuses = toSignal(
    this.settingsService.getSettings().pipe(
      map(settings => settings.matConnections.filter(mat => mat.enabled)),
      tap(enabledMats => this.disconnectRemovedMats(enabledMats)),
      switchMap(enabledMats => enabledMats.length === 0
        ? of([])
        : combineLatest(enabledMats.map(mat => this.watchMat(mat))))
    ),
    { initialValue: [] }
  );

  private watchMat(mat: MatConnection): Observable<MatConnectionStatus> {
    return combineLatest([
      this.timingBoxService.getStatus(mat.id),
      this.timingBoxService.getReconnectStatus(mat.id)
    ]).pipe(
      map(([status, reconnectionStatus]) => ({
        ...mat,
        status: status.status,
        statusMessage: status.message || '',
        reconnectionStatus
      }))
    );
  }

  private disconnectRemovedMats(enabledMats: MatConnection[]) {
    const enabledMatIds = new Set(enabledMats.map(mat => mat.id));
    this.timingBoxService.getAllMatIds()
      .filter(matId => !enabledMatIds.has(matId))
      .forEach(matId => this.timingBoxService.disconnect(matId));
  }

  toggleConnection(mat: MatConnection) {
    this.timingBoxService.toggleConnection(mat.id, mat.ip, mat.port, mat.label);
  }

  connectAll() {
    this.settings().matConnections
      .filter(mat => mat.enabled)
      .forEach(mat => {
        const status = this.timingBoxService.getCurrentStatus(mat.id);
        if (status.status === ConnectionStatus.DISCONNECTED) {
          this.timingBoxService.connect(mat.id, mat.ip, mat.port, mat.label);
        }
      });
  }

  disconnectAll() {
    this.timingBoxService.disconnectAll();
  }

  protected readonly ConnectionStatus = ConnectionStatus;

  protected getStatusClass(status: string): string {
    if (!status) {
      return 'status-unknown';
    }

    const normalized = status.toLowerCase();

    if (normalized.startsWith('reconnect')) {
      return 'status-reconnecting';
    }

    if (normalized.startsWith('disconnect')) {
      return 'status-disconnected';
    }

    if (normalized.startsWith('connecting')) {
      return 'status-connecting';
    }

    if (normalized.startsWith('connected')) {
      return 'status-connected';
    }

    if (normalized.startsWith('error')) {
      return 'status-error';
    }

    return 'status-unknown';
  }

  protected getStatusLabel(mat: MatConnectionStatus): string {
    if (!mat) {
      return '';
    }

    if (mat.status === ConnectionStatus.ERROR && mat.statusMessage) {
      return `Error: ${mat.statusMessage}`;
    }

    return mat.statusMessage || mat.status;
  }
}
