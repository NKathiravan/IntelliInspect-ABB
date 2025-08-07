import { Routes } from '@angular/router';

import { MasterComponent } from './pages/master/master.component';
import { UploadComponent } from './pages/upload/upload.component';
import { DateRangesComponent } from './pages/date-ranges/date-ranges.component';
import { ModelTrainingComponent } from './pages/model-training/model-training.component';
import { SimulationComponent } from './pages/simulation/simulation.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'master', component: MasterComponent },
  {path: 'login',component: LoginComponent},
  // { path: 'date-ranges', component: DateRangesComponent },
  // { path: 'model-training', component: ModelTrainingComponent },
  { path: 'simulation', component: SimulationComponent }
];
