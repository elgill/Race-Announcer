import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectFileStreamComponent } from './connect-file-stream.component';

describe('ConnectFileStreamComponent', () => {
  let component: ConnectFileStreamComponent;
  let fixture: ComponentFixture<ConnectFileStreamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectFileStreamComponent]
    });
    fixture = TestBed.createComponent(ConnectFileStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
