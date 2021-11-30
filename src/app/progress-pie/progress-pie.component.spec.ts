import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressPieComponent } from './progress-pie.component';

describe('ProgressPieComponent', () => {
  let component: ProgressPieComponent;
  let fixture: ComponentFixture<ProgressPieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressPieComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
