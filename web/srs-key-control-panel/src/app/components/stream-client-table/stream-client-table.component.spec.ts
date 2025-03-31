import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamClientTableComponent } from './stream-client-table.component';

describe('StreamClientTableComponent', () => {
  let component: StreamClientTableComponent;
  let fixture: ComponentFixture<StreamClientTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamClientTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamClientTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
