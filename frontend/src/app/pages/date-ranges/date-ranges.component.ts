// import { Component, Output, EventEmitter } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { ChartOptions } from 'chart.js';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';
// import { NgChartsModule } from 'ng2-charts';

// interface ValidationResponse {
//   status: string;
//   message: string;
//   counts: { training: number; testing: number; simulation: number };
//   monthlyCounts: {
//     count: number;
//     month: string;
//     rangeType: 'Training' | 'Testing' | 'Simulation' | 'none';
//   }[];
// }

// @Component({
//   selector: 'app-date-ranges',
//   standalone: true,
//   imports: [CommonModule, FormsModule, HttpClientModule, NgChartsModule],
//   templateUrl: './date-ranges.component.html',
//   styleUrls: ['./date-ranges.component.css']
// })
// export class DateRangesComponent {
//   @Output() nextStep = new EventEmitter<void>();

//   trainingStartDate = '';
//   trainingEndDate = '';
//   trainingStartTime = '00:00:00';
//   trainingEndTime = '23:59:59';

//   testingStartDate = '';
//   testingEndDate = '';
//   testingStartTime = '00:00:00';
//   testingEndTime = '23:59:59';

//   simulationStartDate = '';
//   simulationEndDate = '';
//   simulationStartTime = '00:00:00';
//   simulationEndTime = '23:59:59';

//   isValid = false;
//   validated = false;
//   validationMessage = '';
//   chartVisible = false;

//   trainingData = {
//     labels: [] as string[],
//     datasets: [{ data: [] as number[], label: 'Training', backgroundColor: '#25c18e' }]
//   };

//   testingData = {
//     labels: [] as string[],
//     datasets: [{ data: [] as number[], label: 'Testing', backgroundColor: '#ffaa33' }]
//   };

//   simulationData = {
//     labels: [] as string[],
//     datasets: [{ data: [] as number[], label: 'Simulation', backgroundColor: '#2b7bff' }]
//   };

//   barChartOptions: ChartOptions<'bar'> = {
//     responsive: true,
//     scales: {
//       x: {
//         title: { display: true, text: 'Month' }
//       },
//       y: {
//         beginAtZero: true,
//         title: { display: true, text: 'Record Count' }
//       }
//     },
//     plugins: {
//       legend: { display: true }
//     }
//   };

//   constructor(private http: HttpClient) {}

//   validateRanges(): void {
//     this.isValid = false;
//     this.validated = false;
//     this.chartVisible = false;

//     const payload = {
//       training: {
//         start: `${this.trainingStartDate}T${this.trainingStartTime}Z`,
//         end: `${this.trainingEndDate}T${this.trainingEndTime}Z`
//       },
//       testing: {
//         start: `${this.testingStartDate}T${this.testingStartTime}Z`,
//         end: `${this.testingEndDate}T${this.testingEndTime}Z`
//       },
//       simulation: {
//         start: `${this.simulationStartDate}T${this.simulationStartTime}Z`,
//         end: `${this.simulationEndDate}T${this.simulationEndTime}Z`
//       }
//     };

//     this.http.post<ValidationResponse>('http://localhost:5144/api/DateRange/validate', payload).subscribe({
//       next: (res) => {
//         this.isValid = res.status === 'Valid';
//         this.validated = true;
//         this.validationMessage = res.message;
//         this.chartVisible = true;
//         this.buildCharts(res.monthlyCounts);
//       },
//       error: () => {
//         this.isValid = false;
//         this.validated = true;
//         this.validationMessage = 'Server error. Please try again.';
//       }
//     });
//   }
//   buildCharts(data: ValidationResponse['monthlyCounts']) {
//   const trainingLabels: string[] = [];
//   const trainingValues: number[] = [];

//   const testingLabels: string[] = [];
//   const testingValues: number[] = [];

//   const simulationLabels: string[] = [];
//   const simulationValues: number[] = [];

//   data.forEach(entry => {
//     if (entry.rangeType === 'Training') {
//       trainingLabels.push(entry.month);
//       trainingValues.push(+entry.count); // convert to number
//     } else if (entry.rangeType === 'Testing') {
//       testingLabels.push(entry.month);
//       testingValues.push(+entry.count);
//     } else if (entry.rangeType === 'Simulation') {
//       simulationLabels.push(entry.month);
//       simulationValues.push(+entry.count);
//     }
//   });

//   this.trainingData = {
//     labels: trainingLabels,
//     datasets: [{
//       data: trainingValues,
//       label: 'Training',
//       backgroundColor: '#25c18e'
//     }]
//   };

//   this.testingData = {
//     labels: testingLabels,
//     datasets: [{
//       data: testingValues,
//       label: 'Testing',
//       backgroundColor: '#ffaa33'
//     }]
//   };

