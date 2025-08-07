// import { Component, OnDestroy } from '@angular/core';
// import { CommonModule, DecimalPipe } from '@angular/common';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { NgChartsModule } from 'ng2-charts';
// import { ChartConfiguration, ChartType } from 'chart.js';
// import { Subscription, interval } from 'rxjs';
// import { SimulationService } from '../../services/simulation.service';

// @Component({
//   selector: 'app-simulation',
//   standalone: true,
//   imports: [CommonModule, NgChartsModule, HttpClientModule],
//   providers: [DecimalPipe],
//   templateUrl: './simulation.component.html',
//   styleUrls: ['./simulation.component.css']
// })
// export class SimulationComponent implements OnDestroy {
//   simulationStarted = false;
//   subscription!: Subscription;

//   // Data variables
//   tableRows: any[] = [];
//   total = 0;
//   pass = 0;
//   fail = 0;
//   avgConfidence = 0;

//   // Charts
//   lineChartData: ChartConfiguration<'line'>['data'] = {
//     labels: [],
//     datasets: [
//       {
//         data: [],
//         label: 'Prediction Over Time',
//         borderColor: '#3e95cd',
//         fill: false
//       }
//     ]
//   };

//   donutChartData: ChartConfiguration<'doughnut'>['data'] = {
//     labels: ['Pass', 'Fail'],
//     datasets: [
//       {
//         data: [0, 0],
//         backgroundColor: ['#4caf50', '#f44336']
//       }
//     ]
//   };

//   constructor(
//     private http: HttpClient,
//     private decimalPipe: DecimalPipe,
//     private simulationService: SimulationService
//   ) {}

//   startSimulation(): void {
//     const { StartDate, EndDate } = this.simulationService.getRanges();

//     const payload = {
//       start: StartDate,
//       end: EndDate
//     };

//     this.simulationStarted = true;

//     this.http.post<any[]>('http://localhost:5144/api/Simulation/start', payload).subscribe((data) => {
//       let index = 0;

//       this.subscription = interval(1000).subscribe(() => {
//         if (index >= data.length) {
//           this.subscription.unsubscribe();
//           return;
//         }

//         const row = data[index++];
//         this.updateUI(row);
//       });
//     });
//   }

//   updateUI(row: any): void {
//     // Update table
//     this.tableRows.unshift({
//       time: row.timestamp,
//       sample_id: row.sample_id,
//       prediction: row.prediction,
//       confidence: row.confidence
//     });

//     // Update stats
//     this.total++;
//     if (row.prediction.toLowerCase() === 'pass') {
//       this.pass++;
//     } else {
//       this.fail++;
//     }

//     const totalConfidence = this.tableRows.reduce((sum, r) => sum + r.confidence, 0);
//     this.avgConfidence = totalConfidence / this.total;

//     // Update line chart
//     const timestamp = new Date(row.timestamp).toLocaleTimeString();
//     this.lineChartData.labels!.push(timestamp);
//     this.lineChartData.datasets[0].data.push(row.confidence);

//     if (this.lineChartData.labels!.length > 20) {
//       this.lineChartData.labels!.shift();
//       this.lineChartData.datasets[0].data.shift();
//     }

//     // Update donut chart
//     this.donutChartData.datasets[0].data = [this.pass, this.fail];
//   }

//   ngOnDestroy(): void {
//     if (this.subscription) {
//       this.subscription.unsubscribe();
//     }
//   }
// }
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { NgChartsModule } from 'ng2-charts';
// import { ChartData } from 'chart.js';
// import { HttpClient } from '@angular/common/http';
// import { interval, Subscription, switchMap, takeWhile } from 'rxjs';

// @Component({
//   selector: 'app-simulation',
//   standalone: true,
//   imports: [CommonModule, NgChartsModule],
//   templateUrl: './simulation.component.html',
//   styleUrls: ['./simulation.component.css']
// })
// export class SimulationComponent {
//   simulationStarted = false;
//   total = 0;
//   pass = 0;
//   fail = 0;
//   avgConfidence = 0;

//   tableRows: any[] = [];

//   lineChartData: ChartData<'line'> = {
//     labels: [],
//     datasets: [
//       {
//         data: [],
//         label: 'Confidence (%)',
//         borderColor: '#007bff',
//         backgroundColor: 'rgba(0,123,255,0.2)',
//         fill: true,
//         tension: 0.4
//       }
//     ]
//   };

//   donutChartData: ChartData<'doughnut'> = {
//     labels: ['Pass', 'Fail'],
//     datasets: [
//       {
//         data: [0, 0],
//         backgroundColor: ['#28a745', '#dc3545']
//       }
//     ]
//   };

//   private simulationSubscription: Subscription | null = null;

//   constructor(private http: HttpClient) {}

//   startSimulation() {
//     if (this.simulationStarted) return;

//     this.simulationStarted = true;

//     this.simulationSubscription = interval(1000)
//       .pipe(
//         switchMap(() =>
//           this.http.post<any>('http://localhost:5144/api/Simulation/start', {})
//         ),
//         takeWhile(row => !!row) // Stop if backend returns null/undefined
//       )
//       .subscribe({
//         next: (row) => {
//           this.processRow(row);
//         },
//         error: () => {
//           console.error('Simulation fetch failed');
//         }
//       });
//   }

//   private processRow(row: any) {
//     this.total++;
//     if (row.prediction === 1) this.pass++;
//     else this.fail++;

//     this.avgConfidence =
//       ((this.avgConfidence * (this.total - 1)) + row.confidence * 100) / this.total;

