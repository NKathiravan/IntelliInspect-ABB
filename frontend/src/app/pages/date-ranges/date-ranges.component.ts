import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { NgChartsModule } from 'ng2-charts';
import {
  ChartOptions,
  ChartDataset
} from 'chart.js';

interface ValidationResponse {
  status: string;
  message: string;
  counts: {
    training: number;
    testing: number;
    simulation: number;
  };
  volumeBreakdown: Array<{
    month: string;
    value: number;
    period: 'training' | 'testing' | 'simulation' | 'none';
  }>;
}

@Component({
  selector: 'app-date-ranges',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgChartsModule],
  templateUrl: './date-ranges.component.html',
  styleUrls: ['./date-ranges.component.css']
})
export class DateRangesComponent {
  trainingStart = '';
  trainingEnd = '';
  testingStart = '';
  testingEnd = '';
  simulationStart = '';
  simulationEnd = '';

  minDate = '2021-01-01';
  maxDate = '2021-12-31';

  isValid = false;
  validated = false;
  validationMessage = '';
  recordCounts = { training: 0, testing: 0, simulation: 0 };
  chartVisible = false;

  barChartData = {
    labels: [] as string[],
    datasets: [{
      data: [] as number[],
      label: 'Records',
      backgroundColor: [] as string[]
    }]
  };

  barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Month' } },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Records' }
      }
    },
    plugins: {
      legend: { display: false },
      title: { display: false }
    }
  };

  constructor(private http: HttpClient, private router: Router) {}

  validateRanges(): void {
    this.isValid = false;
    this.validated = false;
    this.chartVisible = false;

    if (!this.areDatesInOrder()) {
      this.validationMessage = 'Date sequence is invalid or overlapping.';
      this.validated = true;
      return;
    }

    const payload = {
      training: { start: this.trainingStart, end: this.trainingEnd },
      testing: { start: this.testingStart, end: this.testingEnd },
      simulation: { start: this.simulationStart, end: this.simulationEnd }
    };

    this.http.post<ValidationResponse>('/api/DateRange/validate', payload).subscribe({
      next: (res) => {
        this.isValid = res.status === 'Valid';
        this.validated = true;
        this.validationMessage = res.message;
        this.recordCounts = res.counts;
        this.buildChart(res.volumeBreakdown);
      },
      error: () => {
        this.isValid = false;
        this.validated = true;
        this.validationMessage = 'Server error. Please try again.';
      }
    });
  }

  areDatesInOrder(): boolean {
    if (
      !this.trainingStart || !this.trainingEnd ||
      !this.testingStart || !this.testingEnd ||
      !this.simulationStart || !this.simulationEnd
    ) return false;

    const t1 = new Date(this.trainingStart).getTime();
    const t2 = new Date(this.trainingEnd).getTime();
    const t3 = new Date(this.testingStart).getTime();
    const t4 = new Date(this.testingEnd).getTime();
    const t5 = new Date(this.simulationStart).getTime();
    const t6 = new Date(this.simulationEnd).getTime();
    const min = new Date(this.minDate).getTime();
    const max = new Date(this.maxDate).getTime();

    return (
      t1 <= t2 &&
      t2 < t3 &&
      t3 <= t4 &&
      t4 < t5 &&
      t5 <= t6 &&
      t1 >= min &&
      t6 <= max
    );
  }

  buildChart(data: ValidationResponse['volumeBreakdown']) {
    const labels: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];

    data.forEach(entry => {
      labels.push(entry.month);
      values.push(entry.value);
      colors.push(
        entry.period === 'training' ? '#25c18e' :
        entry.period === 'testing' ? '#ffaa33' :
        entry.period === 'simulation' ? '#2b7bff' : '#ccc'
      );
    });

    this.barChartData = {
      labels,
      datasets: [{
        data: values,
        label: 'Records',
        backgroundColor: colors
      }]
    };

    this.chartVisible = true;
  }

  periodDuration(start: string, end: string): number {
    if (!start || !end) return 0;
    return Math.floor(
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24)
    ) + 1;
  }

  onNext() {
    if (this.isValid) {
      this.router.navigate(['/train-model']);
    }
  }
}
