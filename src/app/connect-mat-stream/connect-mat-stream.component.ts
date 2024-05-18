import {Component, NgZone, OnInit} from '@angular/core';
import {TimingBoxService} from "../services/timing-box.service";

@Component({
  selector: 'app-connect-mat-stream',
  templateUrl: './connect-mat-stream.component.html',
  styleUrls: ['./connect-mat-stream.component.css']
})
export class ConnectMatStreamComponent implements OnInit {
  records: any[] = [];
  status: string = 'disconnected';
  ip: string = '127.0.0.1';
  port: number = 10001;

  constructor(private timingBoxService: TimingBoxService, private ngZone: NgZone) {}

  ngOnInit() {
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

  connect() {
    this.timingBoxService.connect(this.ip, this.port);
  }

  disconnect() {
    this.timingBoxService.disconnect();
  }
}