//     // Update line chart
//     this.lineChartData.labels?.push(new Date(row.timestamp).toLocaleTimeString());
//     (this.lineChartData.datasets[0].data as number[]).push(row.confidence * 100);

//     // Limit chart to 20 points
//     if (this.lineChartData.labels!.length > 20) {
//       this.lineChartData.labels!.shift();
//       (this.lineChartData.datasets[0].data as number[]).shift();
//     }

//     // Update donut chart
//     this.donutChartData.datasets[0].data = [this.pass, this.fail];

//     // Update table
//     this.tableRows.unshift({
//       time: new Date(row.timestamp).toLocaleTimeString(),
//       sample_id: row.sample_id,
//       prediction: row.prediction,
//       confidence: (row.confidence * 100).toFixed(2)
//     });

//     if (this.tableRows.length > 50) {
//       this.tableRows.pop();
//     }
//   }
// }


// import { Component } from '@angular/core';
// import { DecimalPipe, CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-simulation',
//   standalone: true, // 👈 ensure this is set
//   imports: [CommonModule, DecimalPipe], // ✅ Add DecimalPipe here
//   templateUrl: './simulation.component.html'
// })
// export class SimulationComponent {
//   messages: any[] = [];
//   simulationStarted = false;

//   async startSimulation() {
//     this.simulationStarted = true;

//     const startDate = '2021-01-01T02:11:17Z';
//     const endDate = '2021-01-01T02:39:29Z';

//     const response = await fetch('http://localhost:5144/api/Simulation/start', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ StartDate: startDate, EndDate: endDate })
//     });

//     if (!response.body) {
//       console.error('No response body found');
//       return;
//     }

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder('utf-8');
//     let buffer = '';

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;

//       buffer += decoder.decode(value, { stream: true });

//       let lines = buffer.split('\n');
//       buffer = lines.pop() || '';

//       for (let line of lines) {
//         try {
//           if (line.trim() === '') continue; // Skip empty lines
//           if (line.startsWith('data:')) {
//         line = line.replace(/^data:\s*/g, ''); // Remove all "data: " prefixes
//       }
//       if (line.startsWith('data:')) {
//         line = line.replace(/^data:\s*/g, ''); // Remove all "data: " prefixes
//       }
//       // if(line.endsWith('}}')) {
//       //   line = line.slice(0, -1); // Remove the last character if it ends with '}' to avoid parsing errors
//       // }
//       const safeLine = line.replace(/\bNaN\b/g, 'null');
// const obj = JSON.parse(safeLine);
//       const parsed = JSON.parse(safeLine);
      
//       const { timestamp, sample_id, prediction, confidence, label , sensor_data} = parsed;

//           this.messages.push({ timestamp, sample_id, prediction, confidence, label });
//         } catch (err) {
//           console.error('Failed to parse line:', line);
//         }
//       }
//     }
//   }
// }


import { Component } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule, DecimalPipe, NgChartsModule],
  templateUrl: './simulation.component.html',
})
export class SimulationComponent {
  messages: any[] = [];
  simulationStarted = false;
  displaystream=true;

  // Stats
  total = 0;
  pass = 0;
  fail = 0;
  avgConfidence = 0;

  // Line chart data for quality score (pass %)
  qualityScoreLabels: string[] = [];
  qualityScoreData: number[] = [];

  // Doughnut chart config for average confidence
  // doughnutChartLabels = ['Confidence %'];
  // doughnutChartData = [{ data: [0, 100], label: 'Confidence' }];
  // doughnutChartType: ChartType = 'doughnut';
  doughnutChartData: ChartData<'doughnut'> = {
  labels: ['Confidence', 'Remaining'],
  datasets: [
    {
      data: [0, 100],
      label: 'Confidence',
      backgroundColor: ['#4caf50', '#e0e0e0'],
    }
  ]
};

doughnutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  cutout: '70%',
};

  async startSimulation() {
    this.simulationStarted = true;
    this.displaystream=true;

    const startDate = '2021-01-01T00:00:01Z';
    const endDate = '2021-01-01T02:39:29Z';

    const response = await fetch('http://localhost:5144/api/Simulation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ StartDate: startDate, EndDate: endDate })
    });

    if (!response.body) {
      console.error('No response body found');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (let line of lines) {
        try {
          if (line.trim() === '') continue;
          if (line.startsWith('data:')) {
            line = line.replace(/^data:\s*/g, '');
          }
          if (line.startsWith('data:')) {
            line = line.replace(/^data:\s*/g, '');
          }

          const safeLine = line.replace(/\bNaN\b/g, 'null');
          const parsed = JSON.parse(safeLine);
          const { timestamp, sample_id, prediction, confidence, label } = parsed;

          this.messages.push({ timestamp, sample_id, prediction, confidence, label });

          // Update live stats
          this.total++;
          if (prediction == 1) this.pass++;
          else this.fail++;

          this.avgConfidence = (this.avgConfidence * (this.total - 1) + confidence * 100) / this.total;

          // Update quality score (pass % over total)
          const qualityScore = (this.pass / this.total) * 100;
          this.qualityScoreLabels.push(new Date(timestamp).toLocaleTimeString());
          this.qualityScoreData.push(+qualityScore.toFixed(2));

          // Update doughnut chart
          // this.doughnutChartData = [{ data: [this.avgConfidence, 100 - this.avgConfidence] }];
          this.doughnutChartData.datasets[0].data = [
  +this.avgConfidence.toFixed(2),
  +(100 - this.avgConfidence).toFixed(2)
];

        } catch (err) {
          console.error('Failed to parse line:', line);
        }
      }
    }
  }
  
}