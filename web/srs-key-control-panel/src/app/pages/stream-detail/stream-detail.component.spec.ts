import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamDetailComponent } from './stream-detail.component';

describe('StreamDetailComponent', () => {
  let component: StreamDetailComponent;
  let fixture: ComponentFixture<StreamDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
