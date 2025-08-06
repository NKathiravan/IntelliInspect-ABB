import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, switchMap, takeWhile } from 'rxjs';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent {
  simulationStarted = false;
  total = 0;
  pass = 0;
  fail = 0;
  avgConfidence = 0;

  tableRows: any[] = [];

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

  donutChartData: ChartData<'doughnut'> = {
    labels: ['Pass', 'Fail'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#28a745', '#dc3545']
      }
    ]
  };

  private simulationSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {}

  startSimulation() {
    if (this.simulationStarted) return;

    this.simulationStarted = true;

    this.simulationSubscription = interval(1000)
      .pipe(
        switchMap(() =>
          this.http.post<any>('http://localhost:5144/api/Simulation/start', {})
        ),
        takeWhile(row => !!row) // Stop if backend returns null/undefined
      )
      .subscribe({
        next: (row) => {
          this.processRow(row);
        },
        error: () => {
          console.error('Simulation fetch failed');
        }
      });
  }

  private processRow(row: any) {
    this.total++;
    if (row.prediction === 1) this.pass++;
    else this.fail++;

    this.avgConfidence =
      ((this.avgConfidence * (this.total - 1)) + row.confidence * 100) / this.total;

    // Update line chart
    this.lineChartData.labels?.push(new Date(row.timestamp).toLocaleTimeString());
    (this.lineChartData.datasets[0].data as number[]).push(row.confidence * 100);

    // Limit chart to 20 points
    if (this.lineChartData.labels!.length > 20) {
      this.lineChartData.labels!.shift();
      (this.lineChartData.datasets[0].data as number[]).shift();
    }

    // Update donut chart
    this.donutChartData.datasets[0].data = [this.pass, this.fail];

    // Update table
    this.tableRows.unshift({
      time: new Date(row.timestamp).toLocaleTimeString(),
      sample_id: row.sample_id,
      prediction: row.prediction,
      confidence: (row.confidence * 100).toFixed(2)
    });

    if (this.tableRows.length > 50) {
      this.tableRows.pop();
    }
  }
}
