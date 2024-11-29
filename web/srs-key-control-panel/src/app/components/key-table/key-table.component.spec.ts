import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyTableComponent } from './key-table.component';

describe('KeyTableComponent', () => {
  let component: KeyTableComponent;
  let fixture: ComponentFixture<KeyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KeyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
