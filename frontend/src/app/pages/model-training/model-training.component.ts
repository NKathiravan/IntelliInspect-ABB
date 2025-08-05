import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-model-training',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './model-training.component.html',
  styleUrls: ['./model-training.component.css']
})
export class ModelTrainingComponent {
  isTrainingStarted = false;

  metrics = {
    accuracy: 0.91,
    precision: 0.88,
    recall: 0.85,
    f1Score: 0.86,
  };

  startTraining() {
    this.isTrainingStarted = true;
  }
}
