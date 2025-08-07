import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { DateRangeService } from '../../services/date-range.service';


@Component({
  selector: 'app-model-training',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './model-training.component.html',
  styleUrls: ['./model-training.component.css']
})
export class ModelTrainingComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();

  trainStart = '';
  trainEnd = '';
  testStart = '';
  testEnd = '';

  isTrained = false;
  loading = false;
  statusMessage = '';
  metrics = {
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1_Score: 0
  };

  trainingChartImage = '';
  donutChartImage = '';

  constructor(private http: HttpClient, private dateRangeService: DateRangeService) {}

  ngOnInit(): void {
    const payload = this.dateRangeService.getRanges();
    this.trainStart = payload.trainStart;
    this.trainEnd = payload.trainEnd;
    this.testStart = payload.testStart;
    this.testEnd = payload.testEnd;
  }

  onTrainModel(): void {
    this.loading = true;
    this.statusMessage = 'Training model...';

    const payload = {
      trainStart: this.trainStart,
      trainEnd: this.trainEnd,
      testStart: this.testStart,
      testEnd: this.testEnd
    };

    this.http.post<any>('http://localhost:5000/api/TrainModel', payload).subscribe({
      next: (res) => {
        this.metrics = res.metrics;
        this.trainingChartImage = 'data:image/png;base64,' + res.trainingChart;
        this.donutChartImage = 'data:image/png;base64,' + res.donutChart;
        this.statusMessage = res.message;
        this.isTrained = true;
        this.loading = false;
      },
      error: (err) => {
        this.statusMessage = 'Training failed. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onNext(): void {
    if (this.isTrained) {
      this.nextStep.emit();
    }
  }
}
