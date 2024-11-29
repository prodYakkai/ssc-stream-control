import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationManageComponent } from './destination-manage.component';

describe('DestinationManageComponent', () => {
  let component: DestinationManageComponent;
  let fixture: ComponentFixture<DestinationManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
