import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  isDragging = false;

  constructor(private apiService: ApiService) {}

  @Output() nextStep = new EventEmitter<void>();

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.handleFileUpload(file);
  }

  triggerFileInput(): void {
    const input = document.getElementById('fileInput');
    input?.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.handleFileUpload(file);
    }
  }

  handleFileUpload(file: File): void {
    if (!file || file.type !== 'text/csv') return;

    this.fileName = file.name;
    this.fileSize = (file.size / 1024).toFixed(1) + ' KB';
    this.fileURL = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.apiService.postFile(formData).subscribe({
      next: (res: any) => {
        this.columnCount = res.totalColumns;
        this.recordCount = res.totalRows;
        this.passRate = res.passRate;
        this.startDate = res.startTimestamp;
        this.endDate = res.endTimestamp;
        this.fileUploaded = true;
      },
      error: (err) => {
        console.error('Error uploading file:', err);
      },
    });
  }

  onNext(): void {
    this.nextStep.emit();
  }
}