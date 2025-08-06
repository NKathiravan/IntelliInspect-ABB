import { Routes } from '@angular/router';

import { MasterComponent } from './pages/master/master.component';
import { UploadComponent } from './pages/upload/upload.component';
import { DateRangesComponent } from './pages/date-ranges/date-ranges.component';
import { ModelTrainingComponent } from './pages/model-training/model-training.component';
import { SimulationComponent } from './pages/simulation/simulation.component';

export const routes: Routes = [
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
  { path: 'upload', component: MasterComponent },
  // { path: 'date-ranges', component: DateRangesComponent },
  // { path: 'model-training', component: ModelTrainingComponent },
  // { path: 'simulation', component: SimulationComponent }
];
