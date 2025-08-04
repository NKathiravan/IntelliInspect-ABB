import { Routes } from '@angular/router';
import { UploadComponent } from './pages/upload/upload.component';
import { DateRanges } from './pages/date-ranges/date-ranges';
import { TrainModel } from './pages/train-model/train-model';
import { Simulation } from './pages/simulation/simulation';

export const routes: Routes = [
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
  { path: 'upload', component: UploadComponent },
  { path: 'date-ranges', component: DateRanges },
  { path: 'train-model', component: TrainModel },
  { path: 'simulation', component: Simulation }
];
