import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartType } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent {
  simulationStarted = false;
  simulationData: any[] = [];

  total = 0;
  pass = 0;
  fail = 0;
  avgConfidence = 0;

  // Line chart for real-time confidence
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Confidence (%)',
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Donut chart for prediction breakdown
  donutChartData: ChartData<'doughnut'> = {
    labels: ['Pass', 'Fail'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#28a745', '#dc3545']
      }
    ]
  };

  tableRows: any[] = [];

  private simulationSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {}

  startSimulation() {
    if (this.simulationStarted) return;

    this.simulationStarted = true;

    this.http.post<any[]>('http://localhost:8000/simulate', {}).subscribe({
      next: (rows) => {
        let index = 0;

        this.simulationSubscription = interval(1000).subscribe(() => {
          if (index >= rows.length) {
            this.simulationSubscription?.unsubscribe();
            return;
          }

          const row = rows[index++];
          this.simulationData.push(row);
          this.processRow(row);
        });
      },
      error: () => {
        console.error('Failed to start simulation.');
      }
    });
  }

  private processRow(row: any) {
    this.total++;
    if (row.prediction === 1) this.pass++;
    else this.fail++;

    this.avgConfidence = ((this.avgConfidence * (this.total - 1)) + row.confidence * 100) / this.total;

    // ⬇️ Update line chart
    this.lineChartData.labels?.push(new Date(row.timestamp).toLocaleTimeString());
    (this.lineChartData.datasets[0].data as number[]).push(row.confidence * 100);

    // ⬇️ Update donut chart
    this.donutChartData.datasets[0].data = [this.pass, this.fail];

    // ⬇️ Add to table
    this.tableRows.unshift({
      time: new Date(row.timestamp).toLocaleTimeString(),
      sample_id: row.sample_id,
      prediction: row.prediction,
      confidence: (row.confidence * 100).toFixed(2)
    });

    if (this.lineChartData.labels!.length > 20) {
      this.lineChartData.labels!.shift();
      (this.lineChartData.datasets[0].data as number[]).shift();
    }
  }
}
