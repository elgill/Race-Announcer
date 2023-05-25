import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseRunnersComponent } from './browse-runners.component';

describe('BrowseRunnersComponent', () => {
  let component: BrowseRunnersComponent;
  let fixture: ComponentFixture<BrowseRunnersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BrowseRunnersComponent]
    });
    fixture = TestBed.createComponent(BrowseRunnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
