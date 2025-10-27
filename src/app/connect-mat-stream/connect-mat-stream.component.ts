import {Component, OnInit} from '@angular/core';
import {TimingBoxService} from "../services/timing-box.service";
import {DEFAULT_SETTINGS, SettingsService} from "../services/settings.service";
import {ConnectionStatus} from "../models/connection.enum";

@Component({
    selector: 'app-connect-mat-stream',
    templateUrl: './connect-mat-stream.component.html',
    styleUrls: ['./connect-mat-stream.component.css'],
    standalone: true
})
export class ConnectMatStreamComponent implements OnInit {
  status: string = ConnectionStatus.UNKNOWN;
  reconnectionStatus = "";
  settings = DEFAULT_SETTINGS;

  constructor(private timingBoxService: TimingBoxService, private settingsService: SettingsService) {}

  ngOnInit() {
    this.status = this.timingBoxService.getCurrentStatus();
    this.reconnectionStatus = this.timingBoxService.getCurrentReconnectStatus()

    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });

    this.timingBoxService.getStatus().subscribe((status) => {
      this.status = status.status;
      console.log('Angular status updated to: ', this.status);
    });

    this.timingBoxService.getReconnectStatus().subscribe((status) => {
      this.reconnectionStatus = status;
    })
  }

  toggleConnection() {
    this.timingBoxService.toggleConnection(this.settings.ip, this.settings.port);
  }

  protected readonly ConnectionStatus = ConnectionStatus;
}
