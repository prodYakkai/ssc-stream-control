import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyGenModalComponent } from './key-gen-modal.component';

describe('KeyGenModalComponent', () => {
  let component: KeyGenModalComponent;
  let fixture: ComponentFixture<KeyGenModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyGenModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KeyGenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
