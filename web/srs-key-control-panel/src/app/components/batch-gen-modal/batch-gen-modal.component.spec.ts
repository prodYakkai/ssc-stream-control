import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchGenModalComponent } from './batch-gen-modal.component';

describe('BatchGenModalComponent', () => {
  let component: BatchGenModalComponent;
  let fixture: ComponentFixture<BatchGenModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchGenModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BatchGenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
