import {Component, NgZone, OnInit} from '@angular/core';
import {TimingBoxService} from "../services/timing-box.service";
import {DEFAULT_SETTINGS, SettingsService} from "../services/settings.service";
import {ConnectionStatus} from "../models/connection.enum";

@Component({
  selector: 'app-connect-mat-stream',
  templateUrl: './connect-mat-stream.component.html',
  styleUrls: ['./connect-mat-stream.component.css']
})
export class ConnectMatStreamComponent implements OnInit {
  records: any[] = [];
  status: string = ConnectionStatus.UNKNOWN;
  settings = DEFAULT_SETTINGS;

  constructor(private timingBoxService: TimingBoxService, private settingsService: SettingsService, private ngZone: NgZone) {}

  ngOnInit() {
    this.status = this.timingBoxService.getCurrentStatus();

    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });

    this.timingBoxService.getStatus().subscribe((status) => {
      this.ngZone.run(() => {
        this.status = status.status;
        console.log('Status updated to: ', this.status);
      });
    });

    this.timingBoxService.getData().subscribe((data) => {
      this.ngZone.run(() => {
        this.records.push(data);
        console.log('New record added: ', data);
      });
    });
  }

  toggleConnection() {
    if (this.status === ConnectionStatus.CONNECTED) {
      this.disconnect();
    } else {
      this.connect();
    }
  }

  connect() {
    this.timingBoxService.connect(this.settings.ip, this.settings.port);
  }

  disconnect() {
    this.timingBoxService.disconnect();
  }

  protected readonly ConnectionStatus = ConnectionStatus;
}