//   this.simulationData = {
//     labels: simulationLabels,
//     datasets: [{
//       data: simulationValues,
//       label: 'Simulation',
//       backgroundColor: '#2b7bff'
//     }]
//   };
// }


//   onNext(): void {
//     if (this.isValid) {
//       this.nextStep.emit();
//     }
//   }
// }
import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { DateRangeService } from '../../services/date-range.service';


interface ValidationResponse {
  status: string;
  message: string;
  counts: { training: number; testing: number; simulation: number };
  monthlyCounts: {
    count: number;
    month: string;
    rangeType: 'Training' | 'Testing' | 'Simulation' | 'none';
  }[];
}

@Component({
  selector: 'app-date-ranges',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgChartsModule],
  templateUrl: './date-ranges.component.html',
  styleUrls: ['./date-ranges.component.css']
})
export class DateRangesComponent {
  @Output() nextStep = new EventEmitter<void>();

  trainingStartDate = '';
  trainingEndDate = '';
  trainingStartTime = '00:00:00';
  trainingEndTime = '23:59:59';

  testingStartDate = '';
  testingEndDate = '';
  testingStartTime = '00:00:00';
  testingEndTime = '23:59:59';

  simulationStartDate = '';
  simulationEndDate = '';
  simulationStartTime = '00:00:00';
  simulationEndTime = '23:59:59';

  isValid = false;
  validated = false;
  validationMessage = '';
  chartVisible = false;

  trainingData = {
    labels: [] as string[],
    datasets: [{ data: [] as number[], label: 'Training', backgroundColor: '#25c18e' }]
  };

  testingData = {
    labels: [] as string[],
    datasets: [{ data: [] as number[], label: 'Testing', backgroundColor: '#ffaa33' }]
  };

  simulationData = {
    labels: [] as string[],
    datasets: [{ data: [] as number[], label: 'Simulation', backgroundColor: '#2b7bff' }]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Month' } },
      y: { beginAtZero: true, title: { display: true, text: 'Record Count' } }
    },
    plugins: { legend: { display: true } }
  };

constructor(private http: HttpClient, private dateRangeService: DateRangeService) {}


  validateRanges(): void {
    this.isValid = false;
    this.validated = false;
    this.chartVisible = false;

    const payload = {
      training: {
        start: `${this.trainingStartDate}T${this.trainingStartTime}Z`,
        end: `${this.trainingEndDate}T${this.trainingEndTime}Z`
      },
      testing: {
        start: `${this.testingStartDate}T${this.testingStartTime}Z`,
        end: `${this.testingEndDate}T${this.testingEndTime}Z`
      },
      simulation: {
        start: `${this.simulationStartDate}T${this.simulationStartTime}Z`,
        end: `${this.simulationEndDate}T${this.simulationEndTime}Z`
      }
    };

    this.http.post<ValidationResponse>('http://localhost:5144/api/DateRange/validate', payload).subscribe({
      next: (res) => {
        this.isValid = res.status === 'Valid';
        this.validated = true;
        this.validationMessage = res.message;
        this.chartVisible = true;
        this.buildCharts(res.monthlyCounts);

        if (this.isValid) {
          this.dateRangeService.setRanges(
            payload.training.start,
            payload.training.end,
            payload.testing.start,
            payload.testing.end
          );
        }
      },
      error: () => {
        this.isValid = false;
        this.validated = true;
        this.validationMessage = 'Server error. Please try again.';
      }
    });
  }

  buildCharts(data: ValidationResponse['monthlyCounts']) {
    const trainingLabels: string[] = [];
    const trainingValues: number[] = [];

    const testingLabels: string[] = [];
    const testingValues: number[] = [];

    const simulationLabels: string[] = [];
    const simulationValues: number[] = [];

    data.forEach(entry => {
      if (entry.rangeType === 'Training') {
        trainingLabels.push(entry.month);
        trainingValues.push(+entry.count);
      } else if (entry.rangeType === 'Testing') {
        testingLabels.push(entry.month);
        testingValues.push(+entry.count);
      } else if (entry.rangeType === 'Simulation') {
        simulationLabels.push(entry.month);
        simulationValues.push(+entry.count);
      }
    });

    this.trainingData = {
      labels: trainingLabels,
      datasets: [{ data: trainingValues, label: 'Training', backgroundColor: '#25c18e' }]
    };

    this.testingData = {
      labels: testingLabels,
      datasets: [{ data: testingValues, label: 'Testing', backgroundColor: '#ffaa33' }]
    };

    this.simulationData = {
      labels: simulationLabels,
      datasets: [{ data: simulationValues, label: 'Simulation', backgroundColor: '#2b7bff' }]
    };
  }

  onNext(): void {
    if (this.isValid) {
      this.nextStep.emit();
    }
  }
}
