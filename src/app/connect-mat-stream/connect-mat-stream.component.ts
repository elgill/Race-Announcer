import {Component, OnInit} from '@angular/core';
import {TimingBoxService} from "../services/timing-box.service";

@Component({
  selector: 'app-connect-mat-stream',
  templateUrl: './connect-mat-stream.component.html',
  styleUrls: ['./connect-mat-stream.component.css']
})
export class ConnectMatStreamComponent implements OnInit {
  records: any[] = [];
  status: string = 'disconnected';
  ip: string = '192.168.1.100';
  port: number = 10001;

  constructor(private timingBoxService: TimingBoxService) {}

  ngOnInit() {
    this.timingBoxService.getStatus().subscribe((status) => {
      this.status = status.status;
    });

    this.timingBoxService.getData().subscribe((data) => {
      this.records.push(data);
    });
  }

  connect() {
    this.timingBoxService.connect(this.ip, this.port);
  }

  disconnect() {
    this.timingBoxService.disconnect();
  }
}
