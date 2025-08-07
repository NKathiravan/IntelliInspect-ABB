import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

// Import standalone components
import { UploadComponent } from '../upload/upload.component';
import { DateRangesComponent } from '../date-ranges/date-ranges.component';
import { ModelTrainingComponent } from '../model-training/model-training.component';
import { SimulationComponent } from '../simulation/simulation.component';

@Component({
  selector: 'app-master',
  standalone: true, // ✅ Required for using standalone components
  imports: [
    CommonModule,
    UploadComponent,
    DateRangesComponent,
    ModelTrainingComponent,
    SimulationComponent
  ],
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent {
  currentStep = 0;

  goToNextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
}
