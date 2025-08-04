import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainModel } from './train-model';

describe('TrainModel', () => {
  let component: TrainModel;
  let fixture: ComponentFixture<TrainModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
