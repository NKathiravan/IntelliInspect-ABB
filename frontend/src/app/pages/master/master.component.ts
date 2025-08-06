import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UploadComponent } from "../upload/upload.component";
import { DateRangesComponent } from "../date-ranges/date-ranges.component";
import { ModelTrainingComponent } from "../model-training/model-training.component";
import { SimulationComponent } from "../simulation/simulation.component";

@Component({
  selector: 'app-master',
  imports: [CommonModule, UploadComponent, DateRangesComponent, ModelTrainingComponent, SimulationComponent],
  templateUrl: './master.component.html',
  styleUrl: './master.component.css'
})
export class MasterComponent {
  currentStep: number = 0;

  goToNextStep(): void {
    this.currentStep++;
  }
}
