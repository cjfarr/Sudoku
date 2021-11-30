import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputButtonTrayComponent } from './input-button-tray.component';

describe('InputButtonTrayComponent', () => {
  let component: InputButtonTrayComponent;
  let fixture: ComponentFixture<InputButtonTrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputButtonTrayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputButtonTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
