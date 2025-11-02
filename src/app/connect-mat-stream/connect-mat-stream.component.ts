import { Component, OnInit, inject } from '@angular/core';
import {TimingBoxService} from "../services/timing-box.service";
import {DEFAULT_SETTINGS, SettingsService} from "../services/settings.service";
import {ConnectionStatus} from "../models/connection.enum";
import {MatConnection} from "../interfaces/mat-connection";
import {CommonModule} from "@angular/common";

interface MatConnectionStatus extends MatConnection {
  status: string;
  reconnectionStatus: string;
}

@Component({
    selector: 'app-connect-mat-stream',
    templateUrl: './connect-mat-stream.component.html',
    styleUrls: ['./connect-mat-stream.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ConnectMatStreamComponent implements OnInit {
  private timingBoxService = inject(TimingBoxService);
  private settingsService = inject(SettingsService);

  matStatuses: MatConnectionStatus[] = [];
  settings = DEFAULT_SETTINGS;

  ngOnInit() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
      this.updateMatStatuses();
    });
  }

  private updateMatStatuses() {
    this.matStatuses = this.settings.matConnections
      .filter(mat => mat.enabled)
      .map(mat => {
        const status = this.timingBoxService.getCurrentStatus(mat.id);
        const reconnectionStatus = this.timingBoxService.getCurrentReconnectStatus(mat.id);

        // Subscribe to status updates for this mat
        this.timingBoxService.getStatus(mat.id).subscribe((statusUpdate) => {
          const matStatus = this.matStatuses.find(m => m.id === mat.id);
          if (matStatus) {
            matStatus.status = statusUpdate.status;
          }
        });

        // Subscribe to reconnection status for this mat
        this.timingBoxService.getReconnectStatus(mat.id).subscribe((reconStatus) => {
          const matStatus = this.matStatuses.find(m => m.id === mat.id);
          if (matStatus) {
            matStatus.reconnectionStatus = reconStatus;
          }
        });

        return {
          ...mat,
          status: status.status,
          reconnectionStatus
        };
      });
  }

  toggleConnection(mat: MatConnection) {
    this.timingBoxService.toggleConnection(mat.id, mat.ip, mat.port, mat.label);
  }

  connectAll() {
    this.settings.matConnections
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
}
