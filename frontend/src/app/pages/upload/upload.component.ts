import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // ✅ ADD this
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent {
  fileUploaded = false;
  fileName = '';
  fileSize = '';
  fileURL = '';
  recordCount = 0;
  columnCount = 5;
  passRate = 70;
  startDate = '2021-01-01';
  endDate = '2021-12-31';

  constructor(private apiService: ApiService, private router: Router) {} // ✅ Router injected

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.fileSize = (file.size / 1024).toFixed(1) + ' KB';
      this.fileURL = URL.createObjectURL(file);

      const formData = new FormData();
      formData.append('file', file, file.name);

      this.apiService.postFile(formData).subscribe({
        next: (res: any) => {
          console.log('File uploaded successfully:', res);
          this.columnCount = res.totalColumns;
          this.recordCount = res.totalRows;
          this.passRate = res.passRate;
          this.startDate = res.startTimestamp;
          this.endDate = res.endTimestamp;
          this.fileUploaded = true;

        },
        error: (error: any) => {
          console.error('Error uploading file:', error);
        }
      });
    }
  }

  @Output() nextStep = new EventEmitter<void>();  // Add this

  onNext(): void {
    // this.router.navigate(['/date-ranges']); // ✅ Navigate to Screen 2
    this.nextStep.emit();
  }
}
