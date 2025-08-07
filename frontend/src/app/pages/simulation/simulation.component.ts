


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

    const response = await fetch('http://localhost:5000/api/Simulation/start', {
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