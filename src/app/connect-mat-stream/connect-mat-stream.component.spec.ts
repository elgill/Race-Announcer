import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectMatStreamComponent } from './connect-mat-stream.component';

describe('ConnectMatStreamComponent', () => {
  let component: ConnectMatStreamComponent;
  let fixture: ComponentFixture<ConnectMatStreamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectMatStreamComponent]
    });
    fixture = TestBed.createComponent(ConnectMatStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
